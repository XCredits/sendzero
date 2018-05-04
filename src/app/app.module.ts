import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http'; // Deprecation https://angular.io/api/http/HttpModule
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

// 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

// Material modules 
import { 
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { MaterialFileInputModule } from 'ngx-material-file-input';


// Below is for Progressive Web App (PWA) functionality
import { environment } from '../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';

// Routes
import { HomeComponent } from './home/home.component';
import { HelpComponent } from './help/help.component';
import { SettingsComponent } from './settings/settings.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FeedComponent } from './feed/feed.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MailingListComponent } from './mailing-list/mailing-list.component';

// Services
import { SendZeroService } from './send-zero.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HelpComponent,
    SettingsComponent,
    PageNotFoundComponent,
    FeedComponent,
    ContactsComponent,
    AboutComponent,
    LoginComponent,
    RegisterComponent,
    MailingListComponent,
  ],
  imports: [
    BrowserModule, 
    FormsModule,
    ReactiveFormsModule ,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent,
        data: { title: 'Home' },
      },
      {
        path: 'feed',
        component: FeedComponent,
        data: { title: 'Feed' },
      },
      {
        path: 'contacts',
        component: ContactsComponent,
        data: { title: 'Contacts' },
      },
      {
        path: 'help',
        component: HelpComponent,
        data: { title: 'Help' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings' },
      },
      {
        path: 'about',
        component: AboutComponent,
        data: { title: 'About' },
      },
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register' },
      },
      { // Default route
        path: '', 
        redirectTo: '/home', 
        pathMatch: 'full',
      },
      { 
        path: '**', 
        component: PageNotFoundComponent,
        data: { title: 'Page Not Found' },
      },
    ]),

    BrowserAnimationsModule,
    // NgbModule,
    AngularFontAwesomeModule,
    
    // Material modules 
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MaterialFileInputModule,

    // Below is for Progressive Web App (PWA) functionality
    ServiceWorkerModule.register('/ngsw-worker.js', 
        {enabled: environment.production})
  ],
  providers: [
    SendZeroService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
