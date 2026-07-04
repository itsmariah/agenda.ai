# Agenda.AI

Plataforma de agendamento inteligente para negócios de serviços (salões, clínicas, barbearias, etc). Clientes marcam horário conversando com um assistente de IA; donos do negócio administram serviços, funcionários e agendamentos, e recebem insights automáticos gerados por IA sobre o desempenho do negócio.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron&logoColor=white)
![Anthropic Claude](https://img.shields.io/badge/Claude-D97757?style=flat&logo=anthropic&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=flat&logo=resend&logoColor=white)

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack técnica](#stack-técnica)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Modelo de dados](#modelo-de-dados)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Documentação da API](#documentação-da-api)
- [Build e deploy](#build-e-deploy)

## Visão geral

O agenda.ai é dividido em duas experiências:

- **Área do cliente** — o cliente escolhe um estabelecimento e agenda um horário conversando naturalmente com um assistente de IA (Claude), que consulta serviços, profissionais e horários disponíveis em tempo real antes de confirmar o agendamento.
- **Área administrativa** — o dono/funcionário do estabelecimento gerencia serviços, funcionários (com horários de trabalho), visualiza e atualiza agendamentos, acompanha métricas no dashboard, conversa com um assistente de gestão via IA e gera insights automáticos sobre o negócio.

O projeto também pode rodar como aplicativo desktop via Electron.

## Funcionalidades

**Cliente**
- Cadastro e login
- Listagem de estabelecimentos disponíveis
- Agendamento por chat com IA (a IA lista serviços, profissionais e horários livres, e confirma o agendamento)
- Histórico de agendamentos (próximos e passados)

**Administração**
- Dashboard com métricas (total de agendamentos, comparativo mensal, cancelamentos, serviços/funcionários mais ativos)
- Gestão de agendamentos com atualização de status (pendente, confirmado, cancelado, concluído, não compareceu)
- Cadastro de serviços (duração, preço, ativo/inativo)
- Cadastro de funcionários com horário de trabalho por dia da semana
- Assistente de IA para perguntas sobre o negócio
- Insights automáticos gerados por IA a partir dos dados de agendamento

**Autenticação**
- JWT com três papéis: `ADMIN`, `EMPLOYEE` e `CLIENT`
- Rotas protegidas por papel no front e no back

## Stack técnica

| Camada | Tecnologias |
|---|---|
| Backend | NestJS 11, TypeScript, Prisma 7 (driver adapter `@prisma/adapter-pg`), PostgreSQL, Swagger |
| Autenticação | JWT (`@nestjs/jwt` + Passport), bcrypt para hash de senha, guards de papel (`ADMIN`/`EMPLOYEE`/`CLIENT`), validação com `class-validator`/`class-transformer` |
| IA | Claude (Anthropic SDK) — chat de agendamento com tool-use, assistente de gestão, geração de insights |
| E-mail | Resend — envio do link de redefinição de senha |
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, React Router 7, Zustand, Axios |
| Desktop | Electron + electron-builder (Windows, macOS, Linux) |
| Infra | Railway (backend), Vercel (frontend) |

## Estrutura do projeto

```
agenda.ai/
├── backend/            # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # login, registro, JWT, guards de papel
│   │   │   ├── users/
│   │   │   ├── establishments/
│   │   │   ├── services/
│   │   │   ├── employees/      # inclui horários e cálculo de disponibilidade
│   │   │   ├── appointments/   # criação com checagem de conflito, status, estatísticas
│   │   │   └── ai/
│   │   │       ├── chat/       # chat de agendamento do cliente (tool-use)
│   │   │       ├── assistant/  # assistente de gestão do admin
│   │   │       └── insights/   # geração de insights estruturados
│   │   └── prisma/
│   └── prisma/schema.prisma    # modelo de dados
├── frontend/           # SPA React
│   └── src/
│       ├── pages/
│       │   ├── auth/           # Login, Register
│       │   ├── admin/          # Dashboard, Assistant, Insights, Appointments, Services, Employees
│       │   └── client/         # ClientHome, BookingChat, MyAppointments
│       ├── components/         # AdminLayout, ClientLayout, PrivateRoute
│       │   └── ui/              # Button, Card, Input, Field, Badge, PageHeader (design system)
│       └── store/               # estado de autenticação (Zustand)
└── electron/            # wrapper desktop (main/preload)
```

## Modelo de dados

Entidades principais (definidas em `backend/prisma/schema.prisma`):

- **User** — usuário do sistema (`ADMIN`, `EMPLOYEE` ou `CLIENT`)
- **Establishment** — o negócio, pertence a um `User` dono
- **Service** — serviço oferecido (nome, duração, preço)
- **Employee** — profissional do estabelecimento, com `EmployeeSchedule` (horário por dia da semana)
- **Appointment** — agendamento, ligando cliente, funcionário e serviço, com status
- **Conversation** / **ConversationMessage** — histórico das conversas com a IA (chat do cliente e assistente do admin)

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL (local ou remoto)
- Uma chave de API da [Anthropic](https://console.anthropic.com/) para as funcionalidades de IA

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd agenda.ai
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configurar o backend

```bash
cd backend
cp .env.example .env
```

Preencha o `.env` com sua `DATABASE_URL`, `JWT_SECRET` e `ANTHROPIC_API_KEY` (veja a seção [Variáveis de ambiente](#variáveis-de-ambiente)).

Depois, aplique as migrations:

```bash
npx prisma migrate dev
```

### 3. Configurar o frontend

Sem configuração adicional é necessário em desenvolvimento — o Vite já faz proxy de `/api` para `http://localhost:3000`. Caso queira apontar para outro backend, copie `frontend/.env.example` para `.env` e defina `VITE_API_URL`.

### 4. Rodar

Em dois terminais separados, a partir da raiz do projeto:

```bash
npm run dev:backend
npm run dev:frontend
```

A API sobe em `http://localhost:3000` (Swagger em `/docs`) e o frontend em `http://localhost:5173` (ou próxima porta livre).

### Rodando como app desktop (Electron)

```bash
npm run electron:dev
```

## Variáveis de ambiente

**backend/.env**

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (ex: `7d`) |
| `ANTHROPIC_API_KEY` | Chave de API da Anthropic (Claude) |
| `PORT` | Porta da API (padrão `3000`) |

**frontend/.env** *(opcional em desenvolvimento)*

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API. Em dev, se omitida, usa o proxy `/api` do Vite |

## Scripts disponíveis

Na raiz do projeto:

| Comando | Descrição |
|---|---|
| `npm run dev:backend` | Sobe a API NestJS em modo watch |
| `npm run dev:frontend` | Sobe o frontend Vite em modo dev |
| `npm run electron:dev` | Sobe frontend + Electron em modo dev |
| `npm run electron:build` | Builda o frontend e empacota o app Electron |

Dentro de `backend/`: `npm run start:dev`, `npm run build`, `npm run test`, `npm run test:e2e`.

Dentro de `frontend/`: `npm run dev`, `npm run build`, `npm run lint`.

## Documentação da API

Com o backend rodando, a documentação Swagger está disponível em `http://localhost:3000/docs`.

## Build e deploy

- **Backend**: configurado para deploy no [Railway](https://railway.app) (`backend/railway.json`, `backend/Dockerfile`).
- **Frontend**: configurado para deploy na [Vercel](https://vercel.com) (`frontend/vercel.json`).
- **Desktop**: `npm run electron:build` gera instaladores para Windows, macOS e Linux via `electron-builder` (config em `package.json`).
