import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

// 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material modules 
import { 
      MatButtonModule,
      MatCheckboxModule,
    } from '@angular/material';

// Below is for Progressive Web App (PWA) functionality
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, 
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    
    // Material modules 
    MatButtonModule,  
    MatCheckboxModule, 

    // Below is for Progressive Web App (PWA) functionality
    ServiceWorkerModule.register('/ngsw-worker.js', 
        {enabled: environment.production})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
