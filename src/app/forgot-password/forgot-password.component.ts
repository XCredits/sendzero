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

  constructor( private http: HttpClient,
    private userService: UserService ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      username: new FormControl('', [<any>Validators.required]),
    });
  }

  submit(formData) {
    this.submitSuccess = true;
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.get('username').value);
    this.http.post('/api/user/forgot-password', {
          'username': formData.username,
        })
        .subscribe(data => {
          console.log('Forgot password success.');
        });
  }
}
