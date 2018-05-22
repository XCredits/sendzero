import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class StatsService {
  constructor() {}
  fillOutData(sparseData, type) {
    if (type === 'hour') {
      const inc = 60 * 60 * 1000;
      // order
      sparseData.sort((a, b) => {
        return a.time - b.time;
      });
      const sparseTime = sparseData.map(x => x.time);
      const sparseValue = sparseData.map(x => x.value);

      // Fill out empty hours
      // Get start time
      const start = sparseTime[0];
      const end = sparseTime[sparseTime.length - 1];
      const time = [];
      const value = [];
      for (let time_i = start; time_i <= end ; time_i = time_i + inc) {
        time.push(time_i);
        if (sparseTime.indexOf(time_i) >= 0) {
          value.push(sparseValue[sparseTime.indexOf(time_i)]);
        } else {
          value.push(0);
        }
      }
      return {time, value};
    } else {
      throw new Error('type in fillOutData not found. Try "hour"');
    }
  }

  generateTimeLabels(time, type) {
    if (type === 'hour') {
      // Pull all the values
      return time.map(ele => {
        console.log(ele);
        return moment(ele).format('YYYY/MM/DD HH:mm');
      });
    }
    return;
  }
}
