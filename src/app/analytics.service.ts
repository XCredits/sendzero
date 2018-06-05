import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  gtag: any;

  constructor() {
    // Load the google analytics script.
    const node = document.createElement('script');
    node.src = 'https://www.googletagmanager.com/gtag/js?id=UA-120389053-1';
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);

    // Add the gtag function into this component
    this.gtag = window['gtag'];
    // Initialise the gtag
    this.gtag('js', new Date());
    // this.gtag('config', 'UA-120389053-1');
  }

  logPageView(pagePath, pageTitle) {
    // this.gtag('config', 'UA-120389053-1');
    this.gtag('config', 'UA-120389053-1', {'page_path': pagePath});
  }

}
