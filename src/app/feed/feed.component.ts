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
  constructor( private http: HttpClient ) { }

  ngOnInit() {
    this.http.get('/api/test')
      .subscribe(data => {
        console.log(data); // using the HttpClient instance, http to call the API then subscribe to the data and display to console
      });
    
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
        console.log(data); // using the HttpClient instance, http to call the API then subscribe to the data and display to console
      });
  }
}
