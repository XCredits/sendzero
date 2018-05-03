import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";


@Injectable()
export class UserService {

  user: User;
  jwt; // To be implemented later to allow APIs to be called quickly without having to hit up the 

  constructor( private http: HttpClient, 
      private router: Router ) {
    this.getUserDetails();
    if (!this.user) {

    }
  }

  createUser(email, password){
    this.http.post<User>('/api/user/create', {email, password})
        .subscribe((data) => {
          // set the user
          this.user = data;
          // navigate to first page
          this.router.navigateByUrl('/');
          return data;
        });
  }

  getUserDetails() {
    this.http.get<Details>('/api/user/details')
        .subscribe((details) => {
          this.user = details.user;
          this.jwt = details.jwt;
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
    // Delete JWT
    // Remove cookie
    // navigate to home page '/'
  }
}

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

interface Details {
  user: User;
  jwt: any;
}