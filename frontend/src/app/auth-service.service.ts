import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

// CRITICAL MODIFICATION: Include 'role' in the response
export interface LoginResponse{
  message:string;
  token:string;
  role: string; 
employeeId: string | null;
}

@Injectable({
   providedIn: 'root'
})
export class AuthServiceService {
  private loggedInUsername: string = '';
  private isBrowser: boolean;

  private loginUrl = 'http://localhost:8080/EmployeeFormApp/api/auth/login';
  private signupUrl = 'http://localhost:8080/EmployeeFormApp/api/auth/signup';

  constructor(
    private http: HttpClient,private router:Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // New method to save the role
  saveUserRole(role: string): void {
    sessionStorage.setItem('userRole', role);
  }
   setUsername(username: string) {

    this.loggedInUsername = username;

    if (this.isBrowser) {

      sessionStorage.setItem('username', username);

    }

  }

  getUsername(): string {
   return sessionStorage.getItem('username')||'';
  }
  
  getUserRole(): string {
    return sessionStorage.getItem('userRole')||'';
  }

saveToken(token: string): void{
  console.log('token saved ',  token)
  sessionStorage.setItem('jwtToken',token);
}
getToken():string | null{
console.log(' geting token',sessionStorage.getItem('jwtToken'))
return sessionStorage.getItem('jwtToken');
}
isLoggedIn():boolean{
  console.log('token',sessionStorage.getItem('jwtToken'));
  return !! sessionStorage.getItem('jwtToken');
}
logout():void{
  console.log('logging out');
  sessionStorage.removeItem('jwtToken');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('userRole'); // Clear role on logout
  this.router.navigate(['']);
}

  login(username: string, password: string): Observable<LoginResponse> {
  console.log('attempting login');
    return this.http.post<LoginResponse>(this.loginUrl, { username, password });
  }

  signup(username: string, password: string): Observable<String> {
    return this.http.post(this.signupUrl, { username, password }, { responseType: 'text' });
  }
}