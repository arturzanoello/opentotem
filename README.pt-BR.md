# OpenTotem

Plataforma open-source de autoatendimento: app de totem em React Native, API em Node.js e painel web em tempo real para a cozinha e o painel de senhas, além da `pos-bridge`, uma API única em TypeScript para terminais de pagamento de fabricantes diferentes.

> Em construção: dia 1 de 21. [English version](README.md).

## Como rodar

Requisitos: Node.js 22+ (24 recomendado), pnpm e Docker (para o PostgreSQL).

```bash
pnpm install
cp .env.example .env
pnpm db:up          # PostgreSQL em localhost:5432
pnpm dev            # API na porta 3333 e painel web na 5173
pnpm dev:kiosk      # servidor do Expo para o app do totem
```

Teste a API: `curl http://localhost:3333/health`.

A estrutura do projeto, os scripts e as regras de engenharia estão no [README em inglês](README.md).

## Licença

[MIT](LICENSE)
