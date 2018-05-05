import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-mailing-list',
  templateUrl: './mailing-list.component.html',
  styleUrls: ['./mailing-list.component.scss']
})
export class MailingListComponent implements OnInit {
  joinStringForm: FormGroup;
  joinListMessage: string;

  constructor( private http: HttpClient ) { }

  ngOnInit() {
    this.joinStringForm = new FormGroup ({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  joinStringSubmit = function (formData) {
    console.log(formData);
    console.log(this.joinStringForm);

    if (this.joinStringForm.invalid) {
      return;
    }
    this.http.post('/api/join-mailing-list', {
        'givenName': formData.givenName,
        'familyName': formData.familyName,
        'email': formData.email
        })
        .subscribe(data => {
          console.log('received message');
          this.joinListMessage = data.message;
        });
  };
}
