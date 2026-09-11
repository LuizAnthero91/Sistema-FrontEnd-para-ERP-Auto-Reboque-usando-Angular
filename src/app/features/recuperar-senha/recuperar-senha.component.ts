import { CommonModule } from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  errorMessage
} from '../../shared/form-utils';

@Component({
  selector:
    'app-recuperar-senha',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './recuperar-senha.component.html',

  styleUrl:
    './recuperar-senha.component.css'
})
export class RecuperarSenhaComponent {

  private readonly fb =
    inject(FormBuilder);

  private readonly auth =
    inject(AuthService);

  loading = false;

  erro = '';

  mensagem = '';

  form = this.fb.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ]

  });


  enviar(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.erro = '';

    this.mensagem = '';

    const value =
      this.form.getRawValue();

    const email =
      value.email!;

    this.auth
      .recuperarSenha(email)
      .subscribe({

        next: response => {

          this.mensagem =
            response.mensagem;

          /*
           * Limpamos o formulário
           * depois do envio.
           */
          this.form.reset();

        },

        error: err => {

          this.erro =
            errorMessage(err);

          this.loading = false;

        },

        complete: () => {

          this.loading = false;

        }

      });
  }
}