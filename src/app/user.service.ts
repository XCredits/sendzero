import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";

let user: User;//: User;

@Injectable()
export class UserService {

  constructor( private http: HttpClient, 
      private router: Router ) {
    // Determine if the user needs to log in again
    
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

  joinStringSubmit = function (formData) {
    console.log(formData);
    console.log(this.joinStringForm);

    if (this.joinStringForm.invalid) {
      return;
    }

    this.http.post('/api/join-strings', 
        {"inputString1": formData.text1, "inputString2": formData.text2})
      .subscribe(data => {
        this.joinedStringResult = data.joinedString;
      });
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

