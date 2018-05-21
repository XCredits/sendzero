import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-mailing-list-chart',
  templateUrl: './mailing-list-chart.component.html',
  styleUrls: ['./mailing-list-chart.component.scss']
})
export class MailingListChartComponent implements OnInit {
  @ViewChild('chart1') chart1: ElementRef;
  mailingListCount: number;

  constructor(
      private http: HttpClient,
      private snackBar: MatSnackBar,
  ) { }


  chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };

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


    const data1 = [];
    const labels = [];
    for (let i = 0; i < 100; i++) {
      labels.push(i);
      data1.push(Math.random() * 100);
    }

    const color = Chart.helpers.color; // this, I believe, is the same 'color' as used in 'npm install color'
    const scatterChartData = {
      labels: labels,
      datasets: [{
        label: 'My Second dataset',
        borderColor: this.chartColors.blue,
        borderWidth: 1,
        backgroundColor: color(this.chartColors.blue).alpha(0.2).rgbString(),
        data: data1,
      }]
    };

    const ctx = this.chart1.nativeElement.getContext('2d');
    const chart1Obj = new Chart(ctx, {
      type: 'bar',
      data: scatterChartData,
      options: {
        showLine: true,
        scales: {
          xAxes: [{
              ticks: {
                autoSkip: true,
                maxTicksLimit: 23
              }
          }]
      }
      }
    });
  }

}
