import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  submitSuccess = false;
  waiting = false;

  constructor( private http: HttpClient,
    private userService: UserService ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      username: new FormControl('', [<any>Validators.required]),
    });
  }

  submit(formData) {
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.get('username').value);
    // Clear state from previous submissions

    this.waiting = true;
    this.http.post('/api/user/request-reset-password', {
          'username': formData.username,
        })
        .subscribe(data => {
          this.waiting = false;
          this.submitSuccess = true;
          console.log('Forgot password success.');
        });
  }
}
