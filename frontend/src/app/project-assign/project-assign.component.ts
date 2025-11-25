import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../auth-service.service';
import { NotificationBellComponent } from '../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-project-assign',
  imports: [CommonModule, FormsModule, RouterModule,NotificationBellComponent],
  templateUrl: './project-assign.component.html',
  styleUrl: './project-assign.component.css',
  standalone: true
})
export class ProjectAssignComponent implements OnInit {
  @ViewChild('assignForm') assignForm!: NgForm;
  assignedEmployees: any = [];
  unassignedEmployees: any = [];
  

selectedFilter: string = 'name'; // default filter

API_BASE = 'http://localhost:8080/EmployeeFormApp/api';
 
  // ✅ Model for project assignment
  assignment = {
    employee: { id: null },
    project: { id: null },
    role: '',
    assignedDate: '',
    remarks: '',
    endDate:''
  };
   user:string='';
  
    activeTab: string = 'assigned'; 
   
onTabClick(tab: string): void {
  this.activeTab = tab;

  if (tab === 'assigned') {
    this.loadAssignedEmployees();
  } else if (tab === 'unassigned') {
    this.loadUnassignedEmployees();
  }
}

  logout(){
   this.authservice.logout();
  }

onFilterChange(filter: string) {
  this.selectedFilter = filter;
  console.log(filter);
  if (filter === 'skill') {
    this.employeeSearchText = this.selectedProjectSkills || '';
    this.searchEmployee(this.employeeSearchText);
  } else {
    this.employeeSearchText = '';
  }
}

 ngOnInit(): void {
  


   this.user=this.authservice.getUsername();
    if(!this.authservice.isLoggedIn()){
      this.router.navigate([''])
    }
    this.checkDeadlineReminder();
    

  this.loadAssignedEmployees();

  this.loadUnassignedEmployees();


  }


 
  // ✅ Search-related variables
  employeeSearchText = '';
  projectSearchText = '';
  selectedProjectSkills='';
  employeeResults: any[] = [];
  projectResults: any[] = [];
 
  // ✅ Messages
  successMessage = '';
  errorMessage = '';
  
  constructor(private http: HttpClient,private authservice:AuthServiceService,private router:Router,@Inject(PLATFORM_ID) private platformId: Object) {}
 
  // 🔍 Search Employee API Call

searchEmployee(searchText: string) {
  if (searchText.length >= 3) {
    let endpoint = '';

    if (this.selectedFilter === 'skill') {
      endpoint = `${this.API_BASE}/secured/employees/search-by-skill/${searchText}`;
    } else {
      endpoint = `${this.API_BASE}/secured/employees/search/${searchText}`;
    }

    this.http.get<any[]>(endpoint).subscribe({
      next: data => this.employeeResults = data,
      error: () => this.employeeResults = []
    });
  } else {
    this.employeeResults = [];
  }
}

 
  // 👤 Select employee from dropdown
  selectEmployee(emp: any) {
    console.log(emp.id);
    window.scrollTo({top:0,behavior:'smooth'});
this.assignment.employee.id = emp.id;
this.employeeSearchText = emp.name;
this.assignment.role=emp.designation;
    this.employeeResults = [];
  }
 
  // 🔍 Search Project API Call
  searchProject(title: string) {
    if (title.length >= 2) {
      this.http.get<any[]>(`${this.API_BASE}/projects/search/${title}`)
        .subscribe({
          next: data => this.projectResults = data,
          error: () => this.projectResults = []
        });
    } else {
      this.projectResults = [];
    }
  }
 
  // 📌 Select project from dropdown
  selectProject(proj: any) {
this.assignment.project.id = proj.id;
    this.projectSearchText = proj.title;
    this.assignment.endDate=proj.endDate;
    this.selectedProjectSkills = proj.technology;
    this.projectResults = [];
  }
 
  // 🚀 Submit form data to backend
  assignProject() {
    console.log('assginproject');
    console.log(this.assignment.employee.id);
this.http.post<any>('http://localhost:8080/EmployeeFormApp/api/assignments/save', this.assignment)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.successMessage = res.message;
            this.errorMessage = '';
            this.loadAssignedEmployees();
            this.loadUnassignedEmployees();
            this.resetForm(this.assignForm);
          } else {
            this.successMessage = '';
            this.errorMessage = res.message || 'Assignment failed';
          }
        },
        error: (err) => {
          this.successMessage = '';
          this.errorMessage = err.error?.message || 'Server error';
        }
      });
  }
 
  // ♻️ Reset form after success
  resetForm(form: NgForm): void  {
    form.resetForm(this.assignForm);
    this.assignment = {
      employee: { id: null },
      project: { id: null },
      role: '',
      assignedDate: '',
      remarks: '',
      endDate:''
    };
    setTimeout(()=> {
      this.errorMessage='';
      this.successMessage='';},2000);
      this.employeeSearchText = '';
      this.projectSearchText = '';
  
  }
  paginatedAssignedEmployees: any[] = [];
  paginatedUnassignedEmployees:any[] =[];
 // allEmployees: any[] = [];
  currentAssignedPage: number = 1;
  currentUnAssignedPage: number =1;
  pageSize: number = 3;
  totalAssignedPages: number = 0;
  totalUnAssignedPages: number=0;
  maxPagesToShow: number = 3;
 
  loadAssignedEmployees(): void {
this.http.get<any>('http://localhost:8080/EmployeeFormApp/api/assignments/assigned')
      .subscribe({
        next:(data) => {
          console.log('assignedEmployees' + this.assignedEmployees);
          this.assignedEmployees = data;
        this.totalAssignedPages = Math.ceil(this.assignedEmployees.length / this.pageSize);
        this.updatePaginatedAssignedEmployees();
        },
        error:(err)=>{
          console.error('Error fetching assigned employees :',err);
        }
      });
       console.log(this.assignedEmployees);
  }
  updatePaginatedAssignedEmployees(): void {
    const start = (this.currentAssignedPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAssignedEmployees = this.assignedEmployees.slice(start, end);
  }
  changeAssignedPage(page: number): void {
    if (page >= 1 && page <= this.totalAssignedPages) {
      this.currentAssignedPage = page;
      this.updatePaginatedAssignedEmployees();
    }
  }
  onAssignedPageSizeChange(event:any){
    this.pageSize=+event.target.value;
    this.totalAssignedPages = Math.ceil(this.assignedEmployees.length / this.pageSize);
    this.updatePaginatedAssignedEmployees();
    
  }
  getAssignedPages(): number[] {
    const pages: number[] = [];
    if (this.totalAssignedPages <= this.maxPagesToShow) {
      // If total pages are 3 or less, display all of them
      for (let i = 1; i <= this.totalAssignedPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage: number;
      let endPage: number;

      if (this.currentAssignedPage === 1) {
        startPage = 1;
        endPage = 3;
      } else if (this.currentAssignedPage === this.totalAssignedPages) {
        startPage = this.totalAssignedPages - 2;
        endPage = this.totalAssignedPages;
      } else {
        startPage = this.currentAssignedPage - 1;
        endPage = this.currentAssignedPage + 1;
      }
      startPage = Math.max(1, startPage);
      endPage = Math.min(this.totalAssignedPages, endPage);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }
 
  loadUnassignedEmployees(): void {
this.http.get('http://localhost:8080/EmployeeFormApp/api/assignments/unassigned')
      .subscribe({
        next:(data) => {
          this.unassignedEmployees=data;
          this.totalUnAssignedPages = Math.ceil(this.unassignedEmployees.length / this.pageSize);
          this.updatePaginatedUnAssignedEmployees();

        }   
  });
}
updatePaginatedUnAssignedEmployees(): void {
    const start = (this.currentUnAssignedPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUnassignedEmployees = this.unassignedEmployees.slice(start, end);
  }
   changeUnAssignedPage(page: number): void {
    if (page >= 1 && page <= this.totalUnAssignedPages) {
      this.currentUnAssignedPage = page;
      this.updatePaginatedUnAssignedEmployees();
    }
  }
  onUnAssignedPageSizeChange(event:any){
    this.pageSize=+event.target.value;
    this.totalUnAssignedPages = Math.ceil(this.unassignedEmployees.length / this.pageSize);
    this.updatePaginatedUnAssignedEmployees();
    
  }
  getUnAssignedPages(): number[] {
    const pages: number[] = [];
    if (this.totalUnAssignedPages <= this.maxPagesToShow) {
      // If total pages are 3 or less, display all of them
      for (let i = 1; i <= this.totalUnAssignedPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage: number;
      let endPage: number;

      if (this.currentUnAssignedPage === 1) {
        startPage = 1;
        endPage = 3;
      } else if (this.currentUnAssignedPage === this.totalUnAssignedPages) {
        startPage = this.totalUnAssignedPages - 2;
        endPage = this.totalUnAssignedPages;
      } else {
        startPage = this.currentUnAssignedPage - 1;
        endPage = this.currentUnAssignedPage + 1;
      }
      startPage = Math.max(1, startPage);
      endPage = Math.min(this.totalUnAssignedPages, endPage);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }
  
 
  // assignEmployee(emp:any): void {
  //   console.log(emp);
  //   this.
  //   this.assignment.employee.id=emp.id;
  //   this.assignment.role=emp.designation;

  // }
 
  removeAssignment(assignmentId: number) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This employee will be unassigned from the project!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, unassign!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('unassign');
this.http.delete(`http://localhost:8080/EmployeeFormApp/api/assignments/remove/${assignmentId}`)
        .subscribe({
          next: (res: any) => {
Swal.fire('Unassigned!', res.message, 'success');
            this.loadAssignedEmployees(); // Reload list
          },
          error: () => {
Swal.fire('Error', 'Failed to unassign employee', 'error');
          }
        });
    }
  });
}


// checkDeadlineReminder(): void {
//   console.log('alert message for deadline');
// this.http.get('http://localhost:8080/EmployeeFormApp/api/assignments/upcoming-deadlines')  
//     .subscribe((projects: any) => {
//       console.log('alert message for deadline'+ projects);
//       if (projects.length > 0) {
//         const projectList = projects     
//         .map((p: any) => {
//          const endDate = new Date(p.endDate).toLocaleDateString(); // Convert timestamp to readable date
//         return `<li><b>${p.title}</b> - Ends on: ${endDate}</li>`;
//       })
//         .join('');

 
// Swal.fire({
//           title: 'Upcoming Deadlines!',
//           html: `<ul style="text-align:left">${projectList}</ul>`,
//           icon: 'warning',
//           showDenyButton:true,
//           showCancelButton:true,
//           confirmButtonText: 'OK',
//           denyButtonText:'Snooze',
//           cancelButtonText:'Close',
//           width: 600,
//           allowOutsideClick:false
//         }).then((result)=>{
//           if(result.isConfirmed){
//             console.log('User clicked ok');
//           }
//           else if(result.isDenied){
//             this.askSnoozeTime();
//           }
//           else if(result.dismiss===Swal.DismissReason.cancel){
//             console.log('User closed the popUp');
//           }
//         });
//       }
//     }, error => {
//       console.error('Error fetching deadline reminders', error);
//     });
// }
// askSnoozeTime(): void {
// Swal.fire({
//     title: 'Snooze Reminder',
//     input: 'radio',
//     inputOptions: {
//       '5': 'Snooze for 5 minutes',
//       '10': 'Snooze for 10 minutes',
//       '30': 'Snooze for 30 minutes'
//     },
//     inputValidator: (value) => {
//       if (!value) {
//         return 'You need to choose a snooze duration!';
//       }
//       return null;
//     },
//     confirmButtonText: 'Snooze',
//     showCancelButton: true
//   }).then((result) => {
//     if (result.isConfirmed && result.value) {
//       const snoozeMinutes = parseInt(result.value, 10);
//       console.log(`Snoozed for ${snoozeMinutes} minutes`);
//       setTimeout(() => {
//         this.checkDeadlineReminder(); // Reshow the reminder
//       }, snoozeMinutes * 60 * 1000);
//     }
//   });
// }

checkDeadlineReminder(): void {
  if (isPlatformBrowser(this.platformId)) {
    const storedSnoozeTime = localStorage.getItem('deadlineSnoozeTime');
    const now = new Date().getTime();

    // 🚫 Skip reminder if snoozed time is not yet over
    if (storedSnoozeTime && now < parseInt(storedSnoozeTime)) {
      return;
    }
  }

  this.http.get('http://localhost:8080/EmployeeFormApp/api/assignments/upcoming-deadlines')
    .subscribe(
      (projects: any) => {
        if (projects.length > 0) {
          const projectList = projects
            .map((p: any) => {
              const endDate = new Date(p.endDate).toLocaleDateString();
              return `<li><b>${p.title}</b> - Ends on: ${endDate}</li>`;
            })
            .join('');
          Swal.fire({
            title: '🔕 Project Deadline Reminder',
            html: `
              <p style="white-space: pre-wrap;">${projectList}</p>
              <label for="snoozeTime">Snooze for:</label>
              <select id="snoozeTime" class="swal2-select">
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </select>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Snooze',
            cancelButtonText: 'Ignore',
            allowOutsideClick: false,
            preConfirm: () => {
              const selectedValue = (document.getElementById('snoozeTime') as HTMLSelectElement).value;
              return selectedValue;
            }
          }).then((result) => {
            if (result.isConfirmed && result.value) {
              const snoozeMinutes = parseInt(result.value);
              const snoozeUntil = new Date().getTime() + snoozeMinutes * 60 * 1000;
              localStorage.setItem('deadlineSnoozeTime', snoozeUntil.toString());
              setTimeout(() => {
                this.checkDeadlineReminder();
              }, snoozeMinutes * 60 * 1000);
            }
          });
        }
      },
      (error) => {
        console.error('Error fetching deadline reminders:', error);
      }
    );
}



}

