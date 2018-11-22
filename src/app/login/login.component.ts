import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { UserService } from '../user.service';
import { AnalyticsService } from '../analytics.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;
  loginRegisterSwitchQueryParams: Params;
  redirectUrl: string;

  constructor( private http: HttpClient,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private analytics: AnalyticsService ) {

      // The following is to ensure that when a user is redirected for the
      // purposes of logging in that they are still redirected to the correct
      // on register success.
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        this.loginRegisterSwitchQueryParams = params;
        this.redirectUrl = params.redirect;
      });
    }

  ngOnInit() {
    this.form = new FormGroup ({
      username: new FormControl('', [Validators.required, Validators.pattern(this.userService.usernameRegexString)]),
      password: new FormControl('', [Validators.required]),
    });
  }

  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;
    this.waiting = true;
    this.http.post('/api/user/login', {
        'username': formData.username,
        'password': formData.password,
        })
        .subscribe(data => {
          this.waiting = false;
          this.userService.authenticationResult(data);
          this.userService.successNavigate(this.redirectUrl);
          this.analytics.login();
        },
        errorResponse => {
          this.waiting = false;
          // 401
          if (errorResponse.status === 401) {
            this.formErrorMessage = 'Username or password incorrect.';
          } else {
            this.formErrorMessage = 'There was a problem submitting the form.';
          }
        });
  };
}
