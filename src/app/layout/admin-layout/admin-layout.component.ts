import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioLogado } from '../../core/models/api.models';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  user: UsuarioLogado | null = null;
  sessaoCarregada = false;
  menuOpen = false;
  links = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Veículos', icon: '🚚', path: '/veiculos' },
    { label: 'Motoristas', icon: '👷', path: '/motoristas' },
    { label: 'Clientes', icon: '🤝', path: '/clientes' },
    { label: 'Ordens de Serviço', icon: '🧾', path: '/ordens-servico' },
    { label: 'Financeiro', icon: '💰', path: '/financeiro' },
    { label: 'Abastecimentos', icon: '⛽', path: '/abastecimentos' },
    { label: 'Manutenções', icon: '🔧', path: '/manutencoes' },
    { label: 'Documentos', icon: '📄', path: '/documentos-veiculos' }
  ];
  ngOnInit(): void {
    this.auth.me().subscribe({
      next: user => {
        this.user = user;
        this.sessaoCarregada = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.user = this.auth.getUsuarioLocal();
        this.sessaoCarregada = true;
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void { this.auth.logout(); }
}
