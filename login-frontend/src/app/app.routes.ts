import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { AuthGuardService } from './servicios/auth.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  // Protegemos la ruta de Home con el AuthGuardService
  { path: 'home', component: Home, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: '' }
];