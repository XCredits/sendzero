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
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'; // This is not a good regex http://emailregex.com/


  constructor( private http: HttpClient ) { }

  
  ngOnInit() {
    this.joinStringForm = new FormGroup ({
      givenName: new FormControl(''),
      familyName: new FormControl(''),
      //   [<any>Validators.required, <any>Validators.minLength(5)]),
      email: new FormControl('', [<any>Validators.required, <any>Validators.pattern(this.emailPattern)]),
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
