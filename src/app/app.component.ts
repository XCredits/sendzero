import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('navigationDrawer') navigationDrawer;
  title = 'app';
  screenWidth: number;
  sideBarMode: string;


  toggleNavigationDrawer() {
    this.navigationDrawer.toggle();
  }

  setSideBar() {
    console.log(this.navigationDrawer);
    if (this.screenWidth < 768) {
      this.navigationDrawer.mode = 'push'; // push or over
      this.navigationDrawer.opened = false;
    } else {
      this.navigationDrawer.mode = 'side';
      this.navigationDrawer.opened = true;
    }
  }

  constructor() {
    // Set side bar mode
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
      this.setSideBar();
    };
  }

  ngAfterViewInit() {
    this.setSideBar();
  }
}
