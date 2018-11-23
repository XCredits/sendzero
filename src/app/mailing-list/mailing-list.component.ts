import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { AnalyticsService } from '../analytics.service';

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
    private userService: UserService,
    private snackBar: MatSnackBar,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
    this.userService.userObservable
        .subscribe(user => {
          this.form = new FormGroup ({
            givenName: new FormControl(user.givenName),
            familyName: new FormControl(user.familyName),
            email: new FormControl(user.email,
                [Validators.required, Validators.email]),
          });
        });
    } else {
      this.form = new FormGroup ({
        givenName: new FormControl(''),
        familyName: new FormControl(''),
        email: new FormControl('', [Validators.required, Validators.email]),
      });
    }
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
          this.snackBar.open('Successfully subscribed to the mailing list', 'Dismiss', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'right',
          });
          this.analytics.mailingList();
        },
        errorResponse => {
          this.waiting = false;
          this.formErrorMessage = 'There was a problem submitting the form.';
        });
  };
}
