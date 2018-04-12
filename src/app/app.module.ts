import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SendZeroConnectService } from './send-zero-connect.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    SendZeroConnectService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
