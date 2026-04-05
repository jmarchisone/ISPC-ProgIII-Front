import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
// Importamos el interceptor para que se aplique a todas las peticiones HTTP
import { authInterceptor } from './interceptors/auth.interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Registramos el interceptor globalmente para que se ejecute en todas las peticiones HTTP
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
