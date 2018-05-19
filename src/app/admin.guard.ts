import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.userService.userObservable.pipe(
      take(1),
      map(user => {
        const authenticated: boolean = !!user;
        if (!authenticated) {
          // https://www.thepolyglotdeveloper.com/2016/10/passing-complex-data-angular-2-router-nativescript/
          const navigationExtras: NavigationExtras = {
            queryParams: { redirect: state.url },
          };
          this.router.navigate(['/login'], navigationExtras);
          return false;
        } else if (authenticated && !user.isAdmin) {
          // serve permission error page
          return true;
        } else {
          return true;
        }
      })
    );
  }
}
