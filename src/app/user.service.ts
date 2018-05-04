import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable()
export class UserService {

  user: User;
  jwtExp: number;
  jwtRefreshTokenExp: number;
  refreshTimeoutId: any;

  nav: NavObj;

  constructor( private http: HttpClient,
      private router: Router ) {
    this.refreshJwt();
    this.updateUserDetails();
  }

  storeUser({user, jwtExp, jwtRefreshTokenExp}) {
    this.user = user;
    this.jwtExp = jwtExp;
    this.jwtRefreshTokenExp = jwtRefreshTokenExp;
  }

  refreshJwt() {
    this.http.get<any>('/api/user/refresh-jwt')
        .subscribe((response) => {
          this.jwtExp = response.jwtExp;
          // Call a refresh token 15 seconds before
          const refreshTime = (this.jwtExp - 15) * 1000;
          const refreshDuration = refreshTime - Date.now();
          this.refreshTimeoutId = setTimeout(this.refreshJwt, refreshDuration);
        });
        // On failure (unauthenticated), directs to /login page
        // On failure (timeout), tries again in 10 seconds
            // gives up after 1 minute
            // directs to /login page
  }

  updateUserDetails() {
    this.http.get<User>('/api/user/details')
        .subscribe((userDetails) => {
          this.user = userDetails;
        });
  }

  isLoggedIn() {
    if (this.user && this.jwtExp < Math.round(Date.now() / 1000)) {
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
