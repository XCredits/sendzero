// Use card
// Position:fixed, to the right below the menu bar

import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})
export class UserDropdownComponent implements OnInit {
  user: User;
  isLoggedIn: boolean;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.userObservable
        .subscribe(user => {
          console.log('Got into user observable');
          console.log(user);
          this.user = user;
          this.isLoggedIn = !!this.user;
        });

    // this.userService.isLoggedInObservable
    //     .subscribe(isLoggedIn => {
    //       this.isLoggedIn = isLoggedIn;
    //     });
  }

  logout() {
    this.userService.logOut();
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
