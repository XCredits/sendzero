import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";

let user: User;
let jwt; // To be implemented later to allow APIs to be called quickly without having to hit up the 

@Injectable()
export class UserService {

  constructor( private http: HttpClient, 
      private router: Router ) {
    
  }

  getUserDetails() {
    // http.subscribe(a=> {
    //   user = JSON.stringify();
    // });
  }

  isLoggedIn() {
    return true;
  }

  sendLogin(email, password, optional_nav) {
    // router.navigateByUrl(optional_nav)
  }

  createUser(email, password){
    this.http.post<User>('/api/user/create-user', {email, password})
        .subscribe((data) => {
          // set the user
          user = data;
          // navigate to first page
          this.router.navigateByUrl('/');
          return data;
        });
  }

  requestInterceptor() {
    // Determine if JWT is expired
        // if expired, get new JWT
    // Attach JWT to request authorisation field
    // return 
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

