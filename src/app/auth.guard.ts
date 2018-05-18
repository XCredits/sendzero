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
          this.router.navigate(['/login']);
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
