import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {UserService} from '../user.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'; // This is not a good regex http://emailregex.com/


  constructor( private http: HttpClient, 
      private userService: UserService) {}

  ngOnInit() {
    this.registerForm = new FormGroup ({
      givenName: new FormControl('', [<any>Validators.required]),
      familyName: new FormControl('', [<any>Validators.required]),
      email: new FormControl('',
        [<any>Validators.required, <any>Validators.pattern(this.emailPattern)]),
      username: new FormControl('', [<any>Validators.required]),
      password: new FormControl('', [<any>Validators.required]),
    });
  }

  registerSubmit = function (formData) {
    if (this.registerForm.invalid) {
      return;
    }
    this.http.post('/api/user/register', {
        'givenName': formData.givenName,
        'familyName': formData.familyName,
        'email': formData.email,
        'username': formData.username,
        'password': formData.password,
        })
        .subscribe(data => {
          console.log('register returned');
          console.log(data);
          this.userService.storeUser(data);
          this.userService.successNavigate();
        });
  };
}
