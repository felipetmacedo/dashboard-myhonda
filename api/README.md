# SAGzap myHonda — API

API Express do SAGzap myHonda. Node 20 + Babel + Sequelize (MySQL). Faz parte do monorepo
`dashboard-myhonda` — veja o README da raiz para deploy e visão geral.

## Rodar local

```bash
yarn install
yarn start:dev   # porta 3000, nodemon + babel-node
```

Variáveis de ambiente (obrigatórias — sem valores padrão em código):
```
SFSEA_DB_HOST=<host-do-banco>
SFSEA_DB_NAME=<nome-do-banco>
SFSEA_DB_USER=<usuario>
SFSEA_DB_PASSWORD=<senha>
SFSEA_DB_PORT=3306
APP_SECRET_KEY=<chave-jwt-segura>
```

---

## Padrões de código

### Fluxo obrigatório para nova rota

```
Schema → Service → Controller → Route → index.js → routes.js
```

Nunca pular etapas. Controller não tem SQL. Service não conhece `req`/`res`.

---

### 1. Schema (validação com yup)

```js
// api/src/schemas/reports.js
import * as yup from 'yup';

export default {
  leads: {
    query: yup.object().shape({
      dataInicio: yup.string().required(),   // YYYY-MM-DD
      dataFinal:  yup.string().required(),
      codhda:     yup.string().required(),   // CSV: "1768565,1768566"
    }),
  },
};
```

**Tipos de validação:**
- `query:` para parâmetros GET (`?key=value`)
- `body:` para POST/PUT body
- `params:` para path params (`/:id`)

---

### 2. Service (lógica + SQL)

```js
// api/src/services/reports.js
import Database from '../database';
import { QueryTypes } from 'sequelize';

export default class ReportsService {
  constructor() {
    this.database = new Database();
  }

  async leads({ dataInicio, dataFinal, codhda }) {
    const codhdaArray = codhda.split(',').map(c => c.trim()).filter(Boolean);

    const query = `
      SELECT
        t.ID,
        t.NOME,
        t.TIPO,
        t.data_criacao_lead
      FROM ihs_myhonda_integracao t
      WHERE t.data_criacao_lead BETWEEN :dataInicio AND :dataFinal
        AND t.CODHDA IN (:codhda)
      ORDER BY t.ID DESC
    `;

    return this.database.masterInstance.query(query, {
      replacements: { dataInicio, dataFinal, codhda: codhdaArray },
      type: QueryTypes.SELECT,
    });
  }
}
```

**Regras:**
- Parâmetros com `:nomeParam` + objeto `replacements`.
- Sequelize expande arrays automaticamente para cláusulas `IN (:param)`.
- `QueryTypes.SELECT` para SELECT, `QueryTypes.UPDATE` para UPDATE sem retorno.
- Nunca construir SQL por concatenação de strings — sempre `replacements`.

---

### 3. Controller

```js
// api/src/controllers/reports.js
import BaseController from './base';
import { ReportsService } from '@services';

export default class ReportsController extends BaseController {
  constructor() {
    super();
    this.reportsService = new ReportsService();
    this.leads = this.leads.bind(this);   // obrigatório para manter contexto
  }

  async leads(req, res) {
    try {
      const { dataInicio, dataFinal, codhda } = req.filter;
      const data = await this.reportsService.leads({ dataInicio, dataFinal, codhda });
      this.sendSuccess({ data, res });
    } catch (error) {
      this.sendError({ error, res });
    }
  }
}
```

**Regras:**
- Extrair parâmetros de `req.filter` (query params validados pelo schema).
- `req.data` para body validado.
- `req.auth` para dados do usuário logado (id, storeId).
- Sempre `this.sendSuccess` / `this.sendError` — nunca `res.json()` direto.

---

### 4. Route

```js
// api/src/routes/reports.js
import BaseRoutes from './base';
import { ReportsSchema } from '@schemas';
import { ReportsController } from '@controllers';

class ReportsRoutes extends BaseRoutes {
  constructor() {
    super();
    this.reportsController = new ReportsController();
  }

  setup() {
    this.router.get(
      '/leads',
      this.SchemaValidator.validate(ReportsSchema.leads),
      this.reportsController.leads
    );
    return this.router;
  }
}

export default ReportsRoutes;
```

---

### 5. Registrar nos index files e routes.js

```js
// schemas/index.js — adicionar
import ReportsSchema from './reports';
export { ..., ReportsSchema };

// services/index.js — adicionar
import ReportsService from './reports';
export { ..., ReportsService };

// controllers/index.js — adicionar
import ReportsController from './reports';
export { ..., ReportsController };

// routes/index.js — adicionar
import ReportsRoutes from './reports';
export { ..., ReportsRoutes };

// routes.js — instanciar + montar
import ReportsRoutes from './routes/reports.js';
this.reportsRoutes = new ReportsRoutes();
const reportsRouter = this.reportsRoutes.setup();
// no mounts array:
{ prefix: '/reports', middlewares: [], router: reportsRouter }
// no routes.use:
this.routes.use('/reports', reportsRouter);
```

---

### Middlewares disponíveis

```js
import { AuthMiddleware, PermissionMiddleware, AdminUserMiddleware } from '@middlewares';

// Requer token JWT válido
AuthMiddleware.isAuthorized

// Requer permissão específica
PermissionMiddleware.hasPermission('STORES.READ')

// Requer usuário admin
AdminUserMiddleware.isAuthorized
```

---

### Resposta padrão (`BaseController`)

```json
// Sucesso
{ "status": "success", "data": [...] }

// Erro
{ "status": "error", "code": 500, "message": "Mensagem legível" }
```

---

## Banco de dados

- MySQL, schema `sfsea`, host `54.39.16.104`.
- Sem migrations automáticas — schema pré-existente.
- Models Sequelize em `src/models/` — auto-carregados pelo `database.js`.
- Queries complexas (relatórios) = raw SQL com `QueryTypes.SELECT`.
- Operações simples (CRUD de usuários) = ORM Sequelize.
