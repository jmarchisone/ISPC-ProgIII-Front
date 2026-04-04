import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res: any) => {
        // Aquí guardaremos el token si el login es exitoso
        if (res.access) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  // Endpoints que preparamos en el backend para el OTP
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset-request/`, { email });
  }

  verifyPasswordReset(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/password-reset-verify/`, data);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me');
  }
}