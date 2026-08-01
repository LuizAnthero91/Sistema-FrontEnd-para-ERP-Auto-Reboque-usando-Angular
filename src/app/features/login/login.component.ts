import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { errorMessage } from '../../shared/form-utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  loading = false;
  erro = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  entrar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.erro = '';
    const value = this.form.getRawValue();
    this.auth.login({ email: value.email!, senha: value.senha! }).subscribe({
      next: () => this.auth.me().subscribe({ next: () => this.router.navigate(['/dashboard']), error: () => this.router.navigate(['/dashboard']) }),
      error: err => { this.erro = errorMessage(err); this.loading = false; },
      complete: () => this.loading = false
    });
  }
}
