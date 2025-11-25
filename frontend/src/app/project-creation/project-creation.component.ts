import { CommonModule } from '@angular/common';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmployeeResponse } from '../interfaces/employee-response.interface';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../auth-service.service';
import { NotificationBellComponent } from "../shared/notification-bell/notification-bell.component";

interface projects {
  id: number;
  title: string;
  description: string;
  clientName: string;
  startDate: string;
  endDate: string;
  // add more fields if needed
}
@Component({
  selector: 'app-project-creation',
  imports: [FormsModule, CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './project-creation.component.html',
  styleUrl: './project-creation.component.css'
})

export class ProjectCreationComponent implements OnInit {
  @ViewChild('projectForm') projectForm!: NgForm;
project: any = {
    id:'',
    title: '',
    description: '',
    technology: '',
    clientName: '',
    budget: '',
    startDate: '',
    endDate: ''
  };
 
  allProjects: any = [];
  projects: any = [];
  searchTerm: string = '';
  pageSize: number = 3;
  currentPage: number = 1;
  totalPages: number = 1;
  //selectedProjectId: number | null = null;
 
  successMessage = '';
  errorMessage = '';
 
  constructor(private http: HttpClient,private router:Router,private authservice:AuthServiceService) {}
 user:string='';
  logout(){
    this.authservice.logout();
  }
  ngOnInit(): void {
    this.user=this.authservice.getUsername();
    if(!this.authservice.isLoggedIn()){
      this.router.navigate([''])
    }
    this.loadProject();
  }
 
  loadProject() {
      this.http.get('http://localhost:8080/EmployeeFormApp/api/projects/all').subscribe(data => {
      this.allProjects = data;
      this.filteredProject=[...this.allProjects];
      this.totalPages = Math.ceil(this.allProjects.length / this.pageSize);
      this.applyPagination();
    });
  }
 
  createProject() {
    console.log(this.project);
    if (new Date(this.project.endDate) < new Date(this.project.startDate)) {
      this.errorMessage = 'End date must be after start date';
      this.successMessage = '';
      return;
    }
     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
 
this.http.post<any>(
'http://localhost:8080/EmployeeFormApp/api/projects/create',
    this.project,
    { headers: headers }
  ).subscribe({
    next: (res) => {
      console.log(res.status);
      if (res.status === 'success') {
        this.successMessage = res.message;
        this.errorMessage = '';
        this.loadProject();
      } else {
        this.successMessage = '';
        this.errorMessage = res.message;
      }
 
      this.resetForm(this.projectForm);
    },
    error: (err) => {
      this.errorMessage = 'Failed to create project. Please try again.';
      this.successMessage = '';
    }
  });
  }
 
  resetForm(form: NgForm): void {
    form.resetForm(this.projectForm);
    this.project = {
      title: '',
      description: '',
      technology: '',
      clientName: '',
      budget: '',
      startDate: '',
      endDate: ''
    };
    setTimeout(()=> {
      this.errorMessage='';
      this.successMessage='';},2000);
    
    //this.selectedProjectId = null;
    this.isEditMode=false;
  }
   confirmDelete(id: number): void {
      console.log(id);
      Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteProject(id);
        }
      });
    }
  
  deleteProject(id: number) {
   
      const url = `http://localhost:8080/EmployeeFormApp/api/projects/${id}`;
       this.http.delete(url).subscribe(
            (response: any) => { 
              Swal.fire(
                'Deleted!',
                response.message || 'Project has been deleted.',
                'success'
              );
              this.loadProject(); 
              this.resetForm(this.projectForm);
            },
            (error) => {
              console.error('Error deleting Project:', error);
              let errorMessage = 'Failed to delete Project. Please try again.';
              if (error.error && error.error.message) {
                errorMessage = `Error: ${error.error.message}`;
              }
              Swal.fire('Error!', errorMessage, 'error');
            }
          );
    }
 
sortDirection: 'asc' | 'desc' = 'asc';

toggleSort(): void {
  this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  console.log('Toggled sort direction:', this.sortDirection);
  this.applySorting();
  this.applyPagination();
}





applySorting(): void {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toISOString().split('T')[0]; // yyyy-mm-dd
  };

  this.allProjects.sort((a: any, b: any) => {
    const dateA = formatDate(a.endDate);
    const dateB = formatDate(b.endDate);

    console.log(`Formatted Date A: ${dateA}, Formatted Date B: ${dateB}`);

    return this.sortDirection === 'asc'
      ? dateA.localeCompare(dateB)
      : dateB.localeCompare(dateA);
  });
  this.filteredProject = [...this.allProjects];
  console.log('Sorted Projects:', this.filteredProject);
}

  applyPagination() {
    this.totalPages = Math.ceil(this.filteredProject.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.currentPage=1;
    this.projects = this.filteredProject.slice(start, end);
  }
 filteredProject: any[]=[];
  onSearchChange(): void {
  const term = this.searchTerm.toLowerCase().trim();
 
  if (term === '') {
    this.filteredProject = [...this.allProjects]; // restore full list
  } else {
    this.filteredProject = this.allProjects.filter((project: projects) =>
      project.title.toLowerCase().includes(term)
    );
  }
 
  this.currentPage = 1;
  this.applyPagination();
}
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }
  maxPagesToShow: number = 3;
  getPages(): number[] {
    const pages: number[] = [];
    if (this.totalPages <= this.maxPagesToShow) {
      // If total pages are 3 or less, display all of them
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage: number;
      let endPage: number;

      if (this.currentPage === 1) {
        startPage = 1;
        endPage = 3;
      } else if (this.currentPage === this.totalPages) {
        startPage = this.totalPages - 2;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - 1;
        endPage = this.currentPage + 1;
      }
      startPage = Math.max(1, startPage);
      endPage = Math.min(this.totalPages, endPage);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }
 
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }
 
  goToPage(page: number) {
    this.currentPage = page;
    this.applyPagination();
  }
 
  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
 isEditMode:boolean=false;
  editProject(proj: any) {
    console.log("project :" +proj);
    this.isEditMode=true;
    this.project.id=proj.id;
     this.project.title =proj.title;
     this.project.technology=proj.technology;
     this.project.clientName=proj.clientName;
     this.project.budget=proj.budget;
     this.project.description=proj.description;
     this.project.startDate=new Date(proj.startDate).toISOString().substring(0, 10);
     this.project.endDate=new Date(proj.endDate).toISOString().substring(0, 10);
    // this.selectedProjectId = proj.id;
  }
  
downloadExcel(projectId: number): void {
  const url = `http://localhost:8080/EmployeeFormApp/api/projects/assigned-employees-excel/${projectId}`;

Swal.fire({
    title: 'Downloading...',
    text: 'Please wait while the file is being downloaded.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.http.get(url, { responseType: 'blob' }).subscribe({
    next: (blob) => {
      // Check if the blob is actually an error message
      Swal.close(); 
      if (blob.size === 0) {
        console.log('size zer0');
        Swal.fire('Info', 'No employees assigned to this project.', 'info');
        return;
      }

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `assigned-employees-${projectId}.xlsx`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    },
    error: (err) => {
      Swal.close(); 
      if (err.status === 404) {
        const reader = new FileReader();
        reader.onload = () => {
          Swal.fire('Info', reader.result as string, 'info');
        };
        reader.readAsText(err.error); // Read error message from backend
      }
 else {
        Swal.fire('Error', 'Failed to download Excel file.', 'error');
      }
    }
  });
}

}
