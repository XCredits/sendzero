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
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'; // This is not a good regex http://emailregex.com/

  constructor( private http: HttpClient ) { }

  ngOnInit() {
    this.loginForm = new FormGroup ({
      email: new FormControl('', 
        [<any>Validators.required, <any>Validators.pattern(this.emailPattern)]),
      password: new FormControl(''),
    });
  }

  loginSubmit = function (formData) {
    if (this.loginForm.invalid) {
      return;
    }
    this.http.post('/api/login', {
        'email': formData.email, 
        'password': formData.password, 
        })
        .subscribe(data => {
          console.log('received message');
          // redirect to intended location
        });
  };
}
