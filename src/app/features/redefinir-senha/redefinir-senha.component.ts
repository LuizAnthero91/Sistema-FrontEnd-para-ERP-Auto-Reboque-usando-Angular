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
  ActivatedRoute,
  Router,
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
    'app-redefinir-senha',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './redefinir-senha.component.html',

  styleUrl:
    './redefinir-senha.component.css'
})
export class RedefinirSenhaComponent {

  private readonly fb =
    inject(FormBuilder);

  private readonly auth =
    inject(AuthService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly token =
    this.route.snapshot
      .queryParamMap
      .get('token');

  loading = false;

  erro = '';

  sucesso = false;

  tokenInvalido =
    !this.token;

  form = this.fb.group({

    novaSenha: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]
    ],

    confirmarSenha: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]
    ]

  });


  redefinir(): void {

    this.erro = '';

    if (!this.token) {

      this.erro =
        'Token de recuperação não encontrado.';

      return;
    }


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    const value =
      this.form.getRawValue();


    if (
      value.novaSenha !==
      value.confirmarSenha
    ) {

      this.erro =
        'As senhas não coincidem.';

      return;
    }


    this.loading = true;


    this.auth
      .redefinirSenha(
        this.token,
        value.novaSenha!,
        value.confirmarSenha!
      )
      .subscribe({

        next: () => {

          this.sucesso = true;

          this.form.disable();

          /*
           * Dá tempo para o usuário
           * visualizar a confirmação.
           */
          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 2000);

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