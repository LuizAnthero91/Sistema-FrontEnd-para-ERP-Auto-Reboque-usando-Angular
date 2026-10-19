import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, concatMap, defer, finalize, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { OsImagem } from '../core/models/os-imagem.model';
import { OsImagemService } from '../core/services/os-imagem.service';
import { ImagemCompressaoService } from '../core/services/imagem-compressao.service';
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
  private readonly compressao = inject(ImagemCompressaoService);
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
  private fotosCarregadas = new Set<number>();
  private fotosComErro = new Set<number>();

  get prontaParaImprimir(): boolean {
    return !this.carregando && !this.erroListagem &&
      this.imagens.every(imagem => this.fotosCarregadas.has(imagem.id));
  }

  get erroCarregamentoFotos(): boolean {
    return this.fotosComErro.size > 0;
  }

  registrarCarregamento(id: number, sucesso: boolean): void {
    if (sucesso) {
      this.fotosCarregadas.add(id);
      this.fotosComErro.delete(id);
    } else {
      this.fotosCarregadas.delete(id);
      this.fotosComErro.add(id);
    }
  }

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
    this.imagens = [];
    this.fotosCarregadas.clear();
    this.fotosComErro.clear();
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
    console.info('[Fotos OS] Preparando envio', { ordemId, quantidade: this.pendentes.length });
    if (this.pendentes.length && (this.carregando || this.erroListagem || this.imagens.length + this.pendentes.length > this.limiteFotos)) {
      this.erro = `Não foi possível enviar as fotos. Confira as fotos salvas e mantenha no máximo ${this.limiteFotos} fotos por OS.`;
      return of(false);
    }
    // O formulário mantém bloqueado=true durante o salvamento e chama enviar ao salvar a OS.
    // Esse bloqueio impede edições na tela, mas deve permitir o upload iniciado pelo formulário.
    if (this.enviando || this.excluindo || this.somenteLeitura) {
      return of(false);
    }
    this.enviando = true;
    this.erro = '';
    return from([...this.pendentes]).pipe(
      concatMap(pendente => defer(() => this.compressao.comprimir(pendente.file)).pipe(
        switchMap(arquivoOtimizado => this.service.upload(ordemId, arquivoOtimizado)),
        tap(imagem => {
          console.info('[Fotos OS] Upload OK', { ordemId, imagemId: imagem.id });
          this.imagens.push(imagem);
          this.descartar(pendente.preview);
          this.cdr.markForCheck();
        }),
        map(() => true),
        catchError(erro => {
          console.error('[Fotos OS] Falha ao preparar ou enviar foto', {
            ordemId, arquivo: pendente.file.name, status: erro?.status,
            mensagem: errorMessage(erro)
          });
          this.erro += `${pendente.file.name}: ${errorMessage(erro)} `;
          this.cdr.markForCheck();
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
