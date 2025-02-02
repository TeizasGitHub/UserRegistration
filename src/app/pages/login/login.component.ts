import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  password: string = '';  // ✅ Ensure it's a string
  commonPassword = 'admin123';
  errorMessage = '';

  constructor(private router: Router) {}

  login() {
    if (this.password === this.commonPassword) {
      this.router.navigate(['/register']);
    } else {
      this.errorMessage = 'Invalid password!';
    }
  }
}
