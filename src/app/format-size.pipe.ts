import { Pipe, PipeTransform } from '@angular/core';

/*
 * Format size in bytes to KB, MB, GB, etc.
 * Takes a "decimals" argument that defaults to 2
 * N.B.: Uses 1 KB = 1024 bytes
 * Usage:
 *   size | formatSize:decimals
 * Example:
 *   {{ 2000 | formatSize:2 }}
 *   formats to: "1.95 KB"
*/
@Pipe({name: 'formatSize'})
export class FormatSizePipe implements PipeTransform {
  transform(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
