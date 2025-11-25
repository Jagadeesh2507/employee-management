import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthServiceService } from '../auth-service.service';
import { CommonModule } from '@angular/common';
import { NotificationBellComponent } from '../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NotificationBellComponent, RouterModule], // Ensure RouterModule is included
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
user:string='';

constructor(private router:Router,private authservice:AuthServiceService){}

navigateTo(route:string){
  // 🎯 FIX: Pass the route directly since the HTML gives the full path ('/app/...')
  this.router.navigate([route]); 
}

  ngOnInit(): void {
    this.user=this.authservice.getUsername();
     
     // 🎯 CRITICAL FIX: Add Role Check
     const userRole = this.authservice.getUserRole().toLowerCase();
     if (userRole !== 'admin') {
         this.router.navigate(['/app/my-info']); // Redirect employee to their default screen
     }
   }
 logout(){
   this.authservice.logout();
  }
}