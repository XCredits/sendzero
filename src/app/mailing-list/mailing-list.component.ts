import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-mailing-list',
  templateUrl: './mailing-list.component.html',
  styleUrls: ['./mailing-list.component.scss']
})
export class MailingListComponent implements OnInit {
  form: FormGroup;
  waiting = false;
  formErrorMessage: string;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  submit = function (formData) {
    if (this.form.invalid) {
      return;
    }
    // Clear state from previous submissions
    this.formErrorMessage = undefined;
    this.waiting = true;
    this.http.post('/api/join-mailing-list', {
        'givenName': formData.givenName,
        'familyName': formData.familyName,
        'email': formData.email
        })
        .subscribe(
        data => {
          this.waiting = false;
          this.snackBar.open('Successfully registered', 'Dismiss', {
            duration: 5000
          });
        },
        errorResponse => {
          this.waiting = false;
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  };
}
