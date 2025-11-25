import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Added for completeness (though not strictly needed in this file)

@Component({
  selector: 'app-employee-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-projects.component.html', // Pointing to the HTML file
  styleUrls: ['./employee-projects.component.css'] // Pointing to the CSS file
})
export class EmployeeProjectsComponent implements OnInit {
  
  myProjects: any[] = [];
  loading: boolean = true;
  // ⚠️ API path to fetch projects for the current user
  private API_PROJECT_URL = `http://localhost:8080/EmployeeFormApp/api/projects/my-projects`;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadMyProjects();
  }

  loadMyProjects(): void {
    this.loading = true;
    const empId = sessionStorage.getItem('employeeId');
    this.http.get<any[]>(`${this.API_PROJECT_URL}/${empId}`).subscribe({
  next: (data) => {
    this.myProjects = data;
    console.log(data,'--this is the datas');
    this.loading = false;
  },
  error: (error) => {
    console.error('Error loading assigned projects:', error);
    this.myProjects = [];
    this.loading = false;
  }
    });
  }
  
  getStatusClass(status: string | undefined): string {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'bg-success';
    if (s === 'on hold') return 'bg-warning';
    if (s === 'cancelled') return 'bg-danger';
    return 'bg-info'; // Default for Active/In Progress
  }
  calculateProgress(start: string, end: string): string {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const today = new Date().getTime();

  if (today <= startDate) return "0%";
  if (today >= endDate) return "100%";

  const progress = ((today - startDate) / (endDate - startDate)) * 100;
  return progress.toFixed(0) + "%";
}
}