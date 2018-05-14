import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { isEqual } from 'lodash';
import { LocalStorageService } from 'angular-2-local-storage';

// https://scotch.io/tutorials/protecting-angular-v2-routes-with-canactivatecanactivatechild-guards#toc-authentication-guard
// https://www.youtube.com/watch?v=WveRq-tlb6I
// https://www.youtube.com/watch?v=wswK6AzgvTE

@Injectable()
export class UserService {

  private user: User;
  private userSetTime: number; // in milliseconds
  private jwtExp: number; // in seconds
  private jwtRefreshTokenExp: number; // in seconds
  private refreshJwtTimeoutId: any;
  private refreshUserTimeoutId: any;
  private tabId: number;

  userObservable: BehaviorSubject<User> = new BehaviorSubject<User>(this.user);

  nav: NavObj;

  // Local storage variables
  // user-service-jwt-exp // <number>
  // user-service-jwt-refresh-token-exp // <number> a proxy for isLoggedIn
  // user-service-user // <User>
  // user-service-user-set-time // <number>, in milliseconds
  // user-service-is-refreshing // <boolean>

  constructor( private http: HttpClient,
      private router: Router,
      private localStorageService: LocalStorageService) {
    this.tabId = this._insecureRandomNumber();

    // Check if user is logged in. Note that because the JWT is stored in the
    // HTTP cookie, the front-end can't see the JWT.
    this.jwtRefreshTokenExp =
        this.localStorageService.get('user-service-jwt-refresh-token-exp');
    if (this.jwtRefreshTokenExp && Date.now() / 1000 < this.jwtRefreshTokenExp) {
      this.refreshJwt();
      // TODO: update user needs to wait until after refreshJwt
      this.updateUserDetails();
    } else {
      this.jwtRefreshTokenExp = undefined;
    }
  }

  /**
  * Extrenal facing method for authentication routes to use
  */
  authenticationResult({user, jwtExp, jwtRefreshTokenExp}) {
    this.jwtExp = jwtExp;
    this.jwtRefreshTokenExp = jwtRefreshTokenExp;

    this.localStorageService.add('user-service-jwt-exp', this.jwtExp);
    this.localStorageService.add('user-service-jwt-refresh-token-exp',
        this.jwtRefreshTokenExp);

    this._setUser(user);
  }

  /**
  * Internal method that checks if the user being set is different to the one
  * currently set. Sends a subscription event if the user has changed.
  */
  private _setUser(user) {
    if (!isEqual(this.user, user)) {
      this.user = user;
      this.userSetTime = Date.now();
      this.userObservable.next(this.user);

      // Store user in local storage
      this.localStorageService.add('user-service-user', this.user); // TODO check this works
      this.localStorageService.add('user-service-user-set-time', this.userSetTime);
    }
  }

  // TODO create a checker that sees if the user is updated in local storage
  userChecker () {
    // setTimeout
    const self = this;
    this.refreshUserTimeoutId =
        setTimeout(function() { self.userChecker(); }, 1000);
    const lsUserSetTime = this.localStorageService.get('user-service-user-set-time');
    if (this.userSetTime < lsUserSetTime) {
      // this.userSetTime = lsUserSetTime;
      const lsUser = this.localStorageService.get('user-set-time');
      if (!isEqual(this.user, lsUser)) {
        // this.user = lsUser;
        this.userObservable.next(this.user);
      }
    }
  }

  // TODO Separate out the refreshing from refreshing attempt. Make this an
  // observable.
  refreshJwt() {
    const self = this;
    const isRefreshing =
        this.localStorageService.get('user-service-is-refreshing');

    // If another tab is checking, wait for a response
    if (isRefreshing) { // currently checking, come back soon, say 1 second
      this.refreshJwtTimeoutId =
          setTimeout(function() { self.refreshJwt(); }, 1000);
      return;
    }
    // If the expiry time has changed, update expiry and wait until next time
    const lsJwtExp =
        Number(this.localStorageService.get('user-service-jwt-exp'));
    if (this.jwtExp && lsJwtExp > this.jwtExp) {
      this.jwtExp = lsJwtExp;
      this._setRefreshJwt();
      // we shouldn't have to update user in this section because it is updated
      // elsewhere
      return;
    }

    // If this happens to be the lucky app that is refreshing
    this.localStorageService.add('user-service-is-refreshing', true);
    this.http.get<any>('/api/user/refresh-jwt')
        .subscribe(response => {
          this.jwtExp = response.jwtExp;
          this.localStorageService.add('user-service-jwt-exp', this.jwtExp);
          this.localStorageService.remove('user-service-is-refreshing');

          this._setRefreshJwt();
        },
        errorResponse => {
          // On failure
          this.localStorageService.remove('user-service-is-refreshing');
          if (errorResponse.status === 401) {
            // clear all data jwt and user
            // call next on user observable
          }
        });
        // On failure (timeout), tries again in 10 seconds
            // gives up after 1 minute
            // directs to /login page
  }

  private _setRefreshJwt () {
    const self = this;
    // Call a refresh token 15 seconds before expiry
    const refreshTime = (this.jwtExp - 15) * 1000;
    const refreshDuration = refreshTime - Date.now();
    clearTimeout(this.refreshJwtTimeoutId);
    this.refreshJwtTimeoutId =
        setTimeout(function() { self.refreshJwt(); }, refreshDuration);
  }

  updateUserDetails() {
    this.http.get<User>('/api/user/details')
        .subscribe((user) => {
          this._setUser(user);
        });
  }

  isLoggedIn() {
    if (this.user &&
        this.jwtExp &&
        Math.round(Date.now() / 1000) < this.jwtExp) {
      return true;
    } else {
      return false;
    }
  }

  successNavigate(defaultNav) {
    if (this.nav) {
      this.router.navigateByUrl(this.nav.route);
    } else if (defaultNav) {
      this.router.navigateByUrl(defaultNav);
    } else {
      this.router.navigateByUrl('/');
    }
  }

  logOut() {
    // Send message to server
    this.http.post('/api/user/logout', {})
        .subscribe(() => {
          // Clean up old data
          this.user = undefined;
          this.jwtExp = undefined;
          this.jwtRefreshTokenExp = undefined;
          clearTimeout(this.refreshJwtTimeoutId);

          // TODO clear localstorage

          // inform the rest of the app that a log out has occurred
          this.userObservable.next(this.user);
          // go to default location
          this.router.navigateByUrl('/');
        });
  }

  private _insecureRandomNumber() {
    return Math.floor(1000000000000 * Math.random());
  }
}

interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

interface NavObj {
  route: string;
  data?: any;
}
