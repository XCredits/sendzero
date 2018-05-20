import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-mailing-list-chart',
  templateUrl: './mailing-list-chart.component.html',
  styleUrls: ['./mailing-list-chart.component.scss']
})
export class MailingListChartComponent implements OnInit {
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
