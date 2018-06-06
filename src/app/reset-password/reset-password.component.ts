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
  jwt: string;
  jwtDecoded: any;

  constructor( private http: HttpClient,
    private userService: UserService,
    private activatedRoute: ActivatedRoute) {
      activatedRoute.queryParamMap
          .subscribe(paramMap => {
            this.username = paramMap.get('username');
            this.jwt = paramMap.get('auth');
            try {
              this.jwtDecoded = jwtDecode(this.jwt);
            } catch (err) {
              console.log(err);
              return this.formErrorMessage = 'Link does not work (authorisation string not valid).';
            }
          });
  }

  ngOnInit() {
    this.form = new FormGroup ({
      password: new FormControl('', [<any>Validators.required]),
    });
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
          'jwt': this.jwt,
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
