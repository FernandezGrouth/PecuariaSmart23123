# Guia de Contribuição

Obrigado pelo interesse em contribuir com o VetStock! Este documento fornece diretrizes para contribuir com o projeto.

## Como Contribuir

1. Faça um fork do repositório
2. Clone o seu fork: `git clone https://github.com/seu-usuario/vetstock.git`
3. Crie uma branch para sua feature: `git checkout -b minha-nova-feature`
4. Faça suas alterações e adicione testes quando possível
5. Certifique-se de que o código segue os padrões do projeto
6. Commit suas alterações: `git commit -m 'Adiciona nova feature'`
7. Push para a branch: `git push origin minha-nova-feature`
8. Abra um Pull Request

## Convenções de Código

- Use TypeScript para todos os arquivos de código
- Siga as convenções do ESLint configuradas no projeto
- Mantenha a estrutura de pastas existente
- Documente novas funções e componentes

## Estrutura do Projeto

```
vetstock/
├── client/               # Código frontend
│   ├── src/
│   │   ├── components/   # Componentes React reutilizáveis
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── lib/          # Utilitários e funções auxiliares
│   │   ├── pages/        # Páginas da aplicação
│   │   └── App.tsx       # Componente principal
├── server/               # Código backend
│   ├── routes.ts         # Definição de rotas da API
│   ├── storage.ts        # Interface de armazenamento
│   └── auth.ts           # Configuração de autenticação
├── shared/               # Código compartilhado entre frontend e backend
│   └── schema.ts         # Definição do schema do banco de dados
```

## Pull Requests

- Descreva as alterações em detalhes
- Referencie issues relacionadas
- Atualize a documentação se necessário
- Verifique se todos os testes estão passando

## Issues

Use issues para relatar bugs, solicitar recursos ou discutir melhorias:

- Para bugs, inclua passos para reprodução, versões do ambiente e logs de erro
- Para solicitações de recursos, descreva o caso de uso e os benefícios esperados

## Configuração do Ambiente de Desenvolvimento

1. Instale o Node.js (versão 20 ou superior)
2. Instale o PostgreSQL (versão 14 ou superior)
3. Configure as variáveis de ambiente conforme `.env.example`
4. Execute `npm install` para instalar as dependências
5. Execute `npm run dev` para iniciar o servidor de desenvolvimento

## Lançamento de Versões

O projeto segue as convenções de [Versionamento Semântico](https://semver.org/):

- Patch (x.x.1): Correções de bugs
- Minor (x.1.x): Novos recursos retrocompatíveis
- Major (1.x.x): Mudanças incompatíveis com versões anteriores

## Código de Conduta

- Seja respeitoso e inclusivo
- Valorize a diversidade de perspectivas e experiências
- Foque em colaboração e crescimento da comunidade
- Seja aberto a críticas construtivas

---

Obrigado por contribuir!