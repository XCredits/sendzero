import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import * as jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;
  username: string;
  jwt: any;

  constructor( private http: HttpClient,
    private userService: UserService,
    private activatedRoute: ActivatedRoute) {
      activatedRoute.queryParamMap
          .subscribe(paramMap => {
            this.username = paramMap.params.username;
            try {
              this.jwt = jwtDecode(paramMap.params.auth);
            } catch {
              this.formErrorMessage = 'Link does not work (authorisation string not valid).';
            }
          });
  }

  ngOnInit() {
    this.form = new FormGroup ({
      password: new FormControl('', [<any>Validators.required]),
    });
    // get queryParamMap: Observable<ParamMap>
    // https://angular.io/api/router/ActivatedRoute
    console.log('Attempting decode');
    console.log(jwtDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YWVkNTM3NGQwMzQ1ZDJiZDZjN2M5NTkiLCJqdGkiOiJkZTZmNDUwOWEzODliZTQ2IiwidXNlcm5hbWUiOiJhMSIsInhzcmYiOiIzMTBmMzNmZDhhOTA0YWYxIiwiZXhwIjoxNTI1NzgyNjE2LCJpYXQiOjE1MjU1MDI4MzZ9.uQ_IIfkNISFuc4-EU9g4Zdu1Fp3luh50TVPNu3dy1gE'));
  }

  submit(formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;

    this.waiting = true;
    this.http.post('/api/user/reset-password', {
          'password': formData.password,
        })
        .subscribe(data => {
          this.waiting = false;
          this.submitSuccess = true;
        },
        errorResponse => {
          this.waiting = false;
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  }
}
