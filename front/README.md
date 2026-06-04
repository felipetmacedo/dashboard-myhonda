# MyHonda SFS — Frontend

Frontend React/Vite do MyHonda SFS. Faz parte do monorepo `dashboard-myhonda` — veja o
[README da raiz](../README.md) para visão geral, deploy e padrões.

## Stack

- Vite + React 18 + TypeScript
- shadcn/ui (Radix) + Tailwind CSS
- React Query (`@tanstack/react-query`) + React Router
- `@tanstack/react-table` para tabelas, Recharts para gráficos

## Rodar local

```sh
npm install --legacy-peer-deps   # conflito de peer-deps (date-fns) — flag necessária
cp .env.example .env
npm run dev                      # porta 8080
```

`npm run build` gera `dist/`; `npm run lint` roda o ESLint.

## Regras para agentes de IA (obrigatório)

- Regras globais: `AGENTS.md`
- Windsurf: `.windsurf/rules/`
- Tabelas: `TABLES.md`

Principais:
- React Query para todo estado de servidor.
- `useMemo` para valores derivados; `useCallback` para handlers passados via props.
- UX simples, consistente e fácil de usar.
- Cor primária = vermelho Honda (`--primary` em `src/index.css`); usar `bg-primary`/`text-primary`.

## Deploy

Imagem nginx (`Dockerfile` + `nginx.conf`) publicada via GitHub Actions e servida pelo Traefik em
`https://myhonda.sagzap.com.br`. Detalhes no README da raiz.
