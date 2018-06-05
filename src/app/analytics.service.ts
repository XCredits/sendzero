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
    node.src = 'https://www.googletagmanager.com/gtag/js?id=' +
        environment.googleAnalyticsTrackingId;
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);

    // Add the gtag function into this component
    this.gtag = window['gtag'];
    // Initialise the gtag
    this.gtag('js', new Date());
  }

  logPageView(pagePath, pageTitle) {
    this.gtag('config', environment.googleAnalyticsTrackingId,
        {'page_path': pagePath, 'page_title': pageTitle});
  }

  // Log in gtag('event', 'login', { method : 'email' }); // standard event
  // Register gtag('event', 'sign_up', { method : 'email' }); // standard event
  // Mailing List gtag('event', 'mailing_list');
  // Email lead gtag('event', 'email_click', );
  // utm_source=news4&utm_medium=email&utm_campaign=spring-summer

  // Custom event
  // eventAction,
  // 'event_category': <category>,
  // 'event_label': <label>,
  // 'value': <value>

  // Events: https://developers.google.com/analytics/devguides/collection/gtagjs/events

}
