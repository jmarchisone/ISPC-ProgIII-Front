import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../servicios/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    // Validamos usando el token y la signal reactiva de tu AuthService
    const hasToken = !!localStorage.getItem('access_token');
    const hasUserSignal = !!this.authService.currentUser();

    if (hasToken || hasUserSignal) {
      return true;
    }

    // Redirigir al login si no está autorizado
    this.router.navigate(['/']);
    return false;
  }
}