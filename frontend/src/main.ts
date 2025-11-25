import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http'; // ✅ Import HttpClientModule
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideRouter(routes), // ✅ Ensure routing is enabled
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch((err) => console.error(err));
