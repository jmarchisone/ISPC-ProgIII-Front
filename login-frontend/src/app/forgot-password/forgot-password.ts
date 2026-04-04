import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../servicios/auth'; // Asegúrate de que el path sea el correcto a tu servicio

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Manejo de estado visual
  step = signal<number>(1); // 1: Pedir Email, 2: Ingresar OTP y Nueva Pass
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  emailGuardado = signal<string>(''); // Guardamos el email para el paso 2

  // Formulario Paso 1
  requestForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // Formulario Paso 2
  verifyForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Getter para accesos rápidos en el HTML
  get reqF() { return this.requestForm.controls; }
  get verF() { return this.verifyForm.controls; }

  // Validador de contraseñas iguales
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword && control.get('confirmPassword')?.dirty) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // --- MÉTODOS ---

  onRequestSubmit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    const email = this.requestForm.value.email;

    this.authService.requestPasswordReset(email).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.emailGuardado.set(email); // Lo guardamos para mandarlo en el paso 2
        this.step.set(2); // Pasamos al formulario 2
        this.successMessage.set('Si el correo existe, te hemos enviado un código de 4 dígitos (Revisa la consola del backend).');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Hubo un error al procesar la solicitud.');
      }
    });
  }

  onVerifySubmit() {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      email: this.emailGuardado(),
      otp: this.verifyForm.value.otp,
      new_password: this.verifyForm.value.newPassword
    };

    this.authService.verifyPasswordReset(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Contraseña actualizada con éxito. Redirigiendo al login...');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        if (err.error && err.error.error) {
          this.errorMessage.set(err.error.error); // Ej: "El código OTP ha expirado."
        } else {
          this.errorMessage.set('Código inválido o error en la solicitud.');
        }
      }
    });
  }
}