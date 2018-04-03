import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('navigationDrawer') navigationDrawer;
  screenWidth: number;
  mobileWidth: boolean = false;

  // Edit the area below to create main nav links
  // There should be 
  primaryNavLinks: { routerLink: string, icon: string, text: string }[] = [
    {
      routerLink: '/home',
      icon: 'home',
      text: 'Home',
    },
    {
      routerLink: '/feed',
      icon: 'chat',
      text: 'Feed',
    },
    {
      routerLink: '/contacts',
      icon: 'person',
      text: 'Contacts',
    },
  ];

  secondaryNavLinks: { routerLink: string, icon: string, text: string }[] = [
    {
      routerLink: '/help',
      icon: 'help',
      text: 'Help',
    },
    {
      routerLink: '/settings',
      icon: 'settings',
      text: 'Settings',
    },
  ];


  toggleNavigationDrawer() {
    this.navigationDrawer.toggle();
  }

  hideNavAfterClick () {
    if (this.mobileWidth) {
      this.toggleNavigationDrawer();
    }
  }

  setSideBar() {
    console.log(this.navigationDrawer);
    if (this.screenWidth < 768) {
      this.navigationDrawer.mode = 'push'; // push or over
      this.navigationDrawer.opened = false;
      this.mobileWidth = true;
    } else {
      this.navigationDrawer.mode = 'side';
      this.navigationDrawer.opened = true;
      this.mobileWidth = false;
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
