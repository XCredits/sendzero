import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable()
export class UserService {

  user: User;
  jwtExp: Number;
  jwtRefreshTokenExp: Number;

  constructor( private http: HttpClient,
      private router: Router ) {
    this.updateUserDetails();
  }

  storeUser({user, jwtExp, jwtRefreshTokenExp}) {
    this.user = user;
    this.jwtExp = jwtExp;
    this.jwtRefreshTokenExp = jwtRefreshTokenExp;
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

  login(username, password, optional_nav) {
    // if (optional_nav) {
    //   router.navigateByUrl(optional_nav);
    // } else {
    //   this.router.navigateByUrl('/');
    // }
  }

  logOut() {
    // Send message to server
    // navigate to home page '/'
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
