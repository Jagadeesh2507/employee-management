import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex" style="min-height: 100vh;">

      <!-- ⭐ SIDEBAR ONLY FOR EMPLOYEE ⭐ -->
      <nav *ngIf="userRole === 'Employee'"
           class="sidebar bg-dark text-white p-3 shadow-lg">

        <h4 class="mb-4 text-warning fw-bold">Employee Navigation</h4>

        <ul class="nav flex-column gap-3">

          <li class="nav-item">
            <a routerLink="my-info" routerLinkActive="active"
               class="nav-link text-white d-flex align-items-center gap-2">
              <i class="bi bi-person-circle"></i> My Info
            </a>
          </li>

          <li class="nav-item">
            <a routerLink="my-projects" routerLinkActive="active"
               class="nav-link text-white d-flex align-items-center gap-2">
              <i class="bi bi-folder-fill"></i> My Projects
            </a>
          </li>

        </ul>
      </nav>

      <!-- ⭐ MAIN CONTENT AREA ⭐ -->
      <main class="content flex-grow-1 p-4 bg-light position-relative">
        <router-outlet></router-outlet> 
      </main>

    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-width: 260px;
      padding-top: 20px !important;
    }
    .nav-link {
      border-radius: 5px;
      transition: background-color 0.2s;
    }
    .nav-link.active {
      background-color: #0d6efd;
      font-weight: bold;
    }
  `]
})
export class EmployeeLayoutComponent implements OnInit {

  userRole: string = ''; // Get from localStorage or auth service

  constructor(private router: Router) {}

  ngOnInit(): void {

    // Fetch role (Admin / Employee)
    this.userRole = localStorage.getItem('role') || 'Employee';

    // Default child route
    if (this.router.url === '/employee-app' || this.router.url === '/employee-app/') {
      this.router.navigate(['/employee-app/my-info']);
    }
  }
}
