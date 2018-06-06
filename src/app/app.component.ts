
import {filter} from 'rxjs/operators';
import { Component, ViewChild, OnChanges } from '@angular/core';
// Imports needed for router import for title
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from './user.service';
import { AnalyticsService } from './analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnChanges {
  @ViewChild('sideNavDrawer') sideNavDrawer;
  screenWidth: number;
  mobileWidth = false; // boolean
  title: string;
  user: User;
  isLoggedIn: boolean;
  userIsAdmin: boolean;
  drawerMode: string;
  drawerOpened: boolean;


  // Edit the area below to create main nav links

  // Primary nav links are shown in both the side and the bottom navs
  primaryNavLinks: NavLink[] = [
    {
      routerLink: '/home',
      icon: 'home',
      title: 'Home',
    },
    {
      routerLink: '/feed',
      icon: 'chat',
      title: 'Feed',
    },
    {
      routerLink: '/contacts',
      icon: 'person',
      title: 'Contacts',
    },
    {
      routerLink: '/about',
      icon: 'view_carousel',
      title: 'About',
    },
  ];

  // Secondary nav links are only shown in the side bar
  secondaryNavLinks: NavLink[] = [
    {
      routerLink: '/profile',
      icon: 'person',
      title: 'Profile',
      isLoggedInRoute: true,
    },
    {
      routerLink: '/mailing-list',
      icon: 'email',
      title: 'Mailing list',
    },
    {
      routerLink: '/help',
      icon: 'help',
      title: 'Help',
    },
    {
      routerLink: '/settings',
      icon: 'settings',
      title: 'Settings',
      isLoggedInRoute: true,
    },
    {
      routerLink: '/admin',
      icon: 'verified_user',
      title: 'Admin',
      isAdminRoute: true,
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
    if (this.screenWidth < 768) {
      this.drawerMode = 'push'; // push or over
      this.drawerOpened = false;
      this.mobileWidth = true;
    } else {
      this.drawerMode = 'side';
      this.drawerOpened = true;
      this.mobileWidth = false;
    }
  }

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private userService: UserService,
      private analytics: AnalyticsService,
    ) {
    // Set side bar mode
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
      this.setSideBar();
    };


    router.events.pipe(
      filter(e => e instanceof NavigationEnd))
      .forEach((e: NavigationEnd) => {
        this.title = route.root.firstChild.snapshot.data['title'];

        // Analytics
        // Test if the page has Changed

        // The below line removes the query parameters so that information is
        // not passed to the Analytics provider
        analytics.pageView(e.url.split('?')[0], this.title);
      });

    userService.userObservable
      .subscribe(user => {
        this.user = user;
        this.isLoggedIn = !!user;
        this.userIsAdmin = user ? this.user.isAdmin : false;
      });

    this.setSideBar(); // set the sidebar values
  }

  // set sidebar after every change
  ngOnChanges() {
    this.setSideBar();
  }
}

interface NavLink {
  routerLink: string;
  icon: string;
  title: string;
  isAdminRoute?: boolean;
  isLoggedInRoute?: boolean;
}

interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}
