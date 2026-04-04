import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // Usamos un Signal para mantener el estado global del usuario
  currentUser = signal<any>(null);

  constructor() {
    // Al inicializar el servicio, verificamos si ya hay un usuario guardado
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, credentials).pipe(
      tap((res: any) => {
        if (res.access) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('user', JSON.stringify(res.user));
          
          // Actualizamos el signal con la información del usuario
          this.currentUser.set(res.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

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
    
    // Limpiamos el signal
    this.currentUser.set(null);
  }
}