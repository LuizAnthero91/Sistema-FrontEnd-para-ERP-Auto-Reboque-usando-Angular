import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImagemCompressaoService {
  async comprimir(file: File): Promise<File> {
    const url = URL.createObjectURL(file);

    try {
      const imagem = new Image();
      await new Promise<void>((resolve, reject) => {
        imagem.onload = () => resolve();
        imagem.onerror = () => reject(new Error('Não foi possível abrir a fotografia.'));
        imagem.src = url;
      });

      const maxDimensao = 1920;
      const escala = Math.min(1, maxDimensao / Math.max(imagem.naturalWidth, imagem.naturalHeight));
      const largura = Math.max(1, Math.round(imagem.naturalWidth * escala));
      const altura = Math.max(1, Math.round(imagem.naturalHeight * escala));

      const canvas = document.createElement('canvas');
      canvas.width = largura;
      canvas.height = altura;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas não disponível neste navegador.');
      }

      // Fundo branco para imagens PNG/WebP com transparência.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, largura, altura);
      ctx.drawImage(imagem, 0, 0, largura, altura);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          resultado => resultado
            ? resolve(resultado)
            : reject(new Error('Falha ao compactar fotografia.')),
          'image/jpeg',
          0.8
        );
      });

      // Alguns navegadores podem não gerar o formato solicitado.
      if (blob.type !== 'image/jpeg') {
        throw new Error('Conversão JPEG não suportada.');
      }

      // Evita substituir um arquivo por outro maior.
      if (blob.size >= file.size) {
        return file;
      }

      const nome = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], nome, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
