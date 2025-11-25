import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html', // Pointing to the HTML file
  styleUrls: ['./main-layout.component.css'] // Pointing to the CSS file
})
export class MainLayoutComponent implements OnInit {
  
  userRole: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    // 1. Get the role from session storage
    this.userRole = sessionStorage.getItem('userRole') || ''; 
    
    // 2. Initial redirect logic after login to land on the correct default page
    if (this.router.url === '/app' || this.router.url === '/app/') {
      if (this.userRole === 'Admin') {
        this.router.navigate(['/app/dashboard']);
      } else if (this.userRole === 'Employee') {
        this.router.navigate(['/app/my-info']);
      } else {
        this.router.navigate(['/']); // Redirect to login if role is unknown
      }
    }
  }
}