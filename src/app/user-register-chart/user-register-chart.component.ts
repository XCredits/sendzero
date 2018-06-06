import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import * as Chart from 'chart.js';
import { StatsService } from '../stats.service';

@Component({
  selector: 'app-user-register-chart',
  templateUrl: './user-register-chart.component.html',
  styleUrls: ['./user-register-chart.component.scss']
})
export class UserRegisterChartComponent implements OnInit {
  @ViewChild('chart1') chart1: ElementRef;
  userRegisterCount: number;

  constructor(
      private http: HttpClient,
      private snackBar: MatSnackBar,
      private statsService: StatsService,
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
    this.http.post<any>('/api/admin/user-register-count', {})
        .subscribe(data => {
          this.userRegisterCount = data.count;
        },
        () => {
          this.snackBar.open('Network error', 'Dismiss', {
            duration: 5000
          });
        }
        );

    this.http.post<any>('/api/admin/user-register-stats', {})
        .subscribe(sparseData => {
          const dataIntermediate = this.statsService.fillOutData(sparseData, 'hour');
          const data = {
            labels: this.statsService.generateTimeLabels(dataIntermediate.time, 'hour'),
            value: dataIntermediate.value,
          };
          data.labels = this.statsService.generateTimeLabels(dataIntermediate.time, 'hour');
          const edgeColor = this.chartColors.blue;
          const backgroundColor =
              Chart.helpers.color(this.chartColors.blue).alpha(0.2).rgbString();
          const dataCollection = {
            labels: data.labels,
            datasets: [{
              label: 'User regisrations',
              borderColor: this.chartColors.blue,
              borderWidth: 1,
              backgroundColor: backgroundColor,
              data: data.value,
            }]
          };

          const ctx = this.chart1.nativeElement.getContext('2d');
          const chart1Obj = new Chart(ctx, {
            type: 'bar',
            data: dataCollection,
            options: {
              showLine: true,
              scales: {
                xAxes: [{
                    ticks: {
                      autoSkip: true,
                      maxTicksLimit: 20,
                      evenLabelSpacing: true,
                      // labelSpacing: 24,
                    }
                }],
                yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
                }]
              }
            }
          });
        },
        () => {
          this.snackBar.open('Network error', 'Dismiss', {
            duration: 5000
          });
        }
        );
  }

}
