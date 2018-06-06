import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  siteName: string;
  social: any;

  constructor() {
    this.siteName = environment.siteName;
    this.social = environment.social;
  }

  ngOnInit() {
  }

}
