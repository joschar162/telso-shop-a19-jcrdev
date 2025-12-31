import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  router = inject(Router);

  hasError = signal(false);
  isPosting = signal(false);
  authService = inject(AuthService);

  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.hasError.set(true);
      this.errorMessage.set('formulario inválido');
      setTimeout(() => this.hasError.set(false), 2000);
      return;
    }

    const { email, password, fullName } = this.registerForm.value;

    console.log({ email, password, fullName });
    this.authService.register(fullName!, email!, password!).subscribe({
      next: () => {
        // Si tiene éxito
        this.router.navigateByUrl('/');
      },
      error: (message) => {
        // 2. Aquí capturamos el mensaje que lanzamos con throwError
        this.errorMessage.set(message);
        this.hasError.set(true);

        setTimeout(() => {
          this.hasError.set(false);
          this.errorMessage.set(null);
        }, 4000);
      },
    });
    // .subscribe((isAuthenticated) => {
    //   if (isAuthenticated) {
    //     this.router.navigateByUrl('/');
    //     return;
    //   }

    //   this.hasError.set(true);

    //   setTimeout(() => this.hasError.set(false), 2000);
    // });
  }
}
