// src/app/interceptors/auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../servicios/auth';

// Signal global al interceptor para saber si ya estamos en proceso de renovar el token
const isRefreshing = signal<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  // 1. Clonamos la petición para inyectarle el token actual si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 2. Si da error 401 y NO estamos ya refrescando el token
      if (error.status === 401 && !isRefreshing()) {
        isRefreshing.set(true);

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            isRefreshing.set(false);
            
            // 3. El token se renovó con éxito. Reintentamos la petición original fallida
            const clonedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access}` }
            });
            return next(clonedReq);
          }),
          catchError((refreshError) => {
            // 4. Si el refresh token expiró o falla, cerramos sesión
            isRefreshing.set(false);
            authService.logout();
            router.navigate(['/']);
            return throwError(() => refreshError);
          })
        );
      }

      // Si es otro error o ya se está refrescando, devolvemos el error
      return throwError(() => error);
    })
  );
};