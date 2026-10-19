const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const rx = require('rxjs');

// Executa o fluxo real do componente com os serviços e a UI isolados.
let dependencies;
function loadComponent() {
  const source = fs.readFileSync('src/app/shared/os-imagens.component.ts', 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true }
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, URL, console,
    require(name) {
      if (name === 'rxjs') return rx;
      if (name === '@angular/core') return {
        Component: () => target => target, Input: () => () => {},
        inject: () => dependencies.shift()
      };
      if (name === '@angular/core/rxjs-interop') return { takeUntilDestroyed: () => x => x };
      if (name.endsWith('form-utils')) return { errorMessage: e => e.message };
      return {};
    }
  });
  return exports.OsImagensComponent;
}

async function main() {
  const Component = loadComponent();
  const uploaded = [];
  let fail = true;
  dependencies = [
    { upload: (id, file) => {
      uploaded.push([id, file.name]);
      return file.name === 'falha.jpg' && fail
        ? rx.throwError(() => new Error('R2 indisponível'))
        : rx.of({ id: uploaded.length, nomeOriginal: file.name });
    } },
    { comprimir: async file => file }, { markForCheck() {} }, {}
  ];
  const component = new Component();
  const pending = name => ({ file: { name }, preview: `blob:${name}` });
  component.bloqueado = true; // O formulário bloqueia a edição enquanto salva.
  component.pendentes = [pending('ok.jpg'), pending('falha.jpg')];
  assert.equal(await rx.firstValueFrom(component.enviar(42)), false);
  assert.equal(component.imagens.length, 1);
  assert.equal(component.pendentes.length, 1);
  assert.equal(component.pendentes[0].file.name, 'falha.jpg');
  assert.equal(component.enviando, false);
  fail = false;
  assert.equal(await rx.firstValueFrom(component.enviar(42)), true);
  assert.deepEqual(uploaded, [[42, 'ok.jpg'], [42, 'falha.jpg'], [42, 'falha.jpg']]);
  assert.equal(component.pendentes.length, 0);
  component.excluindo = true;
  assert.equal(await rx.firstValueFrom(component.enviar(42)), false);
  component.excluindo = false;
  component.pendentes = [pending('invalida.jpg')];
  component.compressao.comprimir = () => { throw new Error('Imagem inválida'); };
  assert.equal(await rx.firstValueFrom(component.enviar(42)), false);
  assert.equal(component.enviando, false);
  assert.equal(component.pendentes.length, 1);
  console.log('OK: envio durante salvamento, falha parcial, reenvio sem duplicação, exclusão e falha de compressão.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
