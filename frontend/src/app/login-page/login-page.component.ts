import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService, LoginResponse } from '../auth-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  username: string = '';
  password: string = '';
  newUsername: string = '';
  newPassword: string = '';
  isLoginMode: boolean = true;

  constructor(private authService: AuthServiceService, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  login() {
    if (!this.username || !this.password) {
      Swal.fire('Error!', 'Please enter both username and password.', 'error');
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response: LoginResponse) => {
        
        if (response.message === 'Login successful' && response.token) {
          
          if (!response.role) {
              Swal.fire('Error!', 'Login data incomplete (Missing User Role).', 'error');
              this.authService.logout();
              return;
            }
            
          // 1. Save Credentials
          this.authService.setUsername(this.username);
          this.authService.saveUserRole(response.role); 
          this.authService.saveToken(response.token);
          if (response.employeeId !== null && response.employeeId !== undefined) {
          sessionStorage.setItem("employeeId", response.employeeId.toString());
}
          
          Swal.fire('Success!', 'Login Successful', 'success');

          // 2. Role-based Redirection (Hybrid Paths)
          const userRole = (response.role || '').toLowerCase(); 

          if (userRole === 'admin') {
            this.router.navigate(['/app-dashboard']); // Admin uses flat path (no sidebar)
          } else if (userRole === 'employee') {
            this.router.navigate(['/employee-app/my-info']); // Employee uses NEW nested sidebar path
          } else {
            Swal.fire('Error!', `Unknown user role: ${response.role}. Redirecting to login.`, 'error');
            this.authService.logout(); 
          }

        } else {
          Swal.fire('Error!', response.message || 'Invalid credentials', 'error');
        }
      },
      error: (error) => {
        console.error('Login Error:', error);
        Swal.fire('Error!', 'Login failed. Please check your network or credentials.', 'error');
      }
    });
  }

  signup() {
    
if (!this.newUsername || !this.newPassword) {
    Swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
    return;
  }

    this.authService.signup(this.newUsername, this.newPassword).subscribe({
      next: (response) => {
        Swal.fire('Success!',response.trim() , 'success');
        this.toggleMode(); 
      },
      error: (error) => {
        Swal.fire('Error!',"Username already exists" , 'error');
      }
    });
  }
}