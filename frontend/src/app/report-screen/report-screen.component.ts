import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router,RouterModule } from '@angular/router';
import { AuthServiceService } from '../auth-service.service';
import Swal from 'sweetalert2';
import { NotificationBellComponent } from '../shared/notification-bell/notification-bell.component';

interface PreviewResponse {
  columns: string[];
  rows: Array<{ [key: string]: any }>;
  total: number;
}
@Component({
  selector: 'app-report-screen',
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RouterModule,NotificationBellComponent],
  templateUrl: './report-screen.component.html',
  styleUrl: './report-screen.component.css'
})
export class ReportScreenComponent implements OnInit  {

 constructor(private http: HttpClient,private router:Router,private authservice:AuthServiceService) {}
 selectedScreen = '';
  selectedField = '';
  inputValue: any;
 
previewData: any[] = [];

  fieldOptions: any[] = [];
  reportGenerated = false;
 
  departments = ['HR', 'Development', 'Testing', 'Support']; // You can fetch from DB
 selectScreen(screen:any){
  this.selectedScreen=screen;
 }
selectfield(field: string) {
  
if (this.selectedScreen === 'project') {
    // Allow only one field at a time for 'project'
    this.selectedFields = [field];
  } else {
    // For 'employee', allow multiple fields
    if (!this.selectedFields.includes(field)) {
      this.selectedFields.push(field);
    }
  }

}
 selectedFields: string[] = [];
 fieldValues:string[]=[];
filters: any = {
  department: '',
  dojStart: '',
  dojEnd: '',
  startDateMax: '',
  startDateMin:'',
  endDateMin: '',
  endDateMax:''
};

removeField(field: string): void {
  const index = this.selectedFields.indexOf(field);
  if (index !== -1) {
    this.selectedFields.splice(index, 1); // This hides the field from UI
  }

  // Clear the corresponding value(s) from filters
  if (this.filters) {
    if (field === 'doj') {
      this.filters.dojStart = '';
      this.filters.dojEnd = '';
    } else {
      this.filters[field] = '';
    }
  }

  console.log('After removal:', this.selectedFields, this.filters);
}


user:string='';
  logout(){
    this.authservice.logout();
  }
  ngOnInit(): void {
    this.user=sessionStorage.getItem('username')||'';
    if(!this.authservice.isLoggedIn()){
      this.router.navigate([''])
    }
  }
  onScreenChange() {
    this.selectedField = '';
    this.inputValue = '';
    this.reportGenerated = false;
 
    if (this.selectedScreen === 'employee') {
      this.fieldOptions = [
        { label: 'Department', value: 'department' },
        { label: 'Date of Joining', value: 'joiningDate' }
      ];
    } else if (this.selectedScreen === 'project') {
      this.fieldOptions = [
        { label: 'Start Date', value: 'startDate' },
        { label: 'End Date', value: 'endDate' }
      ];
    }
  }
 
  isDateField(field: string): boolean {
    return ['joiningDate', 'startDate', 'endDate'].includes(field);
  }
 
  
generate(): void {
  const requestPayload = {
    reportType: this.selectedScreen,
    fields: this.selectedFields,
    filters: this.filters
  };

  // Show loading alert
  Swal.fire({
    title: 'Generating Report...',
    text: 'Please wait while we prepare your report.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.http.post('http://localhost:8080/EmployeeFormApp/api/report/download/excel', requestPayload, {
    responseType: 'blob',
    withCredentials: false
  }).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Set filename based on selected screen
    const filename = this.selectedScreen === 'employee' ? 'employee_report.xlsx' : 'project_report.xlsx';
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Download Complete',
      text: 'Your report has been downloaded successfully!'
    });

  }, error => {
    Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Something went wrong while generating the report.'
    });
    console.error('Error generating report:', error);
  });
}



previewLimit = 20;
previewColumns: string[] = [];
previewRows: Array<{ [key: string]: any }> = [];
previewTotal = 0;
showPreview = false;

preview(): void {
  const requestPayload = {
    reportType: this.selectedScreen,   // 'employee' | 'project'
    fields: this.selectedFields,       // [] or omit => backend defaults
    filters: this.filters,
    limit: this.previewLimit || 20
  };

  Swal.fire({
    title: 'Loading Preview...',
    html: 'Fetching sample rows based on your filters.',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  this.http.post<PreviewResponse>(
    'http://localhost:8080/EmployeeFormApp/api/report/preview',
    requestPayload
  ).subscribe(res => {
      this.previewColumns = res.columns || [];
      this.previewRows = res.rows || [];
      this.previewTotal = res.total || this.previewRows.length;
      this.showPreview = true;
      this.resetPagination();
      Swal.close();

      if (!this.previewRows.length) {
        Swal.fire({
          icon: 'info',
          title: 'No Data',
          text: 'No records matched your filters.'
        });
      }
    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Preview Failed',
        text: 'Something went wrong while fetching preview.'
      });
      console.error('Preview error:', err);
    });
}

// ---- Pagination state ----
pageSizeOptions = [3, 5, 10, 20];
pageSize = 3;          // default rows per page
pageIndex = 0;          // zero-based page index

// Total records in the current preview (client-side pagination)
get totalRecords(): number {
  return this.previewRows?.length || 0;
}

// Rows for the current page
get paginatedRows() {
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  return (this.previewRows || []).slice(start, end);
}

// Total pages
get totalPages(): number {
  return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
}

// Displayed range (for the heading)
get rangeStart(): number {
  return this.totalRecords ? this.pageIndex * this.pageSize + 1 : 0;
}
get rangeEnd(): number {
  return Math.min(this.totalRecords, (this.pageIndex + 1) * this.pageSize);
}

// Handlers
goToPage(idx: number): void {
  if (idx >= 0 && idx < this.totalPages) this.pageIndex = idx;
}
prevPage(): void { this.goToPage(this.pageIndex - 1); }
nextPage(): void { this.goToPage(this.pageIndex + 1); }

onPageSizeChange(size: any): void {
  const n = Number(size);
  if (!isNaN(n) && n > 0) {
    this.pageSize = n;
    this.pageIndex = 0; // reset to first page on size change
  }
}

resetPagination(): void {
  this.pageIndex = 0;
}

// Sorting
sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

// Loading
isLoading: boolean = false;
sortBy(column: string): void {
  if (this.sortColumn === column) {
    // Toggle sort direction
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new column and default to ascending
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.applySorting();
}

applySorting(): void {
  if (!this.sortColumn) return;

  this.paginatedRows.sort((a, b) => {
    const valA = a[this.sortColumn];
    const valB = b[this.sortColumn];

    if (valA == null) return 1;
    if (valB == null) return -1;

    const comparison = valA.toString().localeCompare(valB.toString(), undefined, { numeric: true });
    return this.sortDirection === 'asc' ? comparison : -comparison;
  });
}

fetchPreviewData(): void {
  this.isLoading = true;

  // Simulate async fetch (replace with actual API call)
  setTimeout(() => {
    // Example: this.paginatedRows = fetchedData;
    this.isLoading = false;
  }, 1000);
}

trackByFn(index: number, item: any): any {
  return item.id || index;
}

selectedRow: any = null;
showRowDetailsModal: boolean = false;

onRowClick(row: any): void {
  console.log('Row clicked:', row);

  // Example: Show row details in a modal
  this.selectedRow = row;
  this.showRowDetailsModal = true;
}





// generate(): void {
//   const requestPayload = {
//     reportType: this.selectedScreen,
//     fields: this.selectedFields,
//     filters: this.filters
//   };

//   Swal.fire({
//     title: 'Generating Preview...',
//     text: 'Please wait while we fetch your report preview.',
//     allowOutsideClick: false,
//     didOpen: () => {
//       Swal.showLoading();
//     }
//   });

//   this.http.post<any[]>('http://localhost:8080/EmployeeFormApp/api/report/preview', requestPayload)
//     .subscribe(data => {
//       this.previewData = data;
//       Swal.close();
//     }, error => {
//       Swal.fire({
//         icon: 'error',
//         title: 'Preview Failed',
//         text: 'Something went wrong while generating the preview.'
//       });
//       console.error('Error fetching preview:', error);
//     });
// }



}
