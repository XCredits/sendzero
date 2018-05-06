import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor( private http: HttpClient,
      private userService: UserService
    ) {}

  ngOnInit() {
    this.registerForm = new FormGroup ({
      givenName: new FormControl('', [Validators.required]),
      familyName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, , Validators.email]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
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
