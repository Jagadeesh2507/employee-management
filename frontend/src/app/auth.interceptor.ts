import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';
 // Update the path as needed
 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('jwtToken') // or your logic
  console.log('hi token is getting...',token);
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};
 
