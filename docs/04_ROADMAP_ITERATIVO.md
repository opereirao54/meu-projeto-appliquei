# 🗺️ Roadmap Iterativo — Appliquei SaaS

> **Versão:** 1.0 · **Data:** Julho 2025
> **Escopo:** Migração do Appliquei v13.0 (monolito HTML/JS — 10.705 linhas) para plataforma SaaS multi-tenant em Next.js 16.
> **Princípio norteador:** **Zero-regressão** — toda funcionalidade existente deve ser preservada ou evoluída.

---

## 📊 Resumo Executivo

| Item | Detalhe |
|---|---|
| **Sistema atual** | Arquivo HTML único, `localStorage`, Yahoo Finance, BCB API, Brapi |
| **Stack alvo** | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Firebase Auth + Firestore · Asaas Payments · Zustand · TanStack Query |
| **Hospedagem** | Vercel (Hobby Plan) |
| **Estimativa total** | **38–48 dias úteis** (~8–10 semanas) |
| **Estratégia** | Fases sequenciais e testáveis; cada fase entrega funcionalidade operacional |
| **Estado atual** | Projeto Next.js inicializado com shadcn/ui e Tailwind CSS |

---

## 🏗️ Arquitetura de Referência

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Edge + Serverless)            │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Next.js   │  │  API Routes  │  │  Middleware      │ │
│  │  App Shell │  │  /api/*      │  │  Auth + Plans    │ │
│  └─────┬─────┘  └──────┬───────┘  └────────┬─────────┘ │
│        │               │                   │            │
│  ┌─────┴───────────────┴───────────────────┴─────────┐  │
│  │              Firebase Admin SDK (Server)           │  │
│  │         Auth · Firestore · Functions (se needed)   │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────┼───────────────────────────┐  │
│  │  Client Services      │  External APIs            │  │
│  │  Zustand Stores       │  Yahoo Finance (proxy)    │  │
│  │  TanStack Query       │  Brapi (dividendos)       │  │
│  │  React Query Cache    │  BCB/IPCA (inflação)      │  │
│  │  Recharts/Chart.js   │  Asaas (pagamentos)        │  │
│  └───────────────────────┴───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 Convenções do Roadmap

Cada fase segue o template abaixo:

| Campo | Descrição |
|---|---|
| **Objetivo** | O que esta fase entrega para o usuário final |
| **Tasks** | Checklist de implementação técnica |
| **Dependências** | Fases ou pré-requisitos necessários |
| **Deliverables** | Artefatos concretos produzidos |
| **Critérios de Aceitação** | Condições de "done" verificáveis |
| **Riscos** | Pontos de atenção e estratégias de mitigação |
| **Estimativa** | Dias úteis |

---

## Phase 0 — Setup e Fundação

> **Estimativa:** 1–2 dias · **Dependências:** Nenhuma

### Objetivo
Preparar o ambiente de desenvolvimento com todas as integrações de infraestrutura configuradas e testadas, garantindo base sólida para as fases seguintes.

### Tasks

- [ ] Criar projeto Firebase no console (Auth + Firestore)
- [ ] Habilitar provedores: Email/Password, Google Sign-In
- [ ] Configurar regras de segurança do Firestore (iniciais — modo development)
- [ ] Gerar service account key e configurar `firebase-admin` no servidor
- [ ] Criar arquivo `.env.local` com variáveis:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  FIREBASE_CLIENT_EMAIL=
  FIREBASE_PRIVATE_KEY=
  ASAAS_API_KEY=
  ASAAS_SANDBOX=true
  ASAAS_WEBHOOK_SECRET=
  ```
- [ ] Instalar dependências:
  ```bash
  npm i firebase firebase-admin zustand @tanstack/react-query next-themes
  npm i recharts date-fns js-brasil @maskito/react @maskito/kit
  npm i -D @types/node
  ```
- [ ] Configurar Firebase Emulator Suite (`firebase.json` + `.firebaserc`)
- [ ] Criar estrutura de pastas:
  ```
  src/
  ├── app/(auth)/           # Rotas de autenticação
  ├── app/(app)/            # Rotas autenticadas
  ├── app/api/              # API Routes
  ├── components/
  │   ├── ui/               # shadcn/ui components
  │   ├── layout/           # Sidebar, Header, Shell
  │   ├── modules/          # Componentes por módulo
  │   └── shared/           # Componentes reutilizáveis
  ├── lib/
  │   ├── firebase/         # Client + Admin config
  │   ├── market/           # Yahoo, Brapi, BCB clients
  │   ├── asaas/            # Asaas API client
  │   └── utils/            # Helpers, formatters, masks
  ├── stores/               # Zustand slices
  ├── hooks/                # Custom hooks
  ├── types/                # TypeScript interfaces
  └── constants/            # Categorias, cores, configurações
  ```
- [ ] Configurar design tokens no `tailwind.config.ts` espelhando as CSS variables do sistema atual:
  - Paleta premium dark (`#0f0f1a`, `#1a1a2e`, `#16213e`, `#0f3460`)
  - Cores de destaque (`#e94560` para alertas, `#00d2ff` para info, `#4ecca3` para positivo)
  - Tipografia: Inter (sans) + JetBrains Mono (números financeiros)
  - Espaçamento e bordas compatíveis com layout atual
- [ ] Configurar path aliases no `tsconfig.json` (`@/`, `@/components/`, etc.)
- [ ] Criar script `scripts/seed-firebase.ts` para popular dados de teste
- [ ] Validar conexão Firebase (criar/ler documento de teste)

### Dependências

- Projeto Next.js 16 inicializado ✓
- Node.js 20+ e npm 10+

### Deliverables

- [x] Projeto rodando em `localhost:3000`
- [x] Firebase Emulator funcional (Auth + Firestore)
- [x] `.env.local` configurado (template `.env.example` commitado)
- [x] Design tokens ativos e visíveis na página base
- [x] Estrutura de pastas criada e documentada

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | `npm run dev` inicia sem erros | Comando executa com sucesso |
| 2 | Firebase Emulator UI acessível | `localhost:4000` mostra Auth + Firestore |
| 3 | Leitura/escrita Firestore funcional | Script de teste grava e lê documento |
| 4 | Design tokens aplicados | Cores e fontes renderizam conforme especificação |
| 5 | `.env.example` commitado | Arquivo existe com todas as chaves documentadas |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Firestore rules bloqueiam escrita durante dev | Alto | Usar emulator com `rules_version = '2'` e `allow read, write: if true` para dev |
| Firebase Admin SDK incompatível com Edge Runtime | Médio | Garantir que rotas com Admin SDK usem Node.js runtime (`runtime: 'nodejs'`) |
| Chaves de ambiente expostas no client bundle | Alto | Prefixar com `NEXT_PUBLIC_` apenas o necessário; service account nunca no client |

---

## Phase 1 — Shell da Aplicação + Autenticação

> **Estimativa:** 3–4 dias · **Dependências:** Phase 0

### Objetivo
Entregar o esqueleto visual da aplicação (layout premium dark com sidebar responsiva) e o sistema completo de autenticação com transição fluida entre estado guest e autenticado.

### Tasks

**Layout & Navegação:**
- [ ] Implementar `AppShell` component: sidebar fixa (esquerda, 260px desktop) + main content area
- [ ] Sidebar: logo Appliquei, navegação com ícones (Lucide), badges, seção inferior (user info)
- [ ] Breakpoints responsivos: sidebar colapsa para bottom nav em mobile (`< 768px`)
- [ ] Sistema de abas SPA: renderização condicional de módulos dentro de `page.tsx`
- [ ] Estado de navegação ativa com highlight
- [ ] Transições de página (fade-in/slide-in)
- [ ] Header: search bar (placeholder), notifications bell (placeholder), avatar dropdown
- [ ] Loading skeleton para transições

**Dark Mode:**
- [ ] Integrar `next-themes` com `attribute="class"` e `defaultTheme="dark"`
- [ ] Toggle no header (Sun/Moon icon) com animação de transição
- [ ] Light theme consistente (ler variáveis do sistema atual para referência)

**Valores Ocultos:**
- [ ] Toggle global "Ocultar Valores" (eye/eye-off icon no header)
- [ ] Aplicar blur + `user-select: none` em todos os valores monetários quando ativo
- [ ] Persistir preferência em `localStorage` + Firestore user preferences
- [ ] Badge visual indicando estado

**Autenticação — Frontend:**
- [ ] Página `/login`: campos email + senha, link "Esqueceu a senha?", botão Google
- [ ] Página `/register`: campos nome + email + senha + confirmação, checkbox termos
- [ ] Página `/forgot-password`: campo email + fluxo de reset
- [ ] Loading states nos botões de autenticação
- [ ] Mensagens de erro contextualizadas (toast notifications)
- [ ] Redirect pós-login para dashboard

**Autenticação — Backend:**
- [ ] API route `POST /api/auth/register`:
  - Validar campos (Zod schema)
  - Criar usuário Firebase Auth
  - Criar documento Firestore `users/{uid}` com perfil e preferências padrão
  - Retornar ID token + dados do usuário
- [ ] API route `POST /api/auth/login`:
  - Verificar credenciais via Firebase Admin
  - Criar session cookie (14 dias)
  - Retornar dados do usuário + preferences
- [ ] API route `GET /api/auth/session`:
  - Verificar session cookie
  - Retornar usuário atual ou `null`
- [ ] API route `POST /api/auth/logout`:
  - Revogar session cookie
  - Limpar estado local
- [ ] API route `POST /api/auth/reset-password`:
  - Gerar link de reset via Firebase Admin
  - Enviar email automático (Firebase default)

**Autenticação — Google Sign-In:**
- [ ] Integrar `signInWithPopup` do Firebase Client SDK
- [ ] API route `POST /api/auth/google-callback`:
  - Verificar ID token do Google
  - Criar/atualizar documento Firestore
  - Criar session cookie

**Middleware:**
- [ ] `middleware.ts`: verificar session cookie em rotas `/app/*`
- [ ] Redirecionar para `/login` se não autenticado
- [ ] Redirecionar para `/app` se autenticado acessando `/login`
- [ ] White-list de rotas públicas: `/`, `/login`, `/register`, `/pricing`, `/faq`

**Estado Global:**
- [ ] Zustand store `authSlice`:
  ```typescript
  interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    preferences: UserPreferences
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => Promise<void>
    updatePreferences: (prefs: Partial<UserPreferences>) => void
  }
  ```
- [ ] Provider wrapper para hydration-safe Zustand
- [ ] Persistir preferências no Firestore com debounce

**Estado Guest:**
- [ ] Permitir navegação pelo app sem login (modo exploratório)
- [ ] Dados em `localStorage` para guest
- [ ] Banner/CTA "Crie sua conta para salvar dados" no topo
- [ ] Migração automática de dados localStorage → Firestore no primeiro login

### Dependências

- Phase 0 completa (Firebase configurado, estrutura de pastas)

### Deliverables

- [x] App shell funcional com sidebar, header, main content
- [x] Dark/Light mode com toggle
- [x] Toggle "Ocultar Valores" aplicado globalmente
- [x] Login com Email/Password funcional (E2E)
- [x] Login com Google funcional (E2E)
- [x] Registro de nova conta funcional (E2E)
- [x] Proteção de rotas via middleware
- [x] Estado guest com dados em localStorage
- [x] Zustand authSlice persistindo estado

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Sidebar renderiza em desktop e mobile | Testar em 1440px e 375px |
| 2 | Login com email/senha funciona E2E | Criar conta, fazer logout, logar novamente |
| 3 | Google Sign-In funciona | Popup abre, conta criada, redireciona |
| 4 | Middleware protege rotas | Acessar `/app` sem login → redirect `/login` |
| 5 | Modo guest permite navegação | Acessar módulos sem login, dados em localStorage |
| 6 | Dark mode persiste | Trocar tema, recarregar página, tema mantido |
| 7 | Valores ocultos com blur | Toggle aplica blur em todos os valores monetários |
| 8 | Migração guest → autenticado | Dados localStorage sobrevivem ao primeiro login |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Firebase popup bloqueado por adblocker | Médio | Fallback para redirect flow (`signInWithRedirect`) |
| Hydration mismatch com Zustand + SSR | Alto | Usar `useEffect` para hidratar store; provider pattern |
| Session cookie expiração e refresh | Médio | Implementar refresh token rotation no middleware |
| Migração localStorage → Firestore com dados conflitantes | Médio | Estratégia merge: Firestore wins, localStorage como fallback |

---

## Phase 2 — Módulo Patrimônio — Carteira + Operações

> **Estimativa:** 4–5 dias · **Dependências:** Phase 1

### Objetivo
Implementar o módulo central de gestão patrimonial com CRUD completo de operações de compra/venda, carteira com cálculos de preço médio e P&L, e navegação por categorias de ativos.

### Tasks

**API Proxy de Cotações:**
- [ ] `GET /api/market/quotes?symbols=PETR4.SA,VALE3.SA,...`:
  - Proxy para Yahoo Finance v8 API
  - Cache de 5 minutos (in-memory + Firestore cache collection)
  - Fallback para Brapi em caso de falha
  - Rate limiting: max 10 requests/minuto por usuário
  - Retornar: preço, variação dia, variação mês, volume
- [ ] `GET /api/market/search?q=PETR`:
  - Busca de ativos por ticker/nome
  - Cache de 1 hora

**Drawer de Operação (Compra/Venda):**
- [ ] Componente `OperationDrawer` (slide-in da direita):
  - Tipo: Compra / Venda (toggle)
  - Campo ticker com autocompletar (debounce 300ms, min 2 chars)
  - Campo quantidade (máscara numérica `###.##0`)
  - Campo preço unitário (máscara BRL `R$ 0,00`) com auto-preenchimento da cotação
  - Campo data (date picker, default: hoje)
  - Campo corretagem (máscara BRL, default: R$ 0,00)
  - Campo categoria (select): RV → subcategorias (Ações, FIIs, BDRs, ETFs, Cripto) / RF / Previdência / Reserva
  - Resumo: total da operação = (qtd × preço) + corretagem
  - Validação: venda não pode exceder posição atual
  - Botão confirmar com estado de loading
- [ ] Toast de confirmação: "Operação registrada com sucesso"

**Carteira — Rich Rows:**
- [ ] Firestore collection `portfolios/{uid}/operations`:
  ```typescript
  interface Operation {
    id: string
    ticker: string
    type: 'buy' | 'sell'
    quantity: number
    price: number
    fees: number
    date: Timestamp
    category: Category
    subCategory?: SubCategory
    createdAt: Timestamp
  }
  ```
- [ ] Componente `PortfolioTable`:
  - Colunas: Ticker, Categoria, Qtd, Preço Médio, Cotação, Dia%, Mês%, Total, Lucro/Prejuízo (R$), Lucro/Prejuízo (%)
  - Cores: verde positivo, vermelho negativo
  - Badge "Preços estimados" quando cotação não atualizada há > 1 dia
  - Expand row para ver detalhes (operações do ativo)
  - Sort por qualquer coluna
  - Filtro por categoria (tabs: Todos, RV, RF, Previdência, Reserva)
  - Busca por ticker
  - Cálculo preço médio ponderado
  - Cálculo saldo (quantidade líquida)

**Categorias e Sub-categorias:**
- [ ] Definir constantes com cores e ícones:
  - RV: `#4ecca3` (ações, FIIs, BDRs, ETFs, Cripto)
  - RF: `#3498db` (CDB, LCI, LCA, Tesouro, CRI, CRA, Debêntures)
  - Previdência: `#e67e22`
  - Reserva: `#95a5a6` (Emergency Fund, FGTS, Cash)

**Timeline de Operações:**
- [ ] Componente `OperationsTimeline`:
  - Lista cronológica inversa de todas as operações
  - Cards com: data, ticker, tipo (badge), quantidade, preço, total
  - Filtros: período, categoria, tipo (compra/venda), ticker
  - Paginação/infinite scroll (20 itens por load)

**Exportação CSV:**
- [ ] Botão "Exportar CSV" na carteira
- [ ] Gerar CSV com colunas: Ticker, Categoria, Qtd, Preço Médio, Cotação, Total, Lucro R$, Lucro %
- [ ] Download via `Blob` + `URL.createObjectURL`

**Posição por Categoria (Cards):**
- [ ] Cards resumo no topo: Total RV, Total RF, Total Previdência, Total Reserva
- [ ] Cada card: valor total, % do patrimônio, ícone, cor da categoria

### Dependências

- Phase 1 completa (auth, app shell, Zustand base)
- Yahoo Finance API acessível
- Brapi API key configurada

### Deliverables

- [x] API proxy de cotações funcional e com cache
- [x] CRUD completo de operações (Firestore)
- [x] Carteira renderizada com cálculos corretos
- [x] Timeline de operações com filtros
- [x] Exportação CSV funcional
- [x] Cards de posição por categoria

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Criar operação de compra | Ticker, qtd, preço → Firestore, carteira atualizada |
| 2 | Criar operação de venda | Saldo reduzido, preço médio recalculado |
| 3 | Validação de venda acima do saldo | Error message exibida, operação bloqueada |
| 4 | Cotações carregam automaticamente | Spinner → preço preenchido ao buscar ticker |
| 5 | Filtro por categoria funciona | Tabs filtram tabela corretamente |
| 6 | Exportar CSV | Download de arquivo com dados corretos |
| 7 | Cálculos conferem com planilha original | Comparar preço médio, P&L com sistema antigo |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Yahoo Finance API bloqueia requests do servidor | Alto | Implementar proxy com user-agent rotation; fallback Brapi |
| Cálculos de preço médio com casas decimais de cripto | Médio | Usar `decimal.js` para precisão arbitrária em cálculos financeiros |
| Firestore write limit (1 ops/s/doc) | Baixo | Batch writes para operações em lote |
| Sincronização offline → conflitos | Médio | Timestamp-based conflict resolution; last-write-wins com UI de alerta |

---

## Phase 3 — Módulo Patrimônio — Gráficos e Evolução

> **Estimativa:** 3–4 dias · **Dependências:** Phase 2

### Objetivo
Criar o dashboard patrimonial visual com gráficos de evolução, KPIs em tempo real e distribuição por categoria, incluindo sistema de snapshots mensais para histórico.

### Tasks

**KPIs Patrimoniais:**
- [ ] Cards no topo do dashboard:
  - Patrimônio Atual (valor total carteira)
  - Total Investido (somatório de compras − vendas)
  - Rendimento Total (patrimônio − investido)
  - Rendimento % (rendimento / investido × 100)
  - Dividendos Recebidos (período selecionado)
  - Cada KPI com indicador de tendência (↑↓ percentual vs período anterior)

**Gráfico de Evolução Patrimonial:**
- [ ] Componente `EvolutionChart` (Recharts — Area Chart):
  - Eixo X: datas (diário ou mensal conforme zoom)
  - Eixo Y: valor patrimonial
  - Área preenchida com gradiente (cor primary)
  - Tooltip customizado com: data, patrimônio, variação
  - Zoom: botões 1M, 3M, 6M, 12M, Tudo
  - Responsivo (redimensionar sem perda de qualidade)
  - Pontos de marcação: aportes, vendas significativas

**Gráfico Donut — Distribuição:**
- [ ] Componente `DistributionDonut` (Recharts — Pie Chart):
  - Segmentos por categoria (RV, RF, Previdência, Reserva)
  - Labels: nome, valor (R$), percentual
  - Center label: valor total patrimonial
  - Cores das categorias (padrão definido Phase 2)
  - Hover: segmento expande 5%
  - Legenda à direita em desktop, abaixo em mobile

**Card "Próximo Evento":**
- [ ] Widget exibindo o próximo dividendo ou evento corporativo:
  - Ticker, tipo de evento, data, valor estimado
  - Fonte: dados de dividendos (Brapi) + calendário corporativo
  - Countdown: "em X dias"

**Snapshots Mensais:**
- [ ] Firestore collection `portfolios/{uid}/snapshots`:
  ```typescript
  interface Snapshot {
    id: string
    date: Timestamp        // Primeiro dia do mês
    totalValue: number
    invested: number
    dividends: number
    categories: Record<Category, number>
    createdAt: Timestamp
  }
  ```
- [ ] Cron job (Vercel Cron): `GET /api/cron/monthly-snapshot` (dia 1 de cada mês às 00:00 UTC)
- [ ] Snapshot manual: botão "Registrar Hoje" no dashboard
- [ ] Seed de snapshots históricos (migrar dados do localStorage)

**Badge "Preços Estimados":**
- [ ] Lógica: se última atualização de cotação > 24h, exibir badge amarelo
- [ ] Indicar quais ativos têm preços desatualizados
- [ ] Botão "Atualizar Cotações" (batch refresh)

**Tooltips Customizados:**
- [ ] Tooltips consistentes em todos os gráficos:
  - Fundo dark premium (`#1a1a2e`)
  - Borda sutil (`#2a2a4e`)
  - Valores formatados em BRL
  - Fonte JetBrains Mono para números

### Dependências

- Phase 2 completa (operações, carteira, categorias)
- Recharts instalado e configurado

### Deliverables

- [x] Dashboard patrimonial com 4+ KPIs
- [x] Gráfico de evolução com filtros de período
- [x] Gráfico donut de distribuição por categoria
- [x] Card "Próximo Evento"
- [x] Sistema de snapshots mensais
- [x] Badge de preços desatualizados

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | KPIs refletem dados reais da carteira | Criar operações, verificar valores atualizam |
| 2 | Gráfico evolução renderiza com dados | Ao menos 2 pontos de dados visíveis |
| 3 | Zoom 1M/12M/Tudo funciona | Período correto exibido |
| 4 | Donut mostra distribuição correta | Categorias com cores e valores certos |
| 5 | Snapshot mensal persiste | Criar snapshot, consultar Firestore, dados presentes |
| 6 | Badge preços estimados aparece | Simular cotação antiga, badge visível |
| 7 | Gráficos responsivos | Testar em 1440px, 768px, 375px |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Vercel Hobby não suporta cron jobs nativos | Médio | Usar `vercel.json` cron ou trigger manual; verificar limitações |
| Recharts bundle size > 100KB | Baixo | Code splitting; lazy load gráficos com `React.lazy` |
| Snapshots com dados inconsistentes | Médio | Validar snapshot vs soma de operações; alertar discrepancies |

---

## Phase 4 — Módulo Controle Financeiro

> **Estimativa:** 4–5 dias · **Dependências:** Phase 1

> **Nota:** Esta fase roda em paralelo com Phase 2/3 no que diz respeito ao módulo financeiro. Depende apenas de Phase 1 (auth + shell).

### Objetivo
Implementar o controle financeiro mensal completo com DRE simplificado, gestão de cartões de crédito, recorrências e alertas de vencimento.

### Tasks

**API Routes — Transações:**
- [ ] `POST /api/transactions` — criar lançamento
- [ ] `GET /api/transactions?month=2025-07` — listar por mês
- [ ] `PUT /api/transactions/:id` — editar
- [ ] `DELETE /api/transactions/:id` — remover (soft delete)
- [ ] `GET /api/transactions/summary?month=2025-07` — KPIs do mês

**Navegação Mensal:**
- [ ] Componente `MonthNavigator`:
  - Display: "Julho 2025" (formatado em pt-BR via `date-fns`)
  - Botões ◀ ▶ para mês anterior/próximo
  - Botão "Hoje" para voltar ao mês corrente
  - Persistir mês selecionado no Zustand

**KPIs do Mês:**
- [ ] Cards no topo:
  - Saldo Livre (receitas − despesas − cartão − investimentos)
  - Receitas do Mês (R$)
  - Despesas do Mês (R$)
  - Cartão de Crédito (fatura atual, R$)
  - Investimentos (aportes do mês, R$)
  - Cada KPI: valor absoluto + badge tendência vs mês anterior

**Termômetro dos 60%:**
- [ ] Componente `Thermometer60`:
  - Barra de progresso visual (0% → 100%)
  - Meta: investir ≥ 60% do saldo livre
  - Preenchimento dinâmico: verde (≥60%), amarelo (40-59%), vermelho (<40%)
  - Label: "Você investiu X% do seu saldo livre"
  - Alerta contextual: mensagem motivacional/frustração baseada no percentual

**Gráfico Pizza — Composição:**
- [ ] Componente `CompositionPie`:
  - Segmentos: Essenciais, Estilo de Vida, Cartão, Investimentos, Sobras
  - Labels com valores absolutos e percentuais

**Extrato Unificado:**
- [ ] Componente `Statement`:
  - Tabs de filtro: Todos, Entradas, Saídas, Cartão, Investimentos
  - Lista de lançamentos com: data, descrição, categoria, valor (colorido)
  - Agrupamento por semana/semana
  - Pull-to-refresh no mobile
  - Infinite scroll ou "Carregar Mais"
  - Swipe-to-delete (mobile)

**Formulário de Lançamento:**
- [ ] Componente `TransactionModal`:
  - Tipo: Entrada / Saída / Cartão / Investimento
  - Descrição (text input)
  - Valor (máscara BRL)
  - Categoria (select com ícones):
    - Receitas: Salário, Freelance, Dividendos, Outros
    - Despesas: Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Outros
  - Data (date picker, default: hoje)
  - Conta fixa? (checkbox → recorrente)
  - Número de parcelas (se cartão)
  - Botão salvar com validação

**Cartões de Crédito:**
- [ ] CRUD de cartões: nome, bandeira (ícone), limite, dia de fechamento, dia de vencimento
- [ ] Componente `CreditCardManager`:
  - Cards visuais estilo cartão de crédito
  - Fatura atual: total, limite disponível, % utilizado (barra)
  - Lista de compras no cartão no mês
- [ ] Firestore collection `users/{uid}/creditCards`

**Faturas Parceladas e Fixas:**
- [ ] Suporte a parcelas: lançamento com `installments: 12` gera 12 transações mensais
- [ ] Lançamentos fixos: marcar como recorrente → clonar automaticamente no mês seguinte
- [ ] Cron job ou trigger ao navegar para novo mês: gerar lançamentos recorrentes

**Grupo de Faturas + Baixa:**
- [ ] Agrupar faturas parceladas sob um "grupo"
- [ ] Badge "X de Y parcelas pagas"
- [ ] Ação "Dar baixa" em parcela individual

**Saldo Mês Anterior (Carry-Forward):**
- [ ] Ao criar transação no mês, consultar saldo acumulado do mês anterior
- [ ] Exibir "Saldo acumulado: R$ X.XXX" abaixo dos KPIs
- [ ] Cálculo: soma receitas − soma despesas de todos os meses anteriores

**Alertas de Vencimento:**
- [ ] Contas vencidas (data < hoje, status = pendente): badge vermelho
- [ ] Vencendo hoje: badge amarelo
- [ ] Vencendo em 3 dias: badge laranja
- [ ] Toast notification ao acessar módulo se houver vencidos

**Vencimentos (Grid de Cards):**
- [ ] Componente `DueDates`:
  - Grid de cards com próximos vencimentos (próximos 30 dias)
  - Cada card: descrição, valor, data, status, ação "Pagar"
  - Ordenação por data

**Modal de Configuração:**
- [ ] Componente `FinancialConfigModal`:
  - Meta de investimento mensal (R$)
  - Cartões de crédito (CRUD inline)
  - Categorias personalizáveis
  - Alerta de meta: notificação ao atingir X% da meta

### Dependências

- Phase 1 completa (auth, shell, Zustand)
- Nenhuma dependência de Phase 2/3

### Deliverables

- [x] CRUD de transações funcional
- [x] Navegação mensal com persistência
- [x] KPIs calculados corretamente
- [x] Termômetro dos 60% com alertas contextuais
- [x] Extrato unificado com filtros
- [x] Gestão de cartões de crédito
- [x] Faturas parceladas e recorrentes
- [x] Sistema de alertas de vencimento
- [x] Modal de configuração financeira

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Criar lançamento de entrada | Transação aparece no extrato, KPI atualizado |
| 2 | Criar lançamento de saída | Saldo reduz, extrato atualizado |
| 3 | Termômetro calcula % correto | Investir 60% → barra verde |
| 4 | Navegação entre meses funciona | Trocar mês, extrato/KPIs atualizam |
| 5 | Cartão de crédito: adicionar compra | Fatura atualizada, KPI cartão atualizado |
| 6 | Fatura parcelada gera N transações | 12x → 12 registros mensais |
| 7 | Alerta de vencido aparece | Lançamento com data passada → badge vermelho |
| 8 | Saldo acumulado (carry-forward) | Mês 2 inclui saldo do mês 1 |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Recorrências geram duplicatas | Alto | Idempotência: verificar se já existe lançamento para o período antes de clonar |
| Cálculos de carry-forward lentos com muitos meses | Médio | Aggregação Firestore (server-side); cache no client |
| Fuso horário em transações | Médio | Armazenar sempre UTC; converter para America/Sao_Paulo na exibição |

---

## Phase 5 — Módulo Dividendos

> **Estimativa:** 2–3 dias · **Dependências:** Phase 2

### Objetivo
Implementar o dashboard completo de dividendos com dados reais de proventos via Brapi e Yahoo Finance, incluindo YOC (Yield on Cost), ranking de ativos e calendário de pagamentos.

### Tasks

**API Proxy de Dividendos:**
- [ ] `GET /api/market/dividends?ticker=PETR4.SA`:
  - Fonte primária: Brapi `/quote/${ticker}` → `dividends`
  - Fonte fallback: Yahoo Finance historical dividends
  - Cache inteligente: 24h para dados históricos, 1h para estimativas
  - Retornar: data, valor, tipo (dividendo, JCP, rendimento), status (pago/estimado)

**Dashboard de Dividendos:**
- [ ] Componente `DividendDashboard`:
  - KPIs: Total Recebido (12M), Média Mensal, Projeção 12M, Yield Médio da Carteira
  - Gráfico de barras: dividendos por mês (últimos 12 meses)
  - Ranking: top 5 ativos por dividendos recebidos
  - Tendência: ↑↓ vs ano anterior

**Tabela por Ativo com YOC:**
- [ ] Componente `DividendByAssetTable`:
  - Colunas: Ticker, Qtd, Preço Médio, Dividendos 12M, YOC%, DY Atual, Último Pagamento
  - YOC = (dividendos 12M / custo total do ativo) × 100
  - DY Atual = (último dividendo anualizado / cotação) × 100
  - Sort por qualquer coluna, default: YOC descendente
  - Badge: "Posição encerrada" para ativos com saldo = 0

**Tabela de Pagamentos Recentes:**
- [ ] Componente `RecentPayments`:
  - Lista dos últimos 20 pagamentos
  - Colunas: Data, Ticker, Tipo, Valor (R$), Status
  - Filtro por status: Todos, Pagos, Estimados
  - Indicador visual: ✅ pago, 🕐 estimado

**Modal de Dividendos Previstos do Mês:**
- [ ] Componente `ExpectedDividendsModal`:
  - Lista de dividendos estimados para o mês corrente
  - Fonte: calendário de pagamentos (Brapi)
  - Cada item: ticker, data prevista, valor estimado, confiança (alta/média/baixa)
  - Total estimado do mês

**Cache Inteligente:**
- [ ] Estratégia de cache multi-camada:
  - L1: Zustand (session, instantâneo)
  - L2: `localStorage` (24h, sobrevive refresh)
  - L3: Firestore cache collection (24h, persistente)
  - L4: API externa (cache-control headers)

**Checkbox "Posições Encerradas":**
- [ ] Toggle para incluir/excluir ativos com saldo zero nas tabelas
- [ ] Persistir preferência em localStorage

### Dependências

- Phase 2 completa (carteira com operações)
- Brapi API key configurada

### Deliverables

- [x] API proxy de dividendos funcional
- [x] Dashboard com KPIs e gráfico de barras
- [x] Tabela por ativo com YOC calculado
- [x] Tabela de pagamentos recentes
- [x] Modal de dividendos previstos
- [x] Cache inteligente multi-camada

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | KPIs refletem dividendos reais | Comparar com dados Brapi para portfólio de teste |
| 2 | Gráfico de barras mostra 12 meses | Todos os meses visíveis com valores |
| 3 | YOC calculado corretamente | Manual: (dividendos 12M / custo) × 100 = valor exibido |
| 4 | Filtro posições encerradas funciona | Toggle remove/exibe ativos sem saldo |
| 5 | Cache funciona | Primeira request → API; segunda → cache; após 24h → refresh |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Brapi rate limit (100 req/dia free) | Alto | Cache agressivo (24h); fallback Yahoo Finance; uso condicional |
| Divergência entre fontes de dividendos | Médio | Padronizar fonte primária (Brapi); log divergências para audit |
| Dividendos em cripto não disponíveis | Baixo | Campo manual para ativos sem API; label "Informado manualmente" |

---

## Phase 6 — Módulo Simulador

> **Estimativa:** 2–3 dias · **Dependências:** Phase 1

### Objetivo
Recriar o simulador de independência financeira com dados reais de inflação (BCB IPCA), cálculos de investindo vs INSS, ponto de inflexão e gráficos comparativos.

### Tasks

**API Proxy de Inflação:**
- [ ] `GET /api/market/inflation?start=2010&end=2025`:
  - Fonte: BCB API (Série 433 — IPCA mensal)
  - Endpoint: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json`
  - Cache: 30 dias (IPCA histórico não muda)
  - Retornar: ano, IPCA acumulado anual

**Parâmetros do Simulador:**
- [ ] Componente `SimulatorForm`:
  - Idade atual (input number)
  - Idade desejada para independência (input number)
  - Patrimônio atual (input BRL)
  - Aporte mensal (input BRL)
  - Rendimento real esperado (% a.a.) — default: 6%
  - Rendimento INSS (salário benefício, input BRL)
  - Inflação: busca automática via API + opção manual
  - Gastos mensais desejados (input BRL)
  - Botão "Simular"

**Cálculos:**
- [ ] Motor de simulação `lib/simulator/calculate.ts`:
  - Cenário "Investindo": patrimônio cresce com aportes + rendimento real
  - Cenário "Apenas INSS": patrimônio = soma salários INSS (sem rendimento)
  - Ponto de inflexão: mês em que patrimônio investido > patrimônio INSS
  - Renda passiva: patrimônio × rendimento / 12
  - Mês de independência: mês em que renda passiva ≥ gastos mensais

**Gráfico Comparativo:**
- [ ] `SimulatorComparisonChart` (Line Chart — Recharts):
  - Duas linhas: Investindo (verde) vs INSS (cinza)
  - Eixo X: idade (anos)
  - Eixo Y: patrimônio (R$)
  - Ponto de inflexão marcado com marcador especial
  - Tooltip com detalhes

**Gráficos Pizza:**
- [ ] `SimulatorPatrimonyPie`: composição do patrimônio no ano da independência (aportes vs rendimentos)
- [ ] `SimulatorINSSPie`: composição INSS (anos contribuídos × salário)

**Tabela Expansível Mensal:**
- [ ] Componente `MonthlyProjectionTable`:
  - Expandir para ver detalhe mês a mês
  - Colunas: Idade, Patrimônio Investido, Patrimônio INSS, Diferença, Renda Passiva
  - Highlight na linha da independência
  - Max 600 linhas (50 anos)

**Hero Card:**
- [ ] Card destaque com:
  - "Diferença: R$ XXX.XXX" (investindo − INSS no ano da independência)
  - "Renda passiva estimada: R$ X.XXX/mês"
  - Idade da independência em cada cenário
  - Badge: "Investir é X vezes melhor"

### Dependências

- Phase 1 completa (shell, formatação BRL)
- BCB API acessível (pública, sem key)

### Deliverables

- [x] API proxy de inflação funcional
- [x] Formulário do simulador completo
- [x] Motor de cálculo com cenários
- [x] Gráfico comparativo investindo vs INSS
- [x] Gráficos pizza de composição
- [x] Tabela mensal expansível
- [x] Hero card com resultado principal

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Inflação carrega do BCB | API retorna IPCA acumulado por ano |
| 2 | Cálculos conferem com planilha original | Mesmos inputs → mesmos outputs |
| 3 | Ponto de inflexão exibido no gráfico | Marcador visual na interseção das curvas |
| 4 | Tabela mensal correta | Linha da independência highlightada |
| 5 | Hero card mostra valores corretos | Diferença e renda passiva calculados |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| BCB API fora do ar | Médio | Cache de 30 dias; dados hardcoded como último fallback |
| Cálculos de juros compostos com precisão | Médio | Usar `decimal.js`; testar com cases conhecidos |

---

## Phase 7 — Módulo Sonhos / Dream Planner

> **Estimativa:** 4–5 dias · **Dependências:** Phase 2 + Phase 4

### Objetivo
Implementar o sistema completo de planejamento de objetivos financeiros com gamificação, progress rings SVG, saúde financeira e migração de investimentos.

### Tasks

**CRUD de Sonhos:**
- [ ] Firestore collection `users/{uid}/dreams`:
  ```typescript
  interface Dream {
    id: string
    title: string
    description: string
    targetAmount: number        // Valor alvo
    currentAmount: number       // Valor acumulado
    category: DreamCategory     // Viagem, Carro, Casa, Emergência, Aposentadoria, Outros
    status: 'active' | 'scheduled' | 'achieved' | 'expired'
    deadline?: Timestamp        // Prazo
    monthlyContribution: number // Aporte mensal planejado
    createdAt: Timestamp
    updatedAt: Timestamp
  }
  ```
- [ ] Componente `DreamFormModal`:
  - Título, descrição, valor alvo (máscara BRL)
  - Categoria com ícone e cor
  - Prazo (date picker)
  - Aporte mensal planejado
  - Validação: valor alvo > 0, prazo futuro

**Categorias com Cores e Ícones:**
- [ ] Constantes:
  - ✈️ Viagem: `#3498db`
  - 🚗 Carro: `#e74c3c`
  - 🏠 Casa: `#2ecc71`
  - 🛡️ Emergência: `#f39c12`
  - 🏖️ Aposentadoria: `#9b59b6`
  - ⭐ Outros: `#1abc9c`

**Visão Geral:**
- [ ] Componente `DreamOverview`:
  - KPIs: Total alvo, Total acumulado, Progresso geral (%), Nº sonhos ativos
  - Card "Progresso Geral" com barra de progresso

**Cards "Tempo para Conquistar":**
- [ ] Cálculo: `(alvo − acumulado) / aporte mensal` = meses restantes
- [ ] Card por sonho:
  - Título, categoria (ícone + cor), progresso (%), tempo restante
  - Urgência: 🔴 atrasado, 🟡 < 3 meses, 🟢 no prazo
  - Badge: "Conquistado!" quando 100%

**Sonho Card Expandido:**
- [ ] Componente `DreamCardExpanded`:
  - Progress Ring SVG animado (circunferência proporcional ao %)
  - Steps/milestones configuráveis pelo usuário
  - Stats: aportes totais, meses restantes, valor mensal necessário
  - Histórico de aportes

**Timeline de Aportes:**
- [ ] Firestore collection `users/{uid}/dreams/{dreamId}/contributions`:
  ```typescript
  interface Contribution {
    id: string
    amount: number
    type: 'cash' | 'asset_migration'
    sourceAssetId?: string     // Se migração de ativo
    sourceTicker?: string
    date: Timestamp
    note?: string
  }
  ```
- [ ] Lista de aportes com tipo, valor, data, nota
- [ ] Tipos: Saldo Livre (dinheiro) / Migração de Ativo

**Aporte com Escolha de Origem:**
- [ ] Componente `ContributionModal`:
  - Valor (máscara BRL)
  - Origem: "Saldo Livre" / "Migrar de Ativo"
  - Se migração: select de ativos da carteira (Phase 2)
  - Confirmação: "Isso reduzirá sua posição em PETR4 em X ações"
  - Ao confirmar: cria aporte + reduz posição na carteira (transação atômica)

**Migração de Investimento:**
- [ ] Ao escolher "Migrar de Ativo":
  - Listar ativos com saldo > 0
  - Mostrar: ticker, saldo atual, valor total
  - Input: quantidade ou valor a migrar
  - Preview: posição resultante após migração
  - Firestore batch: criar aporte + registrar venda parcial no portfolio

**Painel de Saúde Financeira:**
- [ ] Componente `FinancialHealthPanel`:
  - Score 0–100 baseado em: reserva de emergência (% meta), dívidas, diversificação, disciplina (consistência de aportes)
  - Gauge visual (semicírculo, gradiente vermelho→amarelo→verde)
  - Plano sugerido baseado no score:
    - 0–30: "Priorize emergência e corte gastos"
    - 31–60: "Equilibre dívidas e investimentos"
    - 61–80: "Otimize alocação e acelere sonhos"
    - 81–100: "Excelente! Foque em sonhos de longo prazo"

**Níveis de Esforço:**
- [ ] Badge baseado na disciplina de aportes:
  - 🥉 Iniciante: 1–3 aportes/mês
  - 🥈 Disciplinado: 4–6 aportes/mês
  - 🥇 Consistente: 7+ aportes/mês
  - 🏆 Mestre: aporte todos os meses há 6+ meses

**Status do Sonho:**
- [ ] Estados: ativo, agendado (data futura, sem aportes), conquistado (100%), vencido (prazo expirado, < 100%)
- [ ] Transições automáticas:
  - `currentAmount >= targetAmount` → conquistado
  - `deadline < now && currentAmount < targetAmount` → vencido

**Pular Mês:**
- [ ] Ação "Pular Mês": registra mês sem aporte, decrementa score de disciplina
- [ ] Toast: "Mês pulado. Seu score de disciplina diminuiu."

### Dependências

- Phase 2 completa (carteira com posições)
- Phase 4 completa (saldo livre disponível)

### Deliverables

- [x] CRUD de sonhos funcional
- [x] Visão geral com KPIs e progresso
- [x] Cards de sonhos com urgência
- [x] Sonho expandido com progress ring SVG
- [x] Timeline de aportes
- [x] Migração de investimento (transação atômica)
- [x] Painel de saúde financeira com score
- [x] Níveis de esforço (gamificação)

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Criar sonho | Aparece na visão geral com progresso 0% |
| 2 | Fazer aporte via saldo livre | Progresso atualiza, saldo livre reduz |
| 3 | Fazer aporte via migração | Posição do ativo reduz, progresso do sonho aumenta |
| 4 | Migração é transacional | Se falha na carteira, aporte não é criado |
| 5 | Progress ring SVG anima | Ao acessar, animação de 0% → % atual |
| 6 | Score de saúde calculado | Múltiplos fatores ponderados corretamente |
| 7 | Status muda automaticamente | Alcançar 100% → "Conquistado" |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Transação de migração falha parcialmente | Alto | Firestore batch write (all-or-nothing); retry com backoff |
| SVG progress ring cross-browser | Baixo | Usar `stroke-dasharray` + `stroke-dashoffset` (suporte universal) |
| Score de saúde com faltando dados | Médio | Score calcula apenas com dados disponíveis; badges "Dados insuficientes" |

---

## Phase 8 — Módulo Carteira Recomendada

> **Estimativa:** 2–3 dias · **Dependências:** Phase 2

### Objetivo
Implementar o questionário de perfil investidor com cálculo automático de alocação recomendada, gráficos comparativos e alertas de concentração.

### Tasks

**Questionário Perfil Investidor:**
- [ ] Componente `ProfileQuestionnaire` (multi-step form):
  - Step 1: Idade, renda mensal, patrimônio
  - Step 2: Experiência com investimentos (nenhuma/básica/intermediária/avançada)
  - Step 3: Reação a cenários de mercado (perda 10%, 30%, 50%)
  - Step 4: Prazo desejado (curto/médio/longo)
  - Step 5: Objetivo principal (preservar, crescer, maximizar)
  - Algoritmo de scoring: ponderar respostas → perfil final

**Cálculo de Perfil e Alocação:**
- [ ] Perfil resultante: Conservador / Moderado / Agressivo
- [ ] Alocação recomendada por perfil:
  - Conservador: 20% RV, 60% RF, 10% Previdência, 10% Reserva
  - Moderado: 50% RV, 30% RF, 10% Previdência, 10% Reserva
  - Agressivo: 70% RV, 15% RF, 10% Previdência, 5% Reserva

**Gráficos:**
- [ ] Donut: alocação recomendada
- [ ] Donut: alocação atual (do portfólio)
- [ ] Benchmark: overlay comparativo recomendado vs atual

**Asset Cards:**
- [ ] Componente `AssetRecommendationCard`:
  - Para cada classe recomendada:
    - Nome da classe, % recomendado, % atual
    - Indicador: ✅ adequado / ⚠️ sub-representado / 🔴 sobre-representado
    - Sugestão: "Aumente X% em Ações"

**KPIs por Classe:**
- [ ] Cards: Risco médio, Dividend Yield médio, Beta, Sharpe estimado
- [ ] Comparativo: seu portfólio vs carteira recomendada

**Alerta de Concentração:**
- [ ] Se um ativo > 15% do patrimônio: alerta amarelo
- [ ] Se uma categoria > 80%: alerta vermelho
- [ ] Sugestões de diversificação

### Dependências

- Phase 2 completa (carteira com categorias)

### Deliverables

- [x] Questionário de 5 steps funcional
- [x] Algoritmo de scoring de perfil
- [x] Gráficos donut recomendado vs atual
- [x] Asset cards com indicadores
- [x] Alertas de concentração

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Questionário completo | 5 steps preenchidos → perfil calculado |
| 2 | Perfil consistente | Respostas conservadoras → perfil conservador |
| 3 | Gráficos com dados reais | Donut atual reflete portfólio existente |
| 4 | Alerta de concentração | Ativo > 15% → alerta exibido |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Algoritmo de scoring subjetivo | Médio | Basear em ANBIMA questionnaire; permitir override manual do perfil |

---

## Phase 9 — Integração Asaas — Assinaturas

> **Estimativa:** 3–4 dias · **Dependências:** Phase 1 + Phase 8 (feature gating)

### Objetivo
Integrar o gateway de pagamentos Asaas para gerenciar assinaturas SaaS com 3 planos, checkout completo (boleto/cartão/PIX), webhook com validação HMAC e feature gating por plano.

### Tasks

**API Routes — Asaas:**
- [ ] `GET /api/subscriptions/plans` — lista planos disponíveis
- [ ] `POST /api/subscriptions/create` — cria assinatura no Asaas
- [ ] `POST /api/subscriptions/cancel` — cancela assinatura
- [ ] `POST /api/subscriptions/webhook` — recebe eventos do Asaas
- [ ] `GET /api/subscriptions/status` — status da assinatura do usuário

**Asaas Client Library:**
- [ ] `lib/asaas/client.ts`:
  - Config: base URL (sandbox vs production)
  - Métodos: createCustomer, createSubscription, getSubscription, cancelSubscription
  - Error handling: retry com backoff exponencial (max 3 tentativas)
  - HMAC validation helper para webhooks

**Tela de Pricing:**
- [ ] Componente `PricingPage`:
  - 3 planos: Básico (grátis), Pro (R$ 19,90/mês), Premium (R$ 39,90/mês)
  - Cards com: nome, preço, features (checklist), badge "Popular" no Pro
  - Toggle mensal/anual (20% desconto anual)
  - Feature comparison table
  - CTAs: "Começar Grátis" / "Assinar Agora"

**Fluxo de Checkout:**
- [ ] Componente `CheckoutModal`:
  - Seleção de plano
  - Dados de pagamento:
    - Boleto: gerar barcode, exibir PDF
    - Cartão: número, validade, CVV, nome (inputs com máscara)
    - PIX: gerar QR code, exibir copy-paste
  - Processamento com loading state
  - Sucesso: confetti + redirect para dashboard
  - Erro: mensagem contextual + retry

**Webhook Handler:**
- [ ] `POST /api/subscriptions/webhook`:
  - Validar HMAC signature (header `asaas-access-token`)
  - Parse evento: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_CANCELED`
  - Processamento idempotente: verificar `id` do evento antes de processar
  - Atualizar Firestore `users/{uid}/subscription`
  - Log em `users/{uid}/webhookLogs`

**Dead Letter Queue:**
- [ ] Se processamento falhar 3x: mover para `deadLetterQueue` collection
- [ ] Admin pode reprocessar manualmente (Phase 12)

**Zustand Subscription Store:**
- [ ] `subscriptionSlice`:
  ```typescript
  interface SubscriptionState {
    plan: 'free' | 'pro' | 'premium'
    status: 'active' | 'canceled' | 'overdue' | 'trialing'
    currentPeriodEnd: Date | null
    features: string[]
    canAccess: (feature: string) => boolean
  }
  ```

**Feature Gating:**
- [ ] HOC `withFeatureGate(feature: string)`:
  - Verifica se plano do usuário inclui a feature
  - Se não: renderiza `FeatureLocked` card com CTA "Faça upgrade"
- [ ] Features por plano:
  - Básico (grátis): até 5 ativos, 1 sonho, sem exportação, sem recomendação
  - Pro: até 50 ativos, 10 sonhos, exportação CSV, carteira recomendada, simulador
  - Premium: ilimitado, API, prioridade suporte, Applicash

### Dependências

- Phase 1 completa (auth, Firestore)
- Conta Asaas com sandbox configurada
- ASAAS_API_KEY e ASAAS_WEBHOOK_SECRET no `.env`

### Deliverables

- [x] Tela de pricing com 3 planos
- [x] Checkout funcional (boleto, cartão, PIX) em sandbox
- [x] Webhook handler com HMAC validation
- [x] Processamento idempotente
- [x] Feature gating por plano
- [x] Subscription store no Zustand

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Criar assinatura no sandbox | Checkout → Asaas dashboard mostra subscription |
| 2 | Webhook processa pagamento | Simular webhook → status atualiza no Firestore |
| 3 | HMAC validation funciona | Enviar webhook sem signature → 401 |
| 4 | Feature gate bloqueia acesso | Usuário free tenta acessar Premium → modal upgrade |
| 5 | Cancelamento funciona | Cancelar → status muda, features removidas |
| 6 | Idempotência | Enviar mesmo webhook 2x → processa apenas 1x |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Asaas sandbox instável | Alto | Implementar retry; mock responses para desenvolvimento |
| Webhook não chega (firewall, DNS) | Alto | Configurar ngrok para dev; monitorar webhook logs |
| Cartão de crédito tokenização | Médio | Usar Asaas tokenization (nunca armazenar dados do cartão) |
| Duplo processamento de webhook | Alto | Idempotency key = Asaas event ID; Firestore unique constraint |

---

## Phase 10 — Programa Applicash

> **Estimativa:** 2–3 dias · **Dependências:** Phase 9

### Objetivo
Implementar o programa de indicação "Applicash" com geração de cupons únicos, validação no registro, aplicação de desconto para o indicado e crédito recorrente para o indicador.

### Tasks

**Geração de Cupom:**
- [ ] Componente `ReferralDashboard`:
  - Cupom único por usuário: `APL-{USER_ID_HASH_6}` (ex: `APL-X3K9M2`)
  - Botão "Copiar Cupom" + Web Share API (mobile)
  - Link de indicação: `https://appliquei.com.br/?ref=APL-X3K9M2`
  - QR Code gerado client-side

**Validação de Cupom no Registro:**
- [ ] Ao registrar, campo opcional "Cupom de Indicação"
- [ ] `POST /api/referral/validate`: verificar se cupom existe e pertence a usuário ativo
- [ ] Se válido: aplicar desconto de 10% no primeiro pagamento

**Crédito Recorrente para Indicador:**
- [ ] Quando indicado faz primeiro pagamento:
  - Criar crédito de 10% do valor no Firestore `users/{referrerId}/credits`
  - Crédito recorrente: mensalmente enquanto indicado permanecer assinante
- [ ] Crédito aplicável como desconto na próxima fatura

**Dashboard Applicash:**
- [ ] KPIs: Total de indicações, indicações ativas, créditos acumulados (R$), próxima recompensa
- [ ] Tabela de indicações: nome, data, status, valor gerado
- [ ] Meta progressiva: "Indique 5 amigos e ganhe 1 mês grátis"
  - Barra de progresso visual
  - Níveis: 0–4 (iniciante), 5–9 (bronze), 10–19 (prata), 20+ (ouro)

**Compartilhamento:**
- [ ] Botão "Compartilhar":
  - Desktop: copiar link para clipboard
  - Mobile: Web Share API (WhatsApp, Telegram, etc.)
  - Template de mensagem: "Estou usando o Appliquei para controlar meus investimentos! Use meu cupom APL-XXXXXX e ganhe 10% de desconto."

### Dependências

- Phase 9 completa (assinaturas funcionando)

### Deliverables

- [x] Cupom único por usuário
- [x] Validação no registro
- [x] Crédito de 10% para indicador
- [x] Dashboard Applicash com KPIs
- [x] Sistema de compartilhamento

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Cupom gerado e único | Dois usuários → cupons diferentes |
| 2 | Indicado usa cupom → desconto aplicado | Primeiro pagamento com 10% off |
| 3 | Indicador recebe crédito | Após pagamento do indicado, crédito aparece |
| 4 | Compartilhamento funciona | Clicar botão → link copiado ou app share abre |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Fraude: auto-indicação | Alto | Não permitir próprio cupom; mesmo IP/device = suspicious |
| Crédito acumulado sem limite | Médio | Cap mensal de R$ 50 em créditos; review manual acima |

---

## Phase 11 — Dúvidas & Sugestões + FAQ

> **Estimativa:** 1–2 dias · **Dependências:** Phase 1

### Objetivo
Implementar sistema de FAQ com busca e filtro, formulário de sugestões e histórico de sugestões do usuário.

### Tasks

**FAQ:**
- [ ] Firestore collection `faqs` (admin-managed):
  ```typescript
  interface FAQ {
    id: string
    question: string
    answer: string
    category: 'geral' | 'patrimonio' | 'financeiro' | 'dividendos' | 'simulador' | 'sonhos' | 'assinatura'
    order: number
    updatedAt: Timestamp
  }
  ```
- [ ] Componente `FAQPage`:
  - Busca por texto (debounce 300ms, client-side filter)
  - Filtro por categoria (tabs/badges)
  - Accordion com pergunta/resposta
  - Ordenação por relevância e ordem manual
- [ ] Seed de FAQs iniciais (migrar do sistema atual)

**Formulário de Sugestões:**
- [ ] Componente `SuggestionForm`:
  - Título (text input)
  - Descrição (textarea, max 500 chars)
  - Categoria (select)
  - Prioridade (baixa/média/alta — opcional)
  - Botão "Enviar Sugestão"
- [ ] Firestore collection `users/{uid}/suggestions`

**Histórico de Sugestões:**
- [ ] Componente `SuggestionHistory`:
  - Lista de sugestões do usuário
  - Status: enviada, em análise, implementada, descartada
  - Badge de status com cor
  - Feedback do admin (campo `adminResponse`)

### Dependências

- Phase 1 completa (auth)

### Deliverables

- [x] FAQ funcional com busca e filtro
- [x] Formulário de sugestões
- [x] Histórico de sugestões

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Busca FAQ retorna resultados | Digitar "dividendo" → accordion filtrado |
| 2 | Enviar sugestão | Firestore registra sugestão do usuário |
| 3 | Histórico exibe sugestões | Lista todas as sugestões do usuário logado |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| FAQ vazio inicialmente | Baixo | Seed com 20+ perguntas do sistema atual |

---

## Phase 12 — Admin Panel

> **Estimativa:** 3–4 dias · **Dependências:** Phase 9 + Phase 11

### Objetivo
Criar painel administrativo com dashboard de métricas, gestão de assinaturas, FAQ e carteira modelo, protegido por middleware de role ADMIN.

### Tasks

**Middleware Admin:**
- [ ] Verificar `role === 'ADMIN'` no documento do usuário
- [ ] Redirecionar para `/app` se não admin
- [ ] Rotas: `/admin/*`

**Dashboard Admin:**
- [ ] KPIs: Total de usuários, Usuários ativos (30d), MRR (Monthly Recurring Revenue), Churn rate, Assinaturas por plano
- [ ] Gráficos: crescimento de usuários (line), MRR (bar), assinaturas por plano (donut)
- [ ] Últimas atividades: registros, upgrades, cancelamentos

**Gestão de Assinaturas:**
- [ ] Lista de todas as assinaturas com filtros (plano, status)
- [ ] Ações: cancelar, reativar, mudar plano, estender trial
- [ ] Detalhes: histórico de pagamentos, webhooks recebidos

**Gestão de FAQ (CRUD):**
- [ ] Interface CRUD: criar, editar, reordenar, excluir FAQ
- [ ] Preview em tempo real
- [ ] Busca e filtro

**Gestão de Carteira Modelo:**
- [ ] Publish/update carteira recomendada padrão
- [ ] Editar alocações por perfil

**Logs de Webhooks:**
- [ ] Lista de webhooks processados: timestamp, evento, status (success/fail)
- [ ] Dead Letter Queue: webhooks que falharam 3x
- [ ] Ação: "Reprocessar" individual ou em lote

**MFA via SMS para Admin:**
- [ ] Fluxo: login → código SMS → verify → acesso admin
- [ ] Firebase Auth: telefone verification
- [ ] Rate limit: 3 tentativas por minuto

### Dependências

- Phase 9 completa (assinaturas)
- Phase 11 completa (FAQ)

### Deliverables

- [x] Painel admin protegido
- [x] Dashboard com métricas
- [x] Gestão de assinaturas
- [x] CRUD de FAQ
- [x] Logs de webhooks
- [x] MFA admin

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Acesso admin protegido | Usuário não-admin → redirect |
| 2 | Dashboard com dados reais | KPIs refletem Firestore |
| 3 | Cancelar assinatura via admin | Status muda no Firestore + Asaas |
| 4 | FAQ CRUD funciona | Criar, editar, excluir → reflete no app |
| 5 | Webhook logs visíveis | Simular webhook → log aparece |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| MFA SMS com custo | Médio | Usar Twilio Verify; custo ~$0.05/SMS; apenas para admin |
| Admin apaga dados acidentalmente | Alto | Soft delete + confirmação visual + audit log |

---

## Phase 13 — Módulos Placeholder + Extras

> **Estimativa:** 2–3 dias · **Dependências:** Phase 2–8

### Objetivo
Implementar os módulos secundários e funcionalidades extras que completam a experiência do usuário.

### Tasks

**Meu Patrimônio (Net Worth Tracker):**
- [ ] Dashboard consolidado: soma carteira + saldo livre + reservas
- [ ] Comparativo mês a mês
- [ ] Meta de patrimônio configurável

**Relatório Mensal:**
- [ ] Resumo automático do mês: receitas, despesas, investimentos, dividendos
- [ ] Gráfico pizza de composição
- [ ] Highlights: "Mês melhor/pior que anterior em X%"
- [ ] Download como PDF (client-side: `html2canvas` + `jsPDF`)

**Jornada Financeira (Educacional):**
- [ ] Conteúdo educativo por módulo:
  - Phase 1: "Entendendo seu dinheiro"
  - Phase 2: "Primeiros investimentos"
  - Phase 3: "Diversificação"
  - Phase 4: "Independência financeira"
- [ ] Progresso de leitura (checkmarks)
- [ ] Integrado com Dream Planner (recomendações baseadas no módulo)

**Radar de Mercado / Info Mercado:**
- [ ] RSS feed de fontes financeiras (Infomoney, Valor Econômico)
- [ ] API route proxy: `GET /api/market/news` (RSS → JSON)
- [ ] Cards de notícias com: título, fonte, data, link
- [ ] Cache: 1 hora

**Export/Import de Dados:**
- [ ] Export: JSON com todas as coleções do usuário
- [ ] Import: upload JSON → validar schema → importar com merge
- [ ] Progress bar para importação

**Notificações Toast:**
- [ ] Sistema global de toasts (sonner ou react-hot-toast)
- [ ] Tipos: success, error, warning, info
- [ ] Position: bottom-right
- [ ] Auto-dismiss: 5s (success/info), manual (error)

### Dependências

- Módulos core implementados (Phase 2–8)

### Deliverables

- [x] Net worth tracker funcional
- [x] Relatório mensal com download PDF
- [x] Conteúdo educativo por fase
- [x] Radar de mercado com RSS
- [x] Export/Import de dados
- [x] Sistema de toast notifications

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Net worth soma corretamente | Carteira + saldo = total exibido |
| 2 | Relatório PDF gera e baixa | PDF com dados do mês |
| 3 | RSS carrega notícias | Cards com notícias de fontes financeiras |
| 4 | Export/Import circular | Export → Import → dados idênticos |
| 5 | Toasts exibem e fecham | Ação → toast aparece → auto-dismiss ou fechar |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| RSS feeds bloqueados por CORS | Médio | Proxy via API route; fallback: hardcoded news |
| PDF generation bundle size | Baixo | Lazy load `html2canvas` + `jsPDF` |
| Import com schema inválido | Médio | Zod validation + rollback em caso de erro parcial |

---

## Phase 14 — Polimento, Performance e Deploy

> **Estimativa:** 2–3 dias · **Dependências:** Todas as fases anteriores

### Objetivo
Preparar a aplicação para produção com otimizações de performance, SEO, deploy na Vercel e monitoramento.

### Tasks

**Performance:**
- [ ] Lazy loading de componentes pesados (gráficos, simulador, PDF)
- [ ] Dynamic imports com `next/dynamic` e `ssr: false` para componentes client-only
- [ ] Otimização de imagens: `next/image` para todos os assets
- [ ] Bundle analysis: `npx @next/bundle-analyzer`
- [ ] Target: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Prefetch de rotas frequentes
- [ ] Image optimization: WebP/AVIF para ícones e logos

**Testes de Integração:**
- [ ] Auth flow: registro → login → logout (Playwright/Cypress)
- [ ] Webhook processing: enviar payload → verificar Firestore
- [ ] Operação CRUD: criar → listar → editar → deletar
- [ ] Subscription flow: criar assinatura → webhook → status atualizado

**SEO:**
- [ ] Meta tags por página (`metadata` export do Next.js)
- [ ] Open Graph: title, description, image, url
- [ ] Favicon e apple-touch-icon
- [ ] `robots.txt` e `sitemap.xml` (dynamic)
- [ ] Canonical URLs
- [ ] Structured data (JSON-LD) para FAQ

**Deploy:**
- [ ] Deploy na Vercel (conectar GitHub repo)
- [ ] Configurar domínio custom (CNAME)
- [ ] SSL automático (Vercel)
- [ ] Environment variables na Vercel dashboard
- [ ] Firebase production project (não emulator)
- [ ] Asaas production API key

**Monitoramento:**
- [ ] Vercel Analytics (speed insights)
- [ ] Vercel Web Vitals
- [ ] Sentry (error tracking) — se orçamento permitir
- [ ] Uptime monitoring (UptimeRobot free tier)

**Documentação da API:**
- [ ] Lista de todas as API routes com métodos, parâmetros e respostas
- [ ] Exemplos de request/response
- [ ] Códigos de erro

### Dependências

- Todas as fases anteriores completas

### Deliverables

- [x] Aplicação otimizada (Core Web Vitals OK)
- [x] Testes E2E passando
- [x] SEO configurado
- [x] Aplicação em produção (Vercel)
- [x] Domínio custom configurado
- [x] Monitoramento ativo
- [x] Documentação da API

### Critérios de Aceitação

| # | Critério | Validação |
|---|---|---|
| 1 | Deploy sem erros | Build + deploy sucesso no Vercel |
| 2 | Lighthouse > 90 | Performance, Accessibility, Best Practices, SEO |
| 3 | Dominio custom acessível | `https://appliquei.com.br` carrega app |
| 4 | HTTPS funcional | Certificado SSL válido |
| 5 | Auth E2E funciona | Registro → login → acesso dashboard em produção |
| 6 | Mobile responsivo | Testar em 375px em produção |
| 7 | Meta tags corretas | Facebook/Twitter debugger mostra preview correto |

### Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Bundle size > 500KB (initial) | Alto | Code splitting agressivo; dynamic imports; tree shaking |
| Vercel Hobby plan cold start lento | Médio | Keep-warm cron; Vercel Pro se necessário |
| DOMínio custom DNS propagation | Baixo | Configurar com 48h de antecedência; usar Vercel subdomain temporário |
| Firebase quota exceeded | Alto | Implementar caching agressivo; monitorar uso; upgrade plan se necessário |

---

## 📅 Timeline Visual

```
Semana 1-2:  [██████████] Phase 0 + Phase 1 (Setup + Auth)
Semana 2-3:  [████████████████] Phase 2 (Carteira + Operações)
Semana 3-4:  [██████████] Phase 3 (Gráficos) + Phase 4 (Controle Financeiro)
Semana 4-5:  [████████] Phase 5 (Dividendos) + Phase 6 (Simulador)
Semana 5-6:  [██████████████] Phase 7 (Dream Planner)
Semana 6-7:  [████████] Phase 8 (Carteira Recomendada) + Phase 9 (Asaas)
Semana 7-8:  [████████] Phase 10 (Applicash) + Phase 11 (FAQ)
Semana 8-9:  [████████████] Phase 12 (Admin Panel)
Semana 9-10: [████████] Phase 13 (Extras) + Phase 14 (Deploy)
```

---

## 📋 Matriz de Dependências

| Fase | Depende de |
|---|---|
| Phase 0 | — |
| Phase 1 | Phase 0 |
| Phase 2 | Phase 1 |
| Phase 3 | Phase 2 |
| Phase 4 | Phase 1 |
| Phase 5 | Phase 2 |
| Phase 6 | Phase 1 |
| Phase 7 | Phase 2, Phase 4 |
| Phase 8 | Phase 2 |
| Phase 9 | Phase 1 |
| Phase 10 | Phase 9 |
| Phase 11 | Phase 1 |
| Phase 12 | Phase 9, Phase 11 |
| Phase 13 | Phase 2–8 |
| Phase 14 | Todas |

**Paralelismo possível:**
- Phase 2 + Phase 4 + Phase 6 (todas dependem apenas de Phase 1)
- Phase 3 + Phase 5 (dependem de Phase 2)
- Phase 8 + Phase 11 (independentes entre si)

---

## 🎯 Marcos de Release

| Marco | Fases | Entregável |
|---|---|---|
| **MVP Alpha** | 0 + 1 + 2 + 4 | App autenticada com carteira e controle financeiro |
| **MVP Beta** | + 3 + 5 + 6 | Dashboard visual + dividendos + simulador |
| **Public Beta** | + 7 + 8 + 9 + 10 | Feature completa + monetização + indicações |
| **v1.0 Production** | + 11 + 12 + 13 + 14 | Sistema completo em produção |

---

## ⚠️ Princípios e Restrições

1. **Zero-regressão:** toda funcionalidade existente deve ser preservada
2. **Mobile-first:** design responsivo como prioridade
3. **Performance:** LCP < 2.5s, bundle inicial < 200KB (gzipped)
4. **Segurança:** nunca expor service account keys; validar todos os inputs; HMAC em webhooks
5. **Testabilidade:** cada fase tem critérios de aceitação verificáveis
6. **Progressive enhancement:** modo guest com localStorage → autenticado com Firestore
7. **Vercel Hobby compatibility:** sem serverless functions > 10s; sem edge middleware complexo

---

> **Documento mantido em:** `/home/z/my-project/download/appliquei-architecture/04_ROADMAP_ITERATIVO.md`
> **Última atualização:** Julho 2025
