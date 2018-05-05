import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    console.log("Doing");
    this.http.get<User>('/api/user/details',{})
        .subscribe((user) =>  {
          console.log("Enter user details");
          this.user = user;
          console.log(user);
        });
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