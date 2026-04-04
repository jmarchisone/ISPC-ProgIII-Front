import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../servicios/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Reemplazamos booleanos y strings por Signals
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  ngOnInit() {
    const savedUsername = localStorage.getItem('remember_me');
    if (savedUsername) {
      this.loginForm.patchValue({ username: savedUsername, rememberMe: true });
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Actualizamos los signals a su estado de carga
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const { username, password, rememberMe } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: () => {
        if (rememberMe) {
          localStorage.setItem('remember_me', username);
        } else {
          localStorage.removeItem('remember_me');
        }
        
        // Detenemos el loader y navegamos
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // En caso de error, detenemos el loader y mostramos el mensaje
        this.isLoading.set(false);
        this.errorMessage.set('Usuario o contraseña incorrectos. Por favor, intenta de nuevo.');
        console.error('Login failed', error);
      }
    });
  }
}