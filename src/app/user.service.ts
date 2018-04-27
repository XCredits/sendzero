import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";

let user: User;
let jwt; // To be implemented later to allow APIs to be called quickly without having to hit up the 

@Injectable()
export class UserService {

  constructor( private http: HttpClient, 
      private router: Router ) {
    this.getUserDetails();
    if (!user) {

    }
  }

  createUser(email, password){
    this.http.post<User>('/api/user/create', {email, password})
        .subscribe((data) => {
          // set the user
          user = data;
          // navigate to first page
          this.router.navigateByUrl('/');
          return data;
        });
  }

  getUserDetails() {
    this.http.post<Details>('/api/user/details', {})
        .subscribe((details) => {
          user = details.user;
          jwt = details.jwt;
        });
  }

  isLoggedIn() {
    return true;
  }

  login(email, password, optional_nav) {
    // router.navigateByUrl(optional_nav)
  }

  logOut() {
    // Send message to server
    // Delete JWT
    // Remove cookie
  }

  requestInterceptor() {
    // Determine if JWT is expired
        // if expired, get new JWT
    // Attach JWT to request authorisation field
    // return 
    // https://www.youtube.com/watch?v=qnRrqH-BzJE
  }

  
}

interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

interface Details {
  user: User;
  jwt: any;
}