import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  mailingListCount: number;

  constructor( private http: HttpClient ) { }

  ngOnInit() {
    this.http.get('/api/admin/mailing-list-count')
        .subscribe(data => {
          this.mailingListCount = data.count;
        },
        () => {
        }
        );
  }

}
