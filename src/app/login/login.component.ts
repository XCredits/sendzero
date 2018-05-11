import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor( private http: HttpClient ) { }

  ngOnInit() {
    this.loginForm = new FormGroup ({
      username: new FormControl('', [<any>Validators.required]),
      password: new FormControl('', [<any>Validators.required]),
    });
  }

  loginSubmit = function (formData) {
    if (this.loginForm.invalid) {
      return;
    }
    this.http.post('/api/user/login', {
        'username': formData.username,
        'password': formData.password,
        })
        .subscribe(data => {
          console.log('received message');
          // redirect to intended location
        });
  };
}
