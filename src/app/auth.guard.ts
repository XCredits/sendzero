import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
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
          console.log(next);
          // Store the ActivatedRouteSnapShot in UserService navigate
          // send redirect=1 as a param first time
          // if no redirect, clear auth service navigation
          // Preserve redirect when moving between login and register.
          // https://www.thepolyglotdeveloper.com/2016/10/passing-complex-data-angular-2-router-nativescript/
          this.router.navigate(['/login'], { queryParams: { redirect: 1 } });
          return false;
        } else {
          return true;
        }
      })
    ); // returns true if user exists
    //     .do(authenticated => {
    //       if (!authenticated) this.router.navigate(['/login']);
    //     });
    // );
  }
}
