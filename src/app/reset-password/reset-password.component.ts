import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor( private http: HttpClient,
    private userService: UserService ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      username: new FormControl('', [<any>Validators.required]),
    });
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
