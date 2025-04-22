# Preparando o VetStock para o GitHub

Este documento fornece instruções para preparar e publicar o projeto VetStock no GitHub.

## 1. Criar um Repositório no GitHub

1. Acesse [GitHub](https://github.com/) e faça login em sua conta
2. Clique no botão '+' no canto superior direito e selecione "New repository"
3. Preencha o formulário:
   - Nome do repositório: `vetstock`
   - Descrição: `Sistema de gestão para controle de estoque e vacinas de animais com plano de assinatura mensal`
   - Visibilidade: Pública ou Privada (de acordo com sua preferência)
   - Inicialize o repositório com:
     - [x] Adicionar um arquivo README
     - [x] Escolha uma licença: MIT
4. Clique em "Create repository"

## 2. Atualizar o package.json (Localmente)

Após baixar o código para sua máquina local, você pode atualizar o package.json para incluir informações mais precisas sobre o projeto:

```json
{
  "name": "vetstock",
  "version": "1.0.0",
  "description": "Sistema de gestão para controle de estoque e vacinas de animais com plano de assinatura mensal",
  "type": "module",
  "license": "MIT",
  "author": "Seu Nome <seu-email@exemplo.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/seu-usuario/vetstock.git"
  },
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  ...
}
```

## 3. Configurando o Projeto no GitHub

### Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/vetstock.git
cd vetstock
```

### Adicionar os Arquivos do Projeto

1. Copie todos os arquivos do VetStock para a pasta do repositório clonado
2. Certifique-se de que o `.gitignore` está configurado corretamente para não incluir arquivos sensíveis

### Primeiro Commit

```bash
git add .
git commit -m "Versão inicial do VetStock"
git push origin main
```

## 4. Proteção de Dados Sensíveis

1. **NUNCA adicione arquivos .env ao repositório** - eles contêm informações sensíveis
2. Use o arquivo `.env.example` como modelo para configuração
3. Para implantação em produção, configure as variáveis de ambiente no provedor de hospedagem

## 5. Documentação

Os seguintes arquivos já foram criados para documentar o projeto:
- `README.md` - Visão geral e instruções de instalação
- `CONTRIBUTING.md` - Guia para contribuidores
- `LICENSE` - Licença MIT
- `.env.example` - Modelo para variáveis de ambiente

## 6. Badges e Integração Contínua (Opcional)

Você pode adicionar badges ao README.md para mostrar o status do projeto:
- Status de build (GitHub Actions, Travis CI, etc.)
- Cobertura de testes
- Versão
- Licença

### Exemplo de Configuração do GitHub Actions

Crie um arquivo `.github/workflows/ci.yml` para configurar integração contínua:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20.x'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build
      run: npm run build
```

## 7. Divulgação do Projeto

Uma vez que o projeto esteja no GitHub, você pode:
1. Compartilhar o link em comunidades relacionadas
2. Criar uma página de demonstração
3. Adicionar tags para facilitar a descoberta
4. Incluir capturas de tela no README.md

---

Siga essas instruções para configurar corretamente seu projeto no GitHub e facilitar a colaboração.