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


