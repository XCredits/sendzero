import { Injectable } from '@angular/core';

@Injectable()
export class StatsService {
  constructor() {}
  fillOutData(sparseDataSet, type) {
    if (type === 'hour') {
      // order
      sparseDataSet.sort((a, b) => {
        return a.time - b.time;
      });
      const label = sparseDataSet.map(x => x.time);
      const value = sparseDataSet.map(x => x.value);
      return {label, value};
    } else {
      throw new Error('type in fillOutData not found. Try "hour"');
    }
  }

  generateTimeLabels(timeLabels, type) {
    if (type === 'hour') {

    }
    return;
  }
}
