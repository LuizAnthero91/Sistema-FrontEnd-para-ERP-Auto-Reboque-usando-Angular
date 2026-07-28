# ERP Auto Reboque Torá - Frontend Angular

Frontend Angular standalone para consumir o backend Spring Boot do ERP Auto Reboque Torá.

## Recursos incluídos

- Login JWT com `POST /api/auth/login`
- Busca do usuário logado com `GET /api/auth/me`
- Interceptor JWT com header `Authorization: Bearer TOKEN`
- AuthGuard para rotas protegidas
- Layout administrativo responsivo com sidebar e topbar
- Dashboard integrado com `GET /api/dashboard/resumo`
- Telas para:
  - Veículos
  - Motoristas
  - Clientes
  - Ordens de Serviço
  - Financeiro
  - Abastecimentos
  - Manutenções
  - Documentos dos veículos
- Formulários com Reactive Forms
- Tratamento de erro usando o padrão `ErroResponse` do backend
- Cores leves, botões identificáveis e layout responsivo

## Como rodar

1. Descompacte este projeto.
2. Confira a URL do backend em:

```ts
src/environments/environment.ts
```

Padrão:

```ts
apiUrl: 'http://localhost:8080/api'
```

3. Instale as dependências:

```bash
npm install
```

4. Rode o Angular:

```bash
npm start
```

5. Acesse:

```text
http://localhost:4200
```

## Antes de testar

O backend precisa estar rodando em:

```text
http://localhost:8080
```

E o CORS precisa liberar:

```text
http://localhost:4200
```

## Fluxo inicial de teste

1. Login com usuário admin do backend.
2. Acessar Dashboard.
3. Testar cadastro/listagem em:
   - Veículos
   - Motoristas
   - Clientes
4. Criar uma Ordem de Serviço.
5. Iniciar, concluir e faturar a Ordem de Serviço.
6. Conferir a receita gerada em Financeiro.
7. Criar abastecimento e conferir despesa automática.
8. Criar manutenção, iniciar, concluir e conferir despesa automática.
9. Criar documento de veículo e gerar despesa de documentação.

## Observação

Este frontend foi criado para encaixar com os endpoints e DTOs do backend montado no projeto. Caso algum campo esteja com nome diferente no backend, ajuste a interface correspondente em:

```text
src/app/core/models/api.models.ts
```

## Publicando no GitHub com seguranca

Antes do primeiro commit, confira:

```bash
npm run build
npm run security:audit
```

Nao envie `node_modules/`, `dist/`, `.angular/`, arquivos `.env*` locais ou qualquer credencial real. O projeto ja inclui `.gitignore`, Dependabot e uma workflow de seguranca para validar pull requests no GitHub.
