# VetStock - Sistema de Gestão Veterinária

![VetStock Logo](https://img.shields.io/badge/VetStock-Sistema%20de%20Gest%C3%A3o%20Veterin%C3%A1ria-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Sobre o Projeto

VetStock é um sistema completo de gestão para clínicas veterinárias que combina controle de estoque e monitoramento de vacinas para animais. Desenvolvido para otimizar o gerenciamento diário de clínicas e hospitais veterinários, o sistema oferece uma interface amigável e recursos completos para profissionais da área.

### Principais Funcionalidades

- 🐾 **Cadastro de Animais**: Gerenciamento completo dos pacientes com histórico médico
- 💉 **Controle de Vacinas**: Acompanhamento detalhado com alertas de vencimento
- 📦 **Gerenciamento de Estoque**: Controle de produtos e medicamentos com alertas de níveis baixos/altos
- 📊 **Dashboard Intuitivo**: Visão geral das informações críticas do negócio
- 🔔 **Sistema de Alertas**: Notificações automáticas para vacinas próximas do vencimento e produtos em falta
- 👥 **Perfis de Acesso**: Níveis diferenciados para administradores e usuários comuns

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido com as seguintes tecnologias:

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL
- **ORM**: Drizzle ORM
- **Autenticação**: Passport.js
- **Pagamentos**: Stripe API

## 💻 Pré-requisitos

Antes de começar, verifique se você atende aos seguintes requisitos:

- Node.js 20.x ou superior
- PostgreSQL 14.x ou superior
- Conta no Stripe para processamento de pagamentos

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/vetstock.git
cd vetstock
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/vetstock
PGUSER=usuario
PGPASSWORD=senha
PGDATABASE=vetstock
PGHOST=localhost
PGPORT=5432

# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_seu_stripe_public_key

# Sessão
SESSION_SECRET=sua_chave_secreta_para_sessoes
```

### 4. Configure o banco de dados
```bash
npm run db:push
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`.

## 📱 Uso do Sistema

### Cadastro e Login
- Acesse a página inicial e crie uma conta na aba "Cadastrar"
- Use o email e senha cadastrados para fazer login

### Principais Módulos
- **Dashboard**: Visão geral com estatísticas e alertas importantes
- **Animais**: Cadastro e gerenciamento de pacientes
- **Vacinas**: Controle de vacinação e alertas de vencimento
- **Estoque**: Gerenciamento de produtos e medicamentos
- **Configurações**: Edição de perfil e gerenciamento da assinatura

### Assinatura
O sistema funciona por meio de assinatura mensal:
- 7 dias de teste gratuito
- R$ 35,00/mês após o período de teste
- Acesso ilimitado a todos os recursos

## 🔒 Segurança e Privacidade

- Todas as senhas são criptografadas
- Comunicação segura via HTTPS
- Pagamentos processados através do Stripe com certificação PCI DSS

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões, entre em contato:

- Email: seu-email@exemplo.com
- Website: [www.seusite.com.br](http://www.seusite.com.br)

---

Desenvolvido com ❤️ para clínicas veterinárias