# 💰 Financial App - Sistema de Gestão Financeira

<div align="center">

<img src="https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go" />
<img src="https://img.shields.io/badge/Angular-17+-DD0031?logo=angular" />
<img src="https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql" />
<img src="https://img.shields.io/badge/Docker-24+-2496ED?logo=docker" />

</div>

🌎 **Languages**
- 🇺🇸 [English](README.en.md)
- 🇧🇷 Português


# 📋 Sobre o Projeto

**Financial App** é uma aplicação simples de **gestão financeira pessoal**, construída com uma arquitetura moderna baseada em **Go + Angular + PostgreSQL + Docker**. Criei este projeto para praticar meus estudos com a linguagem Golang.

O sistema oferece controle de **contas a pagar e receber**, **dashboard interativo**, **gráficos financeiros** e **relatórios detalhados**.

## Este projeto foi desenvolvido com foco em:

- Arquitetura limpa
- Boas práticas de backend
- Frontend moderno e responsivo
- Infraestrutura containerizada
- Código preparado para produção



# 🎥 Demonstração

## Vídeo do Projeto

[![YouTube](https://img.shields.io/badge/Assistir%20no%20YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/poOCmzhHV4c)

Clique no botão acima para assistir à **demonstração completa do projeto**.

## Demonstração da Interface

### Página Inicial (SPA)
![SPA](assets/home-1.png)

### Dashboard

![Dashboard](assets/dashboard.png)

### Lista Transações

![Transactions](assets/lista-transacao.png)

### Cadastro Transações

![Transactions](assets/lista-transacao.png)


# 🏗️ Arquitetura do Sistema
```
financial-app
│
├── backend (Go)
│   ├── domain
│   ├── application
│   ├── infrastructure
│   └── interfaces
│
├── frontend (Angular)
│   ├── components
│   ├── services
│   ├── pages
│   └── shared
│
├── docker
└── docker-compose.yml
```

## Arquitetura Backend

O backend segue princípios de **Clean Architecture**:
```
Controller → UseCase → Domain → Repository
↓
Database
```

Benefícios:

- Baixo acoplamento
- Alta testabilidade
- Facilidade de manutenção
- Independência de frameworks


# 🚀 Tecnologias Utilizadas

## Backend

| Tecnologia | Descrição |
|---|---|
| Go | Linguagem principal |
| Gin | Framework web |
| GORM | ORM |
| PostgreSQL | Banco de dados |
| JWT | Autenticação |



## Frontend

| Tecnologia | Descrição |
|---|---|
| Angular 17 | Framework SPA |
| TypeScript | Tipagem estática |
| RxJS | Programação reativa |
| Chart.js | Gráficos |
| Bootstrap 5 | UI responsiva |
| NGX-Toastr | Notificações |


## DevOps

| Tecnologia | Uso |
|---|---|
| Docker | Containerização |
| Docker Compose | Orquestração |



# ✨ Funcionalidades

## 🔐 Autenticação

- Registro de usuários
- Login com JWT
- Controle de acesso (Admin/User)
- Proteção de rotas
- Persistência de sessão


## 💳 Transações Financeiras

- CRUD completo
- Contas a pagar
- Contas a receber
- Categorização
- Status de pagamento

## 📊 Dashboard

- Resumo financeiro
- Gráfico de fluxo de caixa
- Distribuição por categoria
- Transações recentes
- Próximos vencimentos
- Extrato diário

## 📑 Relatórios

- Extrato financeiro
- Resumo por período
- Filtros avançados
- Paginação


# 🗄️ Modelo de Dados

## Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    category VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```


# ⚙️ Instalação
Pré-requisitos

```
Docker
Docker Compose
Node.js
Go
Git
```

## 1️⃣ Clone o repositório
```bash 
git clone https://github.com/jeffersonfreitas-dev/golang-simple-finance.git
cd financial-app
```


## 2️⃣ Configure as variáveis de ambiente
```bash
cp backend/.env.example backend/cmd/api/.env
```
Edite o .env conforme necessário.


## 3️⃣ Execute a aplicação
```bash
docker-compose up -d
```

# 🌐 Acessos
| Serviço  | URL                                                                                  |
| -------- | ------------------------------------------------------------------------------------ |
| Frontend | [http://localhost](http://localhost)                                                 |
| Backend  | [http://localhost:8080](http://localhost:8080)                                       

# 📚 API

## Endpoints principais
```
Auth
POST /api/v1/auth/register
POST /api/v1/auth/login

Transactions
GET /api/v1/transactions
POST /api/v1/transactions
GET /api/v1/transactions/:id
PUT /api/v1/transactions/:id
DELETE /api/v1/transactions/:id

Dashboard
GET /api/v1/dashboard
GET /api/v1/dashboard/cashflow
GET /api/v1/dashboard/categories
```

# 📱 Responsividade

Interface adaptada para:
```
Desktop
Tablet
Mobile
```

# 🔒 Segurança
```
Senhas criptografadas com bcrypt
Autenticação JWT
Proteção contra SQL Injection
Sanitização contra XSS
CORS configurado
```


# 🙏 Agradecimentos
```
Comunidade Go
Comunidade Angular
Contribuidores do projeto
```

<div align="center">
⭐ Se este projeto te ajudou, considere dar uma estrela!
</div>