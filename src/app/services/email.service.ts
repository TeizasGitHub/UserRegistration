import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private http: HttpClient) {}

  sendEmail(email: string) {
    const emailData = {
      to: email,
      subject: 'Meeting Details',
      body: 'Thank you for registering! Your meeting details will be shared soon.'
    };
    return this.http.post('https://example.com/api/sendEmail', emailData).subscribe();
  }
}
