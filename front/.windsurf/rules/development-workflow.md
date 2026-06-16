---
trigger: always_on
---

# Fluxo de Desenvolvimento — SAGzap myHonda

## Setup inicial

```bash
# Clonar e instalar tudo de uma vez (raiz do monorepo)
git clone git@github.com:felipetmacedo/dashboard-myhonda.git
cd dashboard-myhonda
npm install                   # instala concurrently na raiz
npm run install:all           # instala deps da API (yarn) e do front (npm)

# Copiar env do front
cp front/.env.example front/.env
# editar VITE_API_URL=http://localhost:3000 se necessário
```

---

## Rodar local

### Ambos juntos (recomendado)
```bash
npm run dev
# API em http://localhost:3000
# Front em http://localhost:8080
```

### Individualmente
```bash
npm run dev:api    # API Express na porta 3000
npm run dev:front  # Vite na porta 8080
```

> Se porta 3000 ocupada: `lsof -i :3000 -sTCP:LISTEN` → `kill <PID>`

---

## Build

```bash
npm run build          # builda API (babel) + front (vite)
npm run build:api
npm run build:front
```

---

## Lint

```bash
npm run lint           # ESLint API + front
npm run lint:api
npm run lint:front
```

---

## Adicionar um novo dashboard

### 1. API — novo endpoint

```
api/src/
├── schemas/[recurso].js    → validação yup
├── services/[recurso].js   → query SQL
├── controllers/[recurso].js → req/res
└── routes/[recurso].js     → GET /reports/...
```

Exportar em cada `index.js`. Montar em `routes.js`.

### 2. Frontend — nova página

```
front/src/
├── services/[feature]Api.ts + [feature]Types.ts
└── pages/[Feature].tsx
```

Adicionar rota em `App.tsx` e item em `AppSidebar.tsx`.

---

## Deploy

Push em `main` → GitHub Actions (`.github/workflows/deploy-portainer.yml`):
1. Build imagem API → GHCR `dashboard-myhonda:api-latest`
2. Build imagem front → GHCR `dashboard-myhonda:front-latest`
3. Após as duas imagens no GHCR, dispara **um** webhook do stack completo no Portainer

**Secrets necessários no GitHub:**
- `PORTAINER_WEBHOOK` — URL do webhook do stack (compose único com API + front)

Login no GHCR usa `GITHUB_TOKEN` do workflow (`permissions: packages: write`). Só precisa de PAT (`GHCR_TOKEN`) se publicar em outra conta/org.

**Domínios de produção:**
- Front: `https://myhonda.sagzap.com.br`
- API: `https://express-myhonda.sagzap.com.br`

---

## Docker local (opcional)

```bash
# API
docker build ./api --target production -t myhonda-api:local
docker run -p 3000:3000 --env-file api/.env myhonda-api:local

# Front
docker build ./front -t myhonda-front:local
docker run -p 8080:80 myhonda-front:local
```
