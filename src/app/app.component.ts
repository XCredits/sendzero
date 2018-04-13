import { Component, ViewChild } from '@angular/core';
// Imports needed for router import for title
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import 'rxjs/add/operator/filter'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('sideNavDrawer') sideNavDrawer;
  screenWidth: number;
  mobileWidth: boolean = false;
  title: string;
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
    {
      routerLink: '/about',
      icon: 'view_carousel',
      text: 'About',
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


  toggleSideNavDrawer() {
    this.sideNavDrawer.toggle();
  }

  hideSideNavAfterClick () {
    if (this.mobileWidth) {
      this.toggleSideNavDrawer();
    }
  }

  setSideBar() {
    console.log(this.sideNavDrawer);
    if (this.screenWidth < 768) {
      this.sideNavDrawer.mode = 'push'; // push or over
      this.sideNavDrawer.opened = false;
      this.mobileWidth = true;
    } else {
      this.sideNavDrawer.mode = 'side';
      this.sideNavDrawer.opened = true;
      this.mobileWidth = false;
    }
  }

  constructor(router:Router, route:ActivatedRoute) {
    // Set side bar mode
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
      this.setSideBar();
    };

    // 
    router.events
      .filter(e => e instanceof NavigationEnd)
      .forEach(e => {
        this.title = route.root.firstChild.snapshot.data['title'];
      });
  }

  ngAfterViewInit() {
    this.setSideBar();
  }
}
