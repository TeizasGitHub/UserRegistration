import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from 'src/app/services/registration.service';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;  
  currentStep = 1; 
  states = ['NY', 'CA', 'TX', 'FL', 'IN'];
  registrationId: string | null = null;
  registrationData: any = null;
  emailSent = false;

  constructor(private fb: FormBuilder, private router: Router,private registrationService: RegistrationService) {
    // Initialize the form with validation
    this.registerForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      confirmEmail: new FormControl('', [Validators.required, Validators.email]),
      state: new FormControl('', Validators.required),
      subscribe: new FormControl(false)
    }, { validators: this.matchEmails });
    
    this.registerForm.valueChanges.subscribe(() => {
      this.checkFormFilled();
    });
  }

  checkFormFilled() {
    if (this.currentStep === 1 && this.registerForm.valid) {
      this.currentStep++;
    }
  }
   

  // Custom validator to match email and confirmEmail
  matchEmails(group: FormGroup) {
    const email = group.get('email')?.value;
    const confirmEmail = group.get('confirmEmail')?.value;
    return email === confirmEmail ? null : { emailsMismatch: true };
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return (control?.invalid && control?.touched) ?? false;
  }
  
  onRegister() {
    if (this.registerForm.invalid) {
      Swal.fire({
        title: 'Registration Failed!',
        text: 'Please fill out all required fields correctly.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formData: RegisterFormModel = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      state: this.registerForm.value.state,
      email: this.registerForm.value.email,     
      subscribe: this.registerForm.value.subscribe
    }; 
    this.registrationService.createRegistration(formData).subscribe(
      (response: any) => {
        console.log('Registration Created:', response);
        this.registrationId = response.id;

        Swal.fire({
          title: 'Registration Successful!',
          text: 'Thank you for registering. Check your email for further details.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        const { firstName , email } = formData;
        this.sendEmail(firstName, email);
        setTimeout(() => {
          this.router.navigate(['/thank-you']);
        }, 1000);
      },
      (error) => {
        console.error('Registration Error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong while submitting the form.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  getRegistration() {
    if (!this.registrationId) {
      console.log('Please enter a valid registration ID');
      return;
    }
    this.registrationService.getRegistration(this.registrationId).subscribe((response) => {
      console.log('Registration Details:', response);
      this.registrationData = response;
    });
  }

  deleteRegistration() {
    if (!this.registrationId) {
      console.log('Please enter a valid registration ID');
      return;
    }
    this.registrationService.deleteRegistration(this.registrationId).subscribe(() => {
      console.log('Registration Deleted');
      this.registrationData = null;
      this.registrationId = null;
    });
  }

  sendEmail(name: string, email: string) {
    const templateParams = {
      to_email: email,
      user_name: name,
      from_email: 'no-reply@intramedgroupmeetings.com',
      message: `
        <div style="border: 1px solid #ddd; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #0073e6;">IntraMed Meetings</h2>
          <p>Dear ${name},</p>
          <p>Thank you for registering for the Speaker Training Meeting.</p>
          <p>You'll receive a formal confirmation email within 3-5 business days, including travel booking information.</p>
          <p>Regards,<br>IntraMed</p>
        </div>
      `,
    };

    emailjs
      .send('service_xxx', 'template_xxx', templateParams, 'public_xxx')
      .then(
        () => {
          this.emailSent = true;
        },
        (error) => {
          console.error('Error sending email:', error);
        }
      );
  }
}


interface RegisterFormModel {
  firstName: string;
  lastName: string;
  email: string;  
  state: string;
  subscribe: boolean;
}
