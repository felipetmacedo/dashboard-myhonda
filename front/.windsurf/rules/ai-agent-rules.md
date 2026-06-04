---
trigger: always_on
---

# Regras Globais de IA (Obrigatórias)

Siga também `AGENTS.md` na raiz do projeto.

## 1) Server State com React Query

- Use `@tanstack/react-query` para toda integração de dados remotos.
- Não buscar dados remotos com `fetch` diretamente em componentes.
- Centralizar APIs em `src/services/*` e consumir com `useQuery`/`useMutation`.
- Definir `queryKey` estável e tratar invalidation adequadamente.

## 2) Memoização de valores com `useMemo`

- Use `useMemo` para constantes derivadas, colunas de tabela, agregações e mapeamentos.
- Evite recomputação em dashboards e componentes de alto custo.

## 3) Funções estáveis com `useCallback`

- Use `useCallback` para funções passadas por props (handlers).
- Não use cache manual de função fora do padrão React.
- Evite funções inline em trechos críticos de renderização.

## 4) Padrões de UX para máxima usabilidade

- Fluxos simples, com menos cliques e rótulos claros.
- Componentes consistentes (shadcn/ui) e reaproveitamento de padrões já existentes.
- Sempre tratar estados de loading, erro e vazio com mensagens objetivas.
- Priorizar legibilidade, previsibilidade e responsividade.

## Checklist rápido

- React Query aplicado?
- `useMemo` onde há valor derivado relevante?
- `useCallback` em handlers repassados?
- Estados de loading/erro/vazio tratados?
- UX final simples e consistente?
