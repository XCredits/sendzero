import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http'; // Deprecation https://angular.io/api/http/HttpModule
import { RouterModule } from '@angular/router';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { QRCodeModule } from 'angularx-qrcode'; // QRcode Generator
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AppComponent } from './app.component';
import { UserService } from './user.service';
import { SignalService } from './signal.service';
import { SendZeroService } from './send-zero.service';
import { DialogService } from './dialog.service';
import { QrService } from './qr.service';
import { StatsService } from './stats.service';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';

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
import { FileDropModule } from 'ngx-file-drop';


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
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotUsernameComponent } from './forgot-username/forgot-username.component';
import { RegisterComponent } from './register/register.component';
import { MailingListComponent } from './mailing-list/mailing-list.component';
import { ProfileComponent } from './profile/profile.component';
import { UserDropdownComponent } from './user-dropdown/user-dropdown.component';
import { AdminComponent } from './admin/admin.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { MailingListChartComponent } from './mailing-list-chart/mailing-list-chart.component';
import { UserRegisterChartComponent } from './user-register-chart/user-register-chart.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { FooterComponent } from './footer/footer.component';
import { QRCodeComponent } from './qrcode/qrcode.component';
import { QRScannerComponent } from './qrscanner/qrscanner.component';

// Pipes
import { FormatSizePipe } from './format-size.pipe';

// Dialogs
import { ReceiveConnectionDialogComponent } from './receive-connection-dialog/receive-connection-dialog.component';
import { InitiateConnectionDialogComponent } from './initiate-connection-dialog/initiate-connection-dialog.component';
import { QrScannerDialogComponent } from './qr-scanner-dialog/qr-scanner-dialog.component';
import { ReceiveFileDialogComponent } from './receive-file-dialog/receive-file-dialog.component';

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
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    ForgotUsernameComponent,
    RegisterComponent,
    MailingListComponent,
    ProfileComponent,
    UserDropdownComponent,
    AdminComponent,
    UnauthorizedComponent,
    MailingListChartComponent,
    UserRegisterChartComponent,
    TermsComponent,
    PrivacyComponent,
    FooterComponent,
    ReceiveFileDialogComponent,
    InitiateConnectionDialogComponent,
    QRCodeComponent,
    QRScannerComponent,
    // Dialogs
    InitiateConnectionDialogComponent,
    ReceiveFileDialogComponent,
    ReceiveConnectionDialogComponent,
    QrScannerDialogComponent,
    // Pipes
    FormatSizePipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    QRCodeModule, // QR Module
    ZXingScannerModule,
    NgxWebstorageModule.forRoot({
      prefix: 'app',
      separator: '.',
      caseSensitive: true
    }),

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
        path: 'profile',
        component: ProfileComponent,
        data: { title: 'Profile' },
        canActivate: [AuthGuard],
      },
      {
        path: 'mailing-list',
        component: MailingListComponent,
        data: { title: 'Mailing list' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings' },
        canActivate: [AuthGuard],
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
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'Forgot Password' },
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { title: 'Reset Password' },
      },
      {
        path: 'forgot-username',
        component: ForgotUsernameComponent,
        data: { title: 'Forgot Username' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register' },
      },
      {
        path: 'admin',
        component: AdminComponent,
        data: { title: 'Admin' },
        canActivate: [AdminGuard],
      },
      {
        path: 'terms',
        component: TermsComponent,
        data: { title: 'Terms' },
      },
      {
        path: 'privacy',
        component: PrivacyComponent,
        data: { title: 'Privacy' },
      },
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
        data: { title: 'Unauthorized' },
      },
      { // Default route
        path: '',
        component: HomeComponent,
        data: { title: 'Home' },
        // redirectTo: '/home',
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
    FileDropModule,

    // Below is for Progressive Web App (PWA) functionality
    ServiceWorkerModule.register('/ngsw-worker.js',
        {enabled: environment.production})
  ],
  // For dialogs
  entryComponents: [
    ReceiveConnectionDialogComponent,
    ReceiveFileDialogComponent,
    InitiateConnectionDialogComponent,
    QrScannerDialogComponent,
  ],
  providers: [
    SignalService,
    SendZeroService,
    UserService,
    StatsService,
    AnalyticsService,
    DialogService,
    QrService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
