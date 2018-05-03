import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable()
export class UserService {

  user: User;

  constructor( private http: HttpClient,
      private router: Router ) {
    this.updateUserDetails();
    if (!this.user) {

    }
  }

  storeUser(userDetails) {
    // set the user
    this.user = userDetails;
    // navigate to first page
    this.router.navigateByUrl('/');
  }

  updateUserDetails() {
    this.http.get<User>('/api/user/details')
        .subscribe((userDetails) => {
          this.user = userDetails;
        });
  }

  isLoggedIn() {
    return true;
  }

  login(username, password, optional_nav) {
    // if (optional_nav) {
    //   router.navigateByUrl(optional_nav);
    // } else {
    //   router.navigateByUrl('/');
    // }
  }

  logOut() {
    // Send message to server
    // navigate to home page '/'
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
