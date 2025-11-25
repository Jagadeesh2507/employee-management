import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

// CRITICAL: Import the 'routes' definition from the separate app.routes.ts file
import { routes } from './app.routes'; 

// Import all required components for Angular's dependency tracking
import { LoginPageComponent } from './login-page/login-page.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectCreationComponent } from './project-creation/project-creation.component';
import { ProjectAssignComponent } from './project-assign/project-assign.component';
import { ReportScreenComponent } from './report-screen/report-screen.component';
import { NotificationBellComponent } from './shared/notification-bell/notification-bell.component';
import { authInterceptor } from './auth.interceptor';

import { MainLayoutComponent } from './main-layout/main-layout.component'; 
import { EmployeeProjectsComponent } from './employee-projects/employee-projects.component'; 
 
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(FormsModule),
    provideHttpClient(withInterceptors([authInterceptor])),
    // CRITICAL: Provide the imported 'routes' constant here
    provideRouter(routes)
  ]
};