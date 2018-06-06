import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;
  formErrorMessage: string;

  constructor( private http: HttpClient,
    private userService: UserService) {
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
    this.http.post('/api/user/change-password', {
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
