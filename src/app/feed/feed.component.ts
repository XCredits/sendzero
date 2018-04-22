import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  lengthCheckForm: FormGroup;
  joinedStringResult: string;

  constructor( private http: HttpClient ) { }

  ngOnInit() {
    this.lengthCheckForm = new FormGroup ({
      text1: new FormControl(""),
      text2: new FormControl(""),
    });
  }

  lengthCheckSubmit = function (formData) {
    console.log(formData);
    this.http.post('/api/join-strings', 
        {"inputString1": formData.text1, "inputString2": formData.text2})
      .subscribe(data => {
        this.joinedStringResult = data.joinedString;
      });
  }
}
