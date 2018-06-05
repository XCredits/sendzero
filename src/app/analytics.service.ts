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

  // Events: https://developers.google.com/analytics/devguides/collection/gtagjs/events
  pageView(pagePath, pageTitle) {
    this.gtag('config', environment.googleAnalyticsTrackingId,
        {'page_path': pagePath, 'page_title': pageTitle});
  }

  login() {
    this.gtag('event', 'login', { method : 'email' } ); // standard event
  }

  register() {
    this.gtag('event', 'sign_up', { method : 'email' } ); // standard event
  }

  mailingList() {
    this.gtag('event', 'mailing_list'); // standard event
  }

  customEvent(action: string,
      options: {category?: string, label?: string, value?: number}) {
    if (options.value &&
        (!Number.isInteger(options.value) || options.value < 0)) {
      console.error('Analytics option.value must be an integer and positive.');
      return;
    }
    this.gtag('event', action, options); // standard event
  }
  // Email lead gtag('event', 'email_click', );
  // utm_source=news4&utm_medium=email&utm_campaign=spring-summer
}
