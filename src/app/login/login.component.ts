import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor( private http: HttpClient, 
    private userService: UserService ) { }

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
          console.log('login returned');
          this.userService.storeUser(data);
          this.userService.successNavigate();
        });
  };
}
