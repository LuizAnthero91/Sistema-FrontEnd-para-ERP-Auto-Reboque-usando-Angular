import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, concatMap, finalize, from, map, of, tap, toArray } from 'rxjs';
import { OsImagem } from '../core/models/os-imagem.model';
import { OsImagemService } from '../core/services/os-imagem.service';
import { errorMessage } from './form-utils';

@Component({
  selector: 'app-os-imagens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './os-imagens.component.html',
  styleUrl: './os-imagens.component.css'
})
export class OsImagensComponent implements OnChanges, OnDestroy {
  @Input() sessao = 0;
  @Input() ordemId?: number;
  @Input() somenteLeitura = false;
  @Input() bloqueado = false;
  private readonly service = inject(OsImagemService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private versao = 0;
  imagens: OsImagem[] = [];
  pendentes: { file: File; preview: string }[] = [];
  carregando = false;
  enviando = false;
  excluindo = false;
  erro = '';
  erroListagem = '';
  readonly limiteFotos = 10;

  get fotosRestantes(): number {
    return Math.max(0, this.limiteFotos - this.imagens.length - this.pendentes.length);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessao']) {
      this.pendentes.forEach(p => URL.revokeObjectURL(p.preview));
      this.pendentes = [];
      this.imagens = [];
      this.erro = '';
      this.erroListagem = '';
      this.carregando = false;
    }
    if ((changes['ordemId'] || changes['sessao']) && !this.enviando) this.carregar();
  }

  carregar(): void {
    if (this.enviando || this.excluindo) return;
    const versao = ++this.versao;
    if (!this.ordemId) { this.imagens = []; this.carregando = false; return; }
    this.carregando = true;
    this.erroListagem = '';
    this.service.listar(this.ordemId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: imagens => {
        if (versao !== this.versao) return;
        this.imagens = imagens;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: erro => {
        if (versao !== this.versao) return;
        this.erroListagem = errorMessage(erro);
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  selecionar(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.bloqueado || this.somenteLeitura || this.enviando || this.excluindo || this.carregando || this.erroListagem) {
      input.value = '';
      return;
    }
    const files = Array.from(input.files ?? []);
    if (files.length > this.fotosRestantes) {
      this.erro = `Esta OS permite no máximo ${this.limiteFotos} fotos. Você ainda pode adicionar ${this.fotosRestantes} foto(s), considerando as fotos salvas e pendentes.`;
      input.value = '';
      return;
    }
    const erros: string[] = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024 || file.size === 0) {
        erros.push(`${file.name}: selecione JPEG, PNG ou WebP de até 8 MB, não vazio.`);
        continue;
      }
      if (this.pendentes.some(p => p.file.name === file.name && p.file.size === file.size && p.file.lastModified === file.lastModified)) continue;
      this.pendentes.push({ file, preview: URL.createObjectURL(file) });
    }
    this.erro = erros.join(' ');
    input.value = '';
  }

  remover(preview: string): void {
    if (this.bloqueado || this.enviando) return;
    this.descartar(preview);
  }

  private descartar(preview: string): void {
    URL.revokeObjectURL(preview);
    this.pendentes = this.pendentes.filter(p => p.preview !== preview);
  }

  enviar(ordemId: number): Observable<boolean> {
    if (this.pendentes.length && (this.carregando || this.erroListagem || this.imagens.length + this.pendentes.length > this.limiteFotos)) {
      this.erro = `Não foi possível enviar as fotos. Confira as fotos salvas e mantenha no máximo ${this.limiteFotos} fotos por OS.`;
      return of(false);
    }
    this.enviando = true;
    this.erro = '';
    return from([...this.pendentes]).pipe(
      concatMap(pendente => this.service.upload(ordemId, pendente.file).pipe(
        tap(imagem => {
          this.imagens.push(imagem);
          this.descartar(pendente.preview);
          this.cdr.markForCheck();
        }),
        map(() => true),
        catchError(erro => {
          this.erro += `${pendente.file.name}: ${errorMessage(erro)} `;
          return of(false);
        })
      )),
      toArray(),
      map(resultados => resultados.every(Boolean)),
      finalize(() => { this.enviando = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  excluir(imagem: OsImagem): void {
    if (!this.ordemId || this.somenteLeitura || this.bloqueado || this.excluindo || this.enviando || this.carregando) return;
    if (!confirm(`Excluir a foto "${imagem.nomeOriginal}"?`)) return;
    this.excluindo = true;
    this.erro = '';
    this.service.excluir(this.ordemId, imagem.id).pipe(
      finalize(() => { this.excluindo = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => { this.imagens = this.imagens.filter(item => item.id !== imagem.id); },
      error: erro => { this.erro = errorMessage(erro); }
    });
  }

  ngOnDestroy(): void {
    this.versao++;
    this.pendentes.forEach(p => URL.revokeObjectURL(p.preview));
  }
}
