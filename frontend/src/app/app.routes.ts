import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectCreationComponent } from './project-creation/project-creation.component';
import { ProjectAssignComponent } from './project-assign/project-assign.component';
import { ReportScreenComponent } from './report-screen/report-screen.component';
import { EmployeeLayoutComponent } from './employee-layout/employee-layout.component'; 
import { EmployeeProjectsComponent } from './employee-projects/employee-projects.component'; 

export const routes: Routes = [
    { path: '', component: LoginPageComponent }, // Public Entry Point
    
    // 1. ADMIN / MANAGEMENT FLAT ROUTES (No Sidebar)
    { path: 'app-dashboard', component: DashboardComponent, title: 'Dashboard' }, 
    { path: 'employee-form', component: EmployeeFormComponent, title: 'Employee Management' },
    { path: 'app-project-creation', component: ProjectCreationComponent, title: 'Create Project' },
    { path: 'app-project-assign', component: ProjectAssignComponent, title: 'Assign Project' },
    { path: 'app-report-screen', component: ReportScreenComponent, title: 'Reports' },

    // 2. EMPLOYEE NESTED LAYOUT (Includes dedicated sidebar for tabs)
    {
        path: 'employee-app',
        component: EmployeeLayoutComponent, // Parent component providing the sidebar
        children: [
            // My Info (Employee's main screen, read-only EmployeeFormComponent)
            { path: 'my-info', component: EmployeeFormComponent, title: 'My Info' }, 
            // My Projects (Employee's assigned project list)
            { path: 'my-projects', component: EmployeeProjectsComponent, title: 'My Projects' }, 
            // Default redirect for the /employee-app path
            { path: '', redirectTo: 'my-info', pathMatch: 'full' }
        ]
    },

    // Catch-all: Redirect any unknown path to the login page
    { path: '**', redirectTo: '' }
];