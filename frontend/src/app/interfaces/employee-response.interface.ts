export interface EmployeeResponse {
  status: string; // This will hold "Success" or "Failed" from your backend
  message: string;
  data: any;     // Optional, and its type depends on what your backend returns
}