import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(() => {
      if ('serviceWorker' in navigator) {
        ServiceWorkerModule.register('/ngsw-worker.js', 
            {enabled: environment.production})
      }
    })
    .catch(err => console.log(err));
