import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  PerfilSistema,
  UsuarioCadastroRequest,
  UsuarioSistema
} from '../../core/models/api.models';

import { UsuarioService } from '../../core/services/usuario.service';
import { PerfilService } from '../../core/services/perfil.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  private readonly usuarioService =
    inject(UsuarioService);

  private readonly perfilService =
    inject(PerfilService);

  private readonly auth =
    inject(AuthService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  usuarios: UsuarioSistema[] = [];
  perfis: PerfilSistema[] = [];

  carregando = false;
  salvando = false;

  mostrarFormulario = false;

  mensagem = '';
  erro = '';

  form: UsuarioCadastroRequest = {
    nome: '',
    email: '',
    senha: '',
    perfilId: 0
  };

  ngOnInit(): void {
    this.carregarUsuarios();
    this.carregarPerfis();
  }

  get podeCriar(): boolean {
    return this.auth.temPermissao(
      'USUARIO_CRIAR'
    );
  }

  get podeEditar(): boolean {
    return this.auth.temPermissao(
      'USUARIO_EDITAR'
    );
  }

  get podeDesativar(): boolean {
    return this.auth.temPermissao(
      'USUARIO_DESATIVAR'
    );
  }

  carregarUsuarios(): void {

    this.carregando = true;
    this.erro = '';

    this.usuarioService.listar().subscribe({

      next: usuarios => {
        this.usuarios = usuarios;
        this.carregando = false;
        this.cdr.markForCheck();
      },

      error: () => {
        this.erro =
          'Não foi possível carregar os usuários.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  carregarPerfis(): void {

    this.perfilService.listar().subscribe({

      next: perfis => {

        this.perfis = perfis.filter(
          perfil => perfil.ativo
        );

        this.cdr.markForCheck();
      },

      error: () => {
        this.erro =
          'Não foi possível carregar os perfis.';
        this.cdr.markForCheck();
      }
    });
  }

  abrirFormulario(): void {

    this.form = {
      nome: '',
      email: '',
      senha: '',
      perfilId: 0
    };

    this.erro = '';
    this.mensagem = '';

    this.mostrarFormulario = true;
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
  }

  cadastrar(): void {

    if (
      !this.form.nome ||
      !this.form.email ||
      !this.form.senha ||
      !this.form.perfilId
    ) {

      this.erro =
        'Preencha todos os campos obrigatórios.';

      return;
    }

    this.salvando = true;
    this.erro = '';
    this.mensagem = '';

    this.usuarioService
      .cadastrar(this.form)
      .subscribe({

        next: usuario => {

          this.usuarios = [
            ...this.usuarios,
            usuario
          ];

          this.mensagem =
            'Usuário cadastrado com sucesso.';

          this.mostrarFormulario = false;
          this.salvando = false;

          this.cdr.markForCheck();
        },

        error: erro => {

          this.erro =
            erro?.error?.mensagem ??
            'Não foi possível cadastrar o usuário.';

          this.salvando = false;

          this.cdr.markForCheck();
        }
      });
  }

  desativar(usuario: UsuarioSistema): void {

    if (
      !confirm(
        `Deseja desativar ${usuario.nome}?`
      )
    ) {
      return;
    }

    this.usuarioService
      .desativar(usuario.id)
      .subscribe({

        next: () => {

          usuario.ativo = false;

          this.mensagem =
            'Usuário desativado com sucesso.';

          this.cdr.markForCheck();
        },

        error: erro => {

          this.erro =
            erro?.error?.mensagem ??
            'Não foi possível desativar o usuário.';

          this.cdr.markForCheck();
        }
      });
  }

  ativar(usuario: UsuarioSistema): void {

    this.usuarioService
      .ativar(usuario.id)
      .subscribe({

        next: atualizado => {

          Object.assign(
            usuario,
            atualizado
          );

          this.mensagem =
            'Usuário ativado com sucesso.';

          this.cdr.markForCheck();
        },

        error: erro => {

          this.erro =
            erro?.error?.mensagem ??
            'Não foi possível ativar o usuário.';

          this.cdr.markForCheck();
        }
      });
  }
}