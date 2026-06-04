# Copilot Instructions

Siga sempre as regras globais em `AGENTS.md`.

## Regras mandatórias deste repositório

1. Use **React Query (TanStack Query)** para todo server state.
   - Evite `fetch` direto em componentes.
   - Use `src/services/*` para acesso a API.

2. Use **`useMemo`** para constantes/valores derivados com custo de recomputação.

3. Use **`useCallback`** para handlers e funções passadas via props.
   - Não implemente cache manual de funções fora do padrão React.

4. Mantenha UX muito simples e consistente.
   - Trate loading/erro/estado vazio.
   - Mantenha textos claros, ações previsíveis e componentes reutilizáveis.

Em caso de conflito, `AGENTS.md` é a fonte de verdade.
