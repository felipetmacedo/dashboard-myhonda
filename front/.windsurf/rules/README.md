---
trigger: always_on
---

# Documentação do Projeto Dashboard SAGzap myHonda

## 📚 Visão Geral

Este diretório contém a documentação completa do projeto Dashboard SAGzap myHonda, um sistema de dashboards analíticos desenvolvido com React, TypeScript e Tailwind CSS.

## 📖 Documentos Disponíveis

### 1. [Estrutura de Pastas](./folder-structure.md)
Documentação completa da organização de pastas e arquivos do projeto.

**Conteúdo:**
- Visão geral da estrutura
- Detalhamento de cada pasta principal
- Convenções de nomenclatura
- Estatísticas do projeto

**Quando consultar:**
- Ao procurar onde criar novos arquivos
- Para entender a organização do código
- Ao fazer onboarding de novos desenvolvedores

---

### 2. [Arquitetura e Padrões](./architecture-patterns.md)
Documentação da arquitetura do sistema e padrões de código utilizados.

**Conteúdo:**
- Stack tecnológico
- Arquitetura em camadas
- Padrões de componentes (Atomic Design)
- Gerenciamento de estado
- Padrões de serviços
- Padrões de tipos TypeScript
- Padrões de roteamento
- Padrões de segurança
- Padrões de UI/UX

**Quando consultar:**
- Antes de implementar novas features
- Para entender decisões arquiteturais
- Ao refatorar código existente
- Para garantir consistência no código

---

### 3. [Padrões de Código](./coding-standards.md)
Guia completo de padrões e convenções de código do projeto.

**Conteúdo:**
- Convenções de nomenclatura
- Estrutura de arquivos
- Padrões TypeScript
- Padrões React
- Padrões de estilo (Tailwind CSS)
- Padrões de API
- Boas práticas gerais

**Quando consultar:**
- Ao escrever código novo
- Durante code reviews
- Para resolver dúvidas sobre nomenclatura
- Para garantir código consistente

---

### 4. [Guia de Componentes](./component-guidelines.md)
Documentação detalhada sobre componentes React do projeto.

**Conteúdo:**
- Tipos de componentes
- Componentes UI base (shadcn/ui)
- Componentes de Dashboard
- Componentes de Tabela
- Componentes de Gráficos
- Componentes de Controle
- Como criar novos componentes

**Quando consultar:**
- Ao criar novos componentes
- Para entender componentes existentes
- Para reutilizar componentes
- Para manter consistência visual

---

### 5. [Guia de Serviços de API](./api-services-guide.md)
Documentação completa dos serviços de API e integração com backend.

**Conteúdo:**
- Visão geral da arquitetura de serviços
- Estrutura de serviços
- Serviços disponíveis (Auth, Propostas, Adimplência, etc.)
- Como criar novos serviços
- Padrões de API
- Tratamento de erros
- Processamento de dados

**Quando consultar:**
- Ao integrar com novas APIs
- Para entender APIs existentes
- Ao debugar problemas de rede
- Para implementar novos endpoints

---

### 6. [Fluxo de Desenvolvimento](./development-workflow.md)
Guia prático do fluxo de trabalho de desenvolvimento.

**Conteúdo:**
- Setup inicial do projeto
- Workflow diário
- Criando novas features (passo a passo)
- Debug e troubleshooting
- Build e deploy
- Boas práticas
- Scripts úteis

**Quando consultar:**
- Ao começar a trabalhar no projeto
- Para criar novas features
- Ao debugar problemas
- Antes de fazer deploy
- Para seguir boas práticas

---

### 7. [Regras Globais de IA](./ai-agent-rules.md)
Diretrizes obrigatórias para agentes de IA no projeto.

**Conteúdo:**
- Uso obrigatório de React Query para server state
- Uso de `useMemo` para constantes/valores derivados
- Uso de `useCallback` para handlers estáveis
- Padrões de UX para alta usabilidade

**Quando consultar:**
- Antes de pedir geração de código para IA
- Ao revisar PRs criados por IA
- Para garantir consistência entre agentes

---

## 🚀 Início Rápido

### Para Novos Desenvolvedores

1. **Leia primeiro:**
   - [Estrutura de Pastas](./folder-structure.md) - Entenda a organização
   - [Fluxo de Desenvolvimento](./development-workflow.md) - Setup inicial

2. **Consulte durante o desenvolvimento:**
   - [Padrões de Código](./coding-standards.md) - Escreva código consistente
   - [Guia de Componentes](./component-guidelines.md) - Crie componentes
   - [Guia de Serviços de API](./api-services-guide.md) - Integre APIs

3. **Referência:**
   - [Arquitetura e Padrões](./architecture-patterns.md) - Entenda decisões técnicas
   - [Regras Globais de IA](./ai-agent-rules.md) - Garanta consistência entre agentes

### Para Desenvolvedores Experientes

**Consulta Rápida:**
- Precisa criar um novo dashboard? → [Guia de Componentes - Dashboard](./component-guidelines.md#componentes-de-dashboard)
- Precisa integrar uma API? → [Guia de Serviços - Criar Serviço](./api-services-guide.md#como-criar-novos-serviços)
- Dúvida sobre nomenclatura? → [Padrões de Código - Nomenclatura](./coding-standards.md#convenções-de-nomenclatura)
- Problema de performance? → [Fluxo de Desenvolvimento - Debug](./development-workflow.md#debug-e-troubleshooting)

---

## 📊 Estrutura do Projeto (Resumo)

```
dashboard-myhonda/
├── src/
│   ├── components/          # 95 componentes React
│   │   ├── ui/             # 49 componentes shadcn/ui
│   │   ├── *Dashboard.tsx  # Dashboards principais
│   │   ├── *Table.tsx      # Componentes de tabela
│   │   └── *Charts*.tsx    # Componentes de gráficos
│   ├── pages/              # 6 páginas (rotas)
│   ├── services/           # 18 serviços de API
│   ├── contexts/           # Contextos React (Auth)
│   ├── hooks/              # 3 custom hooks
│   └── utils/              # Utilitários
├── supabase/               # Configuração Supabase
└── docs/                   # 📍 Você está aqui
```

---

## 🛠️ Stack Tecnológico

### Core
- **React 18.3.1** - Framework frontend
- **TypeScript 5.5.3** - Tipagem estática
- **Vite 5.4.1** - Build tool

### UI/Styling
- **Tailwind CSS 3.4.11** - Utility-first CSS
- **shadcn/ui** - Componentes UI
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Ícones

### State Management
- **TanStack Query 5.56.2** - Server state
- **React Context** - Global state

### Forms & Validation
- **React Hook Form 7.53.0** - Gerenciamento de formulários
- **Zod 3.23.8** - Validação de schemas

### Charts & Visualization
- **Recharts 2.12.7** - Biblioteca de gráficos

### Backend
- **Supabase 2.58.0** - Backend as a Service

### Routing
- **React Router DOM 6.26.2** - Roteamento

---

## 🎯 Principais Features

### Dashboards Disponíveis
1. **Dashboard de Propostas** - Análise de propostas comerciais
2. **Dashboard de Adimplência** - Monitoramento de pagamentos
3. **Dashboard de Lances** - Análise de lances em consórcios
4. **Dashboard de Retenção** - Análise de retenção de clientes
5. **Dashboard de Parcelas** - Gestão de parcelas a vencer

### Funcionalidades
- ✅ Autenticação e autorização
- ✅ Filtros avançados por data e loja
- ✅ Visualização de dados em tabelas e gráficos
- ✅ Exportação de dados (Excel, PDF, Imagem)
- ✅ Auto-refresh configurável
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Dark mode (suportado)
- ✅ Configuração de colunas visíveis
- ✅ Ordenação e paginação de tabelas

---

## 📝 Convenções Importantes

### Nomenclatura de Arquivos
```
Componentes:     PascalCase      (AdimplenciaDashboard.tsx)
Serviços:        camelCase       (adimplenciaApi.ts)
Tipos:           camelCase       (adimplenciaTypes.ts)
Hooks:           camelCase/kebab (useAutoRefresh.tsx, use-mobile.tsx)
Páginas:         PascalCase      (Adimplencia.tsx)
```

### Estrutura de Imports
```typescript
// 1. React e libs externas
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Componentes UI
import { Card } from '@/components/ui/card';

// 3. Componentes locais
import { StatsCards } from '@/components/StatsCards';

// 4. Hooks
import { useAuth } from '@/contexts/AuthContext';

// 5. Services e tipos
import { fetchData } from '@/services/api';
import { DataType } from '@/services/apiTypes';

// 6. Utils
import { formatCurrency } from '@/utils/formatters';
```

### Padrão de Componente
```typescript
import React from 'react';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export const Component = ({ prop1, prop2 = 0 }: ComponentProps) => {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Handlers
  const handleClick = () => {};
  
  // 3. Effects
  useEffect(() => {}, []);
  
  // 4. Render
  return <div>{prop1}</div>;
};
```

---

## 🔍 Troubleshooting Rápido

### Problema: Erro de compilação TypeScript
**Solução:** Verifique tipos em `[feature]Types.ts` e imports

### Problema: Query não atualiza
**Solução:** Verifique `queryKey` - deve incluir todos os parâmetros

### Problema: Componente não renderiza
**Solução:** Verifique console por erros, verifique props e tipos

### Problema: API retorna erro
**Solução:** Verifique Network tab, URL, parâmetros e token

### Problema: Estilo não aplica
**Solução:** Verifique classes Tailwind, ordem de classes, conflitos

---

## 📞 Suporte

### Documentação Externa
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)

### Ferramentas Úteis
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 🔄 Atualizações da Documentação

Esta documentação deve ser atualizada sempre que:
- Novos padrões forem adotados
- Novas features forem implementadas
- Mudanças significativas na arquitetura
- Novos serviços de API forem adicionados
- Novos componentes importantes forem criados

**Última atualização:** 2025-10-03

---

## 📋 Checklist de Onboarding

### Dia 1
- [ ] Ler [Estrutura de Pastas](./folder-structure.md)
- [ ] Ler [Fluxo de Desenvolvimento](./development-workflow.md)
- [ ] Fazer setup do projeto
- [ ] Rodar projeto localmente
- [ ] Explorar dashboards existentes

### Dia 2-3
- [ ] Ler [Padrões de Código](./coding-standards.md)
- [ ] Ler [Guia de Componentes](./component-guidelines.md)
- [ ] Estudar componentes existentes
- [ ] Criar componente simples de teste

### Dia 4-5
- [ ] Ler [Guia de Serviços de API](./api-services-guide.md)
- [ ] Ler [Arquitetura e Padrões](./architecture-patterns.md)
- [ ] Estudar serviços existentes
- [ ] Integrar com uma API de teste

### Semana 2
- [ ] Implementar feature pequena completa
- [ ] Fazer code review
- [ ] Contribuir com melhorias na documentação

---

## 🎓 Recursos de Aprendizado

### Para Iniciantes em React
1. [Tutorial Oficial React](https://react.dev/learn)
2. [TypeScript para React](https://react-typescript-cheatsheet.netlify.app/)
3. [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)

### Para Desenvolvedores Intermediários
1. [React Patterns](https://reactpatterns.com/)
2. [TanStack Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)
3. [Advanced TypeScript](https://www.typescriptlang.org/docs/handbook/advanced-types.html)

### Para Desenvolvedores Avançados
1. [React Performance](https://react.dev/learn/render-and-commit)
2. [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
3. [Web Performance](https://web.dev/performance/)

---

## 📈 Métricas do Projeto

### Código
- **Linhas de código:** ~50.000+
- **Componentes:** 95+
- **Serviços de API:** 10
- **Páginas:** 6
- **Hooks customizados:** 3

### Dependências
- **Produção:** 72 pacotes
- **Desenvolvimento:** 19 pacotes
- **Total:** 91 pacotes

### Performance
- **Build time:** ~30-60s
- **Dev server startup:** ~2-5s
- **Hot reload:** <1s

---

## 🎯 Próximos Passos

Após ler esta documentação, você deve ser capaz de:

1. ✅ Navegar pela estrutura do projeto
2. ✅ Entender a arquitetura e padrões
3. ✅ Escrever código consistente
4. ✅ Criar novos componentes
5. ✅ Integrar com APIs
6. ✅ Debugar problemas
7. ✅ Fazer deploy

**Boa sorte e bom desenvolvimento! 🚀**
