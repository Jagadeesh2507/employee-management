import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders,HttpEventType,HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { EmployeeResponse } from '../interfaces/employee-response.interface';
import { filter } from 'rxjs/operators';
import { AuthServiceService } from '../auth-service.service';
import { LoginPageComponent } from '../login-page/login-page.component';
import { Router, RouterModule } from '@angular/router'
import { NotificationBellComponent } from '../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
  imports: [FormsModule, CommonModule,RouterModule,NotificationBellComponent]
})
export class EmployeeFormComponent implements OnInit {
  @ViewChild('employeeForm') employeeForm!: NgForm;
  searchname = '';
  searchResults: any[] = [];
  hasBankAccountDisabled: boolean = false;
  employee: any = {
    id: '',
    name: '',
    designation: '',
    gender: '',
    skill:'',
    skillsArray: [] as string [],
    phoneNumber: '',
    email: '',
    dateofjoining: '',
    hasBankAccount: '',
    bankName: '',
    accountNumber: '',
    accId: '',
      username:'',
      password:'',
      selectedRole:''
  };
  availableRoles = ['ADMIN', 'USER', 'MANAGER'];
  private API_BASE_URL = 'http://localhost:8080/EmployeeFormApp/api/secured/employees';
  maxDateForJoining: string;
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef,private authservice:AuthServiceService,private router:Router) {
    const today = new Date();
    this.maxDateForJoining = today.toISOString().split('T')[0];
  }
  isAdmin: boolean = false;
isEmployee: boolean = false;

  
onRoleChange(event: any) {
  const role = event.target.value;
  if (event.target.checked) {
    this.employee.user.roles.push(role);
  } else {
    this.employee.user.roles = this.employee.user.roles.filter((r:string) => r !== role);
  }
}


  noRecordsFoundMessage: string = '';
  onSearch(): void {
    console.log('searchmethod');
    if (this.searchname.length >= 3) {
      const url = `http://localhost:8080/EmployeeFormApp/api/secured/employees/search/${this.searchname}`;
      this.http.get<any[]>(url).subscribe(
        (data) => {
          this.searchResults = data;
          if (this.searchResults.length == 0) {
            
            this.noRecordsFoundMessage = 'No records found for your search.';
          }
          else {
            this.noRecordsFoundMessage = '';
          }
          console.log(this.searchResults);
        },
        (error) => {
          console.error('Search error', error);
        }
      );
    } else {
      // alert('Please enter at least 3 letters.');
      let errorMessage = 'Please enter at least 3 letters.';
      Swal.fire('Error!', errorMessage, 'error');
    }
  }


  paginatedEmployees: any[] = [];
  allEmployees: any[] = [];
  currentPage: number = 1;
  pageSize: number = 3;
  totalPages: number = 0;
  maxPagesToShow: number = 3;

 searchBankName : string = '';
  bankSearchResults: any[] = [];
  bankSearchPerformed: boolean = false;
usernameDisabled:boolean=false;
  selectEmployee(emp: any): void {
    console.log(emp);
    this.employee = {
      id: emp.id,
      name: emp.name || '',
      designation: emp.designation || '',
      gender: emp.gender || '',
      skillsArray:emp.skill?emp.skill.split(',').map((s:string)=>s.trim()):[],
      phoneNumber: emp.phoneNumber || '',
      email: emp.email || '',
      dateofjoining: emp.dateofJoining || '',
      hasBankAccount: emp.hasbankaccount === 'true',
      bankName: emp.account.bankName || '',
      accountNumber: emp.account.accountNumber,
      accId: emp.account.id,
      userId:emp.user.id,
        username:emp.user.username ||'',
        password:emp.user.password||'',
        selectedRole:emp.user.role||''
      
    };
    console.log(emp.account.accountNumber);
    console.log('Date of Joining after selecting:', this.employee.dateofJoining);
    this.hasBankAccountDisabled = this.employee.hasBankAccount === true;
    this.usernameDisabled = !!this.employee.username;
    this.searchResults = [];
    this.searchname = '';

    const modalEl = document.getElementById('searchModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    this.cdr.detectChanges();
  }
  user:string='';
  userRole:string='';
 ngOnInit(): void {

  this.user = this.authservice.getUsername();
  this.userRole = sessionStorage.getItem('userRole') || '';

  this.isAdmin = this.userRole.toLowerCase() === 'admin';
  this.isEmployee = this.userRole.toLowerCase() === 'employee';

  if (!this.authservice.isLoggedIn()) {
    this.router.navigate(['']);
    return;
  }

  // ADMIN → load complete list
  if (this.isAdmin) {
    this.loadEmployees();
  }

  // EMPLOYEE → load only his own details
  if (this.isEmployee) {
    const idString = sessionStorage.getItem('employeeId');

    if (idString) {
      const empId = Number(idString);

      this.http.get(`http://localhost:8080/EmployeeFormApp/api/secured/employees/${empId}`)
        .subscribe((emp: any) => {
          this.selectEmployee(emp); // Fill form
        });
    }
  }
}

  logout(){
    this.authservice.logout();
  }

  openSearchModal(): void {
    const modalEl = document.getElementById('searchModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  setSelectedEmployee(data: any): void {
    console.log(data);
    this.employee = { ...data };
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
  submitted=false;
 onSubmit(): void {
  this.submitted=true;

  
 
  // Convert skill array → string for backend
  this.employee.skill = this.employee.skillsArray.join(', ');
 const payload={ ...this.employee };
 delete payload.skillsArray;
  console.log('✅ Final Employee Data:', this.employee);
  if (this.employeeForm.valid) {
    console.log('Submitted Employee Data:', payload);
    console.log('Sending data to backend...');
 
    this.http.post<EmployeeResponse>('http://localhost:8080/EmployeeFormApp/api/secured/employees/save.ws', payload)
      .subscribe({
        next: (response: EmployeeResponse) => {
          console.log('Employee saved successfully!', response);
 
          if (response.status === 'Success') {
            Swal.fire(
              'Success!',
              response.message || 'Employee saved successfully!',
              'success'
            ).then(() => {
              this.onReset();
              this.loadEmployees(); // Reload list after save
            });
          } else {
            // Backend returned custom failure
            let title = 'Error!';
            let text = response.message || 'An unexpected error occurred during save.';
            let icon: 'error' | 'warning' | 'info' | 'question' = 'error';
 
            if (text.includes('already exists')) {
              title = 'Conflict!';
              icon = 'warning';
            }
 
            Swal.fire(title, text, icon);
          }
        },
        error: (error) => {
          console.error('Error saving employee:', error);
          let errorMessage = 'Something went wrong. Please try again.';
 
          if (error.error && error.error.message) {
            errorMessage = `Error: ${error.error.message}`;
          }
 
          Swal.fire('Error!', errorMessage, 'error');
        }
      });
  } else {
    // ❌ Form invalid — show validation errors
    this.markFormGroupTouched(this.employeeForm);
 
    let errorMessage = 'Please correct the following errors:\n';
 
    // Check each field manually
    if (!this.employee.name) {
      errorMessage += '• Employee Name is required.\n';
    } else if (this.employeeForm.controls['name']?.errors?.['minlength']) {
      errorMessage += '• Employee Name must be at least 3 characters long.\n';
    }
 
    if (!this.employee.designation) {
      errorMessage += '• Designation is required.\n';
    }
 
    if (!this.employee.gender) {
      errorMessage += '• Gender is required.\n';
    }
 
    if (!this.employee.phoneNumber) {
      errorMessage += '• Phone Number is required.\n';
    }
 
    if (!this.employee.email) {
      errorMessage += '• Email is required.\n';
    } else if (this.employeeForm.controls['email']?.errors?.['email']) {
      errorMessage += '• Please enter a valid Email address.\n';
    }
 
    if (!this.employee.dateofjoining) {
      errorMessage += '• Date of Joining is required.\n';
    }
 
    if (this.employee.hasBankAccount === undefined || this.employee.hasBankAccount === null) {
      errorMessage += '• Please select if you have a Bank Account.\n';
    } else if (this.employee.hasBankAccount) {
      if (!this.employee.bankName) {
        errorMessage += '• Bank Name is required.\n';
      }
 
      if (!this.employee.accountNumber) {
        errorMessage += '• Account Number is required.\n';
      } else if (!/^[0-9]{9,18}$/.test(this.employee.accountNumber)) {
        errorMessage += '• Account Number must be between 9 and 18 digits.\n';
      }
    }
 
    if (!this.employee.skillsArray || this.employee.skillsArray.length === 0) {
      errorMessage += '• At least one skill must be added.\n';
    }
    // if(!this.employee.none){
    //   errorMessage+='skill'
    // }
    // ✅ Finally show SweetAlert
    Swal.fire('Validation Error', `<pre style="text-align:left">${errorMessage}</pre>`, 'warning');
  }
}
 
  private markFormGroupTouched(formGroup: NgForm) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });

  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  confirmDelete(employeeId: number): void {
    console.log(employeeId);
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
        this.deleteEmployee(employeeId);
      }
    });
  }

  // Method to send delete request to the backend
  deleteEmployee(employeeId: number): void {
    console.log(employeeId);
    const url = `http://localhost:8080/EmployeeFormApp/api/secured/employees/delete/${employeeId}`;
    this.http.delete(url).subscribe(
      (response: any) => { // Assuming your backend delete might return a simple success object
        Swal.fire(
          'Deleted!',
          response.message || 'Employee has been deleted.',
          'success'
        );
        this.loadEmployees(); // Reload the list after deletion
        this.onReset(); // Reset the form in case the deleted employee was being edited
      },
      (error) => {
        console.error('Error deleting employee:', error);
        let errorMessage = 'Failed to delete employee. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = `Error: ${error.error.message}`;
        }
        Swal.fire('Error!', errorMessage, 'error');
      }
    );
  }

 onReset(): void {
    if (this.employeeForm) { // Ensure the form is available
      this.resetForm(this.employeeForm);
    } else {
      // Fallback if employeeForm is not yet available (e.g., during initialization)
      this.employee = {
        name: '', gender: '', dateofjoining: new Date(), designation: '',
        email: '', phoneNumber: '', hasBankAccount: '',skill:'',
        accId: undefined,
        accountNumber: undefined,
        bankName: undefined
      };
      this.hasBankAccountDisabled = false;
      this.noRecordsFoundMessage = '';
    }
  }
  resetForm(form: NgForm): void {
    form.resetForm(); // Resets form controls to pristine state
    this.employee = { // Reset model to initial state
      name: '', gender: '', dateofjoining: new Date(), designation: '',
      email: '', phoneNumber: '', hasBankAccount: '',skill:'', // Ensure hasBankAccount is false initially
      accId: undefined, // Explicitly undefined for new accounts
      accountNumber: undefined,
      bankName: undefined
    };
    this.hasBankAccountDisabled = false; // Reset the state of this flag
    this.noRecordsFoundMessage = ''; // Clear any previous messages
  //  this.cdr.detectChanges(); // Force change detection after reset
  }



skillInput: string = '';
allSkills: string[] = ['Java', 'Spring Boot', 'Angular', 'Python', 'SQL'];
filteredSkills: string[] = [];




onSkillInputChange() {
  const input = this.skillInput.trim().toLowerCase();
 
  if (input.length === 0) {
    this.filteredSkills = [];
    return;
  }
 
  // ✅ Make sure employee.skillsArray exists before using map
  const currentSkills = (this.employee.skillsArray || []).map((s: string) => s.toLowerCase());
 
  this.filteredSkills = this.allSkills.filter(
    skill => skill.toLowerCase().includes(input) && !currentSkills.includes(skill.toLowerCase())
  );
}
  addSkill(skill: string) {
  if (!skill || skill.trim().length < 2) return;
 
  // ✅ make sure array exists before using it
  if (!this.employee.skillsArray) {
    this.employee.skillsArray = [];
  }
 
  // Handle comma-separated input
  const newSkills = skill.split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
 
  for (const s of newSkills) {
    if (!this.employee.skillsArray.includes(s)) {
      this.employee.skillsArray.push(s);
    }
  }
 
  // Update comma-separated string for backend
  this.employee.skill = this.employee.skillsArray.join(', ');
 
  // Reset input and suggestions
  this.skillInput = '';
  this.filteredSkills = [];
}
  removeSkill(skill: string) {
    this.employee.skillsArray = this.employee.skillsArray.filter((s:string) => s !== skill);
    this.employee.skill = this.employee.skillsArray.join(', ');
  }







  loadEmployees(): void {
    console.log('load employees');
    var datas=this.http.get<any[]>('http://localhost:8080/EmployeeFormApp/api/secured/employees/all')
      .subscribe({
        next:(data) => {
        console.log(data);
        this.allEmployees = data;
        this.totalPages = Math.ceil(this.allEmployees.length / this.pageSize);
        this.updatePaginatedEmployees();
      }});
  }

  updatePaginatedEmployees(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedEmployees = this.allEmployees.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedEmployees();
    }
  }
  onPageSizeChange(event:any){
    this.pageSize=+event.target.value;
    this.totalPages = Math.ceil(this.allEmployees.length / this.pageSize);
    this.currentPage=1;
    this.updatePaginatedEmployees();
  }
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
  onHasBankAccountChange(): void {
    if (this.employee.hasBankAccount === false) {
      this.employee.bankName = '';
      this.employee.accountNumber = '';
    }
  }
  downloading: boolean = false;
  downloadProgress: number = 0;
  downloadExcel(): void {
    this.closeDownloadDropdown();
    this.downloading = true;
    this.downloadProgress = 0;
    const url = `${this.API_BASE_URL}/download/excel`; // Your existing Excel endpoint

    this.http.get(url, {
      responseType: 'blob',
      observe: 'events',
      reportProgress: true
    }).pipe(
      filter(event => event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.Response)
    ).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.DownloadProgress) {
          if (event.total) {
            this.downloadProgress = Math.round((event.loaded / event.total) * 100);
          } else {
            this.downloadProgress = Math.min(this.downloadProgress + 10, 90);
          }
        } else if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Blob>;
          this.downloading = false;
          this.downloadProgress = 100;

          if (response.body) {
            const blob = new Blob([response.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `employees_data.xlsx`;
            if (contentDisposition) {
              const matches = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*?)['"]?$/i.exec(contentDisposition);
              if (matches && matches[1]) {
                  filename = decodeURIComponent(matches[1].replace(/^UTF-8''/, ''));
              }
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            Swal.fire('Success!', 'Employee data downloaded successfully!', 'success');
          } else {
              Swal.fire('Error!', 'Download failed: No data received.', 'error');
          }
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.downloading = false;
        this.downloadProgress = 0;
        console.error('Error downloading Excel file:', errorResponse);
        Swal.fire('Error!', `Failed to download Excel: ${this.getErrorMessage(errorResponse)}`, 'error');
      }
    );
  }
  downloadPdf(): void {
    this.closeDownloadDropdown();
    this.downloading = true;
    this.downloadProgress = 0;
    const url = `${this.API_BASE_URL}/download/pdf`; // NEW PDF endpoint

    this.http.get(url, {
      responseType: 'blob', // Expecting binary data (PDF)
      observe: 'events',
      reportProgress: true
    }).pipe(
      filter(event => event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.Response)
    ).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.DownloadProgress) {
          if (event.total) {
            this.downloadProgress = Math.round((event.loaded / event.total) * 100);
          } else {
            this.downloadProgress = Math.min(this.downloadProgress + 10, 90);
          }
        } else if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Blob>;
          this.downloading = false;
          this.downloadProgress = 100;

          if (response.body) {
            const blob = new Blob([response.body], { type: 'application/pdf' }); // Set MIME type for PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `employees_data.pdf`; // Default filename for PDF
            if (contentDisposition) {
              const matches = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*?)['"]?$/i.exec(contentDisposition);
              if (matches && matches[1]) {
                  filename = decodeURIComponent(matches[1].replace(/^UTF-8''/, ''));
              }
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            Swal.fire('Success!', 'Employee data downloaded successfully!', 'success');
          } else {
              Swal.fire('Error!', 'Download failed: No data received.', 'error');
          }
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.downloading = false;
        this.downloadProgress = 0;
        console.error('Error downloading PDF file:', errorResponse);
        Swal.fire('Error!', `Failed to download PDF: ${this.getErrorMessage(errorResponse)}`, 'error');
      }
    );
  }
  private closeDownloadDropdown(): void {
    const dropdownElement = document.getElementById('downloadDropdown');
    if (dropdownElement) {
      const bsDropdown = (window as any).bootstrap.Dropdown.getInstance(dropdownElement);
      if (bsDropdown) {
        bsDropdown.hide(); 
      }
    }
  }

  onSearchBank(): void {
    this.bankSearchPerformed = true;
    if (this.searchBankName.length < 3) { 
      this.bankSearchResults = [];
      return;
    }
    console.log('this.onSearchBank');
    const backendUrl = `http://localhost:8080/EmployeeFormApp/api/secured/employees/banks/search/${this.searchBankName}`; // Adjust path if using /api/banks directly

    this.http.get<any[]>(backendUrl).subscribe(
      (data) => {
        this.bankSearchResults = data;
      },
      (error) => {
        console.error('Error searching banks:', error);
        this.bankSearchResults = [];
        Swal.fire('Error', 'Failed to fetch bank names. Please try again later.', 'error');
      }
    );
  }

  // --- MODIFIED: selectBank to populate both bankName and accountNumber ---
  selectBank(bank: any): void { // <-- Now 'bank' is a BankSearchResult object
    this.employee.bankName = bank.bankName;       // Populate bank name
    this.employee.accountNumber = bank.accountNumber; // Populate account number
    this.employee.accId = bank.accountId;
    // this.employee.name = bank.name;         // Optionally set accId if you need to track it

    const modalElement = document.getElementById('bankSearchModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide(); // Close the modal
      }
    }
  }
   sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

   sortBy(field: string) {
    console.log('sorting field', field);
  if (this.sortField === field) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortField = field;
    console.log('sorting field', this.sortField);
    this.sortDirection = 'asc';
  }
 
  this.applySorting();
  this.updatePaginatedEmployees(); // 💡 refresh current page
}
  private getErrorMessage(errorResponse: HttpErrorResponse): string {
    if (errorResponse.error instanceof ErrorEvent) {
      return `Client Error: ${errorResponse.error.message}`;
    } else if (typeof errorResponse.error === 'string') {
      return errorResponse.error;
    } else if (errorResponse.error && typeof errorResponse.error === 'object' && (errorResponse.error as any).message) {
      return (errorResponse.error as any).message;
    } else if (errorResponse.message) {
      return errorResponse.message;
    } else if (errorResponse.status) {
      return `Server returned code: ${errorResponse.status}`;
    }
    return 'An unexpected error occurred.';
  }

 
applySorting() {
  this.allEmployees.sort((a, b) => {
    console.log(this.allEmployees);
    let valA = a[this.sortField];
    let valB = b[this.sortField];
 
    // if (this.sortField === 'doj' || this.sortField === 'dateofJoining') {
    //   console.log(valA);
    //   valA = new Date(valA);
    //   valB = new Date(valB);
    //   if (valA instanceof Date && valB instanceof Date) {
    //  // return this.sortDirection === 'asc'? valA.getTime() - valB.getTime(): valB.getTime() - valA.getTime();
    // }
    // }
    
 
    if (typeof valA === 'string' && typeof valB === 'string') {
      console.log("date");
      return this.sortDirection === 'asc'? valA.localeCompare(valB): valB.localeCompare(valA);
    }
 
    return this.sortDirection === 'asc'? valA - valB: valB - valA;
  });
}

  // resetBankSearch(): void {
  //   this.searchBankName = '';
  //   this.bankSearchResults = [];
  //   this.bankSearchPerformed = false;
  // }

}


// function ViewChild(arg0: string): (target: EmployeeFormComponent, propertyKey: "employeeForm") => void {
//   throw new Error('Function not implemented.');
// }
