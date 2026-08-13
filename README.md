# teste-vba-systems

Banking as a Service (BaaS) — Integração com Gateway

Desafio de BaaS que se integra via HTTP ao gateway simulado **Lera Box**
(`https://api.branchpay.com.br`) para checkout Pix/cartão, carteira, extrato,
saques e webhooks. Backend em **NestJS + TypeORM + MySQL**, frontend em
**React + Vite**.

## Funcionalidades

- Cadastro e login local (JWT)
- Cadastro de conta no gateway Lera Box (dispara o e-mail com as credenciais
  de acesso à API do gateway)
- Vínculo de uma conta do gateway já existente à conta local
- Consulta de taxas de cartão por bandeira/parcelas
- Checkout Pix (com QR code) e checkout de cartão
- Carteira e extrato (com filtros por status)
- Saques (solicitação e consulta)
- Registro e listagem de webhooks
- Comprovante de pagamento imprimível

## Stack

- **Backend**: NestJS, TypeORM, MySQL
- **Frontend**: React, Vite, react-router-dom, Tailwind CSS + shadcn/ui

## Pré-requisitos

- pnpm 11.15.1
- node 24.15.0
- docker 29.7.2

## Configuração

Copie `.env.example` para `.env` na raiz do projeto e preencha as variáveis:

| Variável | Descrição |
|---|---|
| `BACK_PORT` | Porta em que a API NestJS escuta (ex. `3000`) |
| `VITE_API_URL` | URL da API que o frontend consome, ex. `http://localhost:3000/api` |
| `GATEWAY_BASE_URL` | Base URL do gateway Lera Box (`https://api.branchpay.com.br/api`) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Segredo e expiração do JWT emitido pela API local |
| `CRYPTO_SECRET` | Chave usada para criptografar em repouso o `accessToken` do gateway |
| `WEBHOOK_SECRET` / `WEBHOOK_BASE_URL` | Segredo usado para assinar/validar webhooks e a URL pública que os recebe |
| `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` | Credenciais e conexão do MySQL |

## Como rodar

### Opção 1 — Docker Compose (tudo em containers)

```bash
docker compose up -d --build
```

Sobe três serviços:
- `mysql` — MySQL 8.4, porta `MYSQL_PORT`, com healthcheck
- `backend` — API NestJS, porta `BACK_PORT`, só inicia depois do MySQL ficar saudável
- `frontend` — build estático servido por Nginx na porta `5173`, com `VITE_API_URL` já embutido

### Opção 2 — Desenvolvimento local

Suba só o banco via Docker e rode backend/frontend direto na máquina (com hot-reload):

```bash
docker compose up -d mysql

cd backend
pnpm install
pnpm start:dev
```

Em outro terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

A API sobe em `http://localhost:<BACK_PORT>/api` e o frontend em `http://localhost:5173`.

## Documentação da API

Com o backend no ar, o Swagger fica disponível em
`http://localhost:<BACK_PORT>/api/docs`.

## Principais rotas do frontend

| Rota | Descrição |
|---|---|
| `/login` | Login |
| `/cadastro` | Criar conta local |
| `/carteira` | Saldo da carteira |
| `/extrato` | Extrato de transações |
| `/gateway` | Vincular uma conta do gateway já existente |
| `/gateway/cadastro` | Criar uma conta nova no gateway Lera Box |
| `/checkout/pix` | Checkout Pix |
| `/checkout/cartao` | Checkout de cartão |
| `/saque` | Solicitar/consultar saque |
| `/webhooks` | Registrar/listar webhooks |

## Observação

Testar o fluxo completo de pagamento/gateway (Pix e cartão aprovados de
fato) exige uma conta real vinculada no Lera Box — o cadastro em
`/gateway/cadastro` precisa de e-mail e telefone reais, pois o gateway
valida e rejeita dados fictícios.
