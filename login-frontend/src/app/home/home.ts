import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // 1. Vinculamos el signal del servicio a una propiedad local
  currentUser = this.authService.currentUser;
  
  // 2. Usamos computed para derivar el nombre de usuario de forma reactiva
  username = computed(() => this.currentUser()?.username || '');

  // Signals para manejar estados y la UI
  userData = signal<any>(null);
  currentView = signal<'welcome' | 'profile' | 'password'>('welcome'); 
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    // Como el AuthService ya carga el usuario desde el localStorage en su constructor,
    // solo verificamos si el signal currentUser() está vacío para expulsarlo por seguridad.
    if (!this.currentUser()) {
      this.logout();
    }
  }

  get f() { return this.passwordForm.controls; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (password !== confirm && control.get('confirmPassword')?.dirty) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  fetchUserData() {
    this.isLoading.set(true);
    // Esta petición adjunta el access_token gracias a tu actualización en el AuthService
    this.authService.getUserData().subscribe({
      next: (data) => {
        this.userData.set(data);
        this.isLoading.set(false);
        this.currentView.set('profile');
      },
      error: () => {
        this.isLoading.set(false);
        // Si el token falló, expiró o fue rechazado por el backend, cerramos sesión
        this.logout(); 
      }
    });
  }

  showPasswordForm() {
    this.passwordForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.currentView.set('password');
  }

  backToHome() {
    this.currentView.set('welcome');
  }

  onChangePasswordSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      old_password: this.passwordForm.value.oldPassword,
      new_password: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        // Muestra el error exacto emitido por Django (ej. "La contraseña actual es incorrecta.")
        this.errorMessage.set(err.error?.error || 'Error al cambiar la contraseña.');
      }
    });
  }

  logout() {
    this.authService.logout(); // Este método ya limpia el localstorage y vacía el signal
    this.router.navigate(['/']);
  }
}