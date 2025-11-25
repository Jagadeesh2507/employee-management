import { Component, OnInit } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {
  expiredProjects: any[] = [];
  showDropdown = false;
  selectedProject: any;
  newEndDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchExpiredProjects();
  }

  fetchExpiredProjects(): void {
    this.http.get<any[]>('http://localhost:8080/EmployeeFormApp/api/projects/all').subscribe(data => {
      const today = new Date();
      this.expiredProjects = data.filter(project =>project.status==='EXPIRED' );
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
  
openUpdateModal(project: any): void {
    this.selectedProject = project;
    this.newEndDate = '';
    const modal = new bootstrap.Modal(document.getElementById('updateModal'));
    modal.show();
  }
  
confirmUpdate(): void {
    if (!this.newEndDate) return;

    const updatedProject = { ...this.selectedProject, endDate: this.newEndDate };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<any>(
'http://localhost:8080/EmployeeFormApp/api/projects/create',
    updatedProject,
    { headers: headers }).subscribe(() => {
    this.fetchExpiredProjects();
      bootstrap.Modal.getInstance(document.getElementById('updateModal')).hide();
    });
  }
  
confirmDelete(projectId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will complete the project and unassign all mapped employees.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Complete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.deleteProject(projectId);
      }
    });
  }

  deleteProject(projectId: number): void {
     const url = `http://localhost:8080/EmployeeFormApp/api/projects/${projectId}`;
    
this.http.delete(url).subscribe(() => {
      Swal.fire('Completed!', 'Project and employees unassigned.', 'success');
      this.fetchExpiredProjects();
    }, error => {
      Swal.fire('Error!', 'Failed to delete project.', 'error');
    });
  }



  
}
