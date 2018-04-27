import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  joinStringForm: FormGroup;
  joinListMessage: string;

  constructor( private http: HttpClient ) { }

  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'; // This is not a good regex http://emailregex.com/

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
    this.joinListMessage = 'yo';
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
