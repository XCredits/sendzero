import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { isEqual } from 'lodash';

// https://scotch.io/tutorials/protecting-angular-v2-routes-with-canactivatecanactivatechild-guards#toc-authentication-guard
// https://www.youtube.com/watch?v=WveRq-tlb6I
// https://www.youtube.com/watch?v=wswK6AzgvTE

@Injectable()
export class UserService {

  private user: User;
  private jwtExp: number;
  private jwtRefreshTokenExp: number;
  private refreshTimeoutId: any;
  userObservable: BehaviorSubject<User> = new BehaviorSubject<User>(this.user);

  nav: NavObj;

  constructor( private http: HttpClient,
      private router: Router ) {
    console.log("running constructor");
    this.refreshJwt();
    this.updateUserDetails();
  }

  /**
  * Extrenal facing method for authentication routes to use
  */
  storeUser({user, jwtExp, jwtRefreshTokenExp}) {
    this.jwtExp = jwtExp;
    this.jwtRefreshTokenExp = jwtRefreshTokenExp;
    this._setUser(user);
  }

  /**
  * Internal method that checks if the user being set is different to the one
  * currently set. Sends a subscription event if the user has changed.
  */
  private _setUser(user) {
    if (!isEqual(this.user, user)) {
      this.user = user;
      this.userObservable.next(this.user);
    }
  }

  refreshJwt() {
    console.log("Refreshing");
    console.log(this);
    this.http.get<any>('/api/user/refresh-jwt')
        .subscribe((response) => {
          console.log("Now: " + Math.round(Date.now() / 1000));
          console.log("jwt: " + response.jwtExp);
          this.jwtExp = response.jwtExp;
          // Call a refresh token 15 seconds before
          const refreshTime = (this.jwtExp - 15) * 1000;
          const refreshDuration = refreshTime - Date.now();
          const self = this;
          this.refreshTimeoutId =
              setTimeout(function() { self.refreshJwt(); }, refreshDuration);
        });
        // On failure (unauthenticated), directs to /login page
        // On failure (timeout), tries again in 10 seconds
            // gives up after 1 minute
            // directs to /login page
  }

  updateUserDetails() {
    this.http.get<User>('/api/user/details')
        .subscribe((user) => {
          this._setUser(user);
        });
  }

  isLoggedIn() {
    console.log("this.user");
    console.log(this.user);
    console.log("this.jwtExp");
    console.log(this.jwtExp);
    
    if (this.user && this.jwtExp > Math.round(Date.now() / 1000)) {
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
    // navigate to home page '/'
    // Delete this.user
    // Delete this.jwtExp
    // Delete this.jwtRefreshTokenExp
    // clear this.refreshTimeoutId
    this.router.navigateByUrl('/');
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
