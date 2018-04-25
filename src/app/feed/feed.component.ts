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
  joinedStringResult: string;

  constructor( private http: HttpClient ) { }

  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"; // This is not a good regex http://emailregex.com/

  ngOnInit() {
    this.joinStringForm = new FormGroup ({
      text1: new FormControl("", 
        [<any>Validators.required, <any>Validators.minLength(5)]),
      text2: new FormControl("", [<any>Validators.required, <any>Validators.pattern(this.emailPattern)]),
    });
  }

  joinStringSubmit = function (formData) {
    console.log(formData);
    console.log(this.joinStringForm);

    if (this.joinStringForm.invalid) {
      return;
    }

    this.http.post('/api/join-strings', 
        {"inputString1": formData.text1, "inputString2": formData.text2})
      .subscribe(data => {
        this.joinedStringResult = data.joinedString;
      });
  }
}
