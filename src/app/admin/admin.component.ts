import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  mailingListCount: number;

  constructor(
      private http: HttpClient,
      private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.http.get<any>('/api/admin/mailing-list-count')
        .subscribe(data => {
          this.mailingListCount = data.count;
        },
        () => {
          this.snackBar.open('Network error', 'Dismiss', {
            duration: 5000
          });
        }
        );
  }

}
