# 02 — Modelo de Dados Firestore

> **Appliquei SaaS** | Versão 2.0
> Última atualização: Julho 2025

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Coleções e Subcoleções](#2-coleções-e-subcoleções)
   - 2.1 [users/{uid}](#21-usersuid)
   - 2.2 [subscriptions/{subscriptionId}](#22-subscriptionssubscriptionid)
   - 2.3 [referralCodes/{code}](#23-referralcodescode)
   - 2.4 [referrals/{referralId}](#24-referralsreferralid)
   - 2.5 [subscriptionEvents/{eventId}](#25-subscriptioneventseventid)
   - 2.6 [plans/{planId}](#26-plansplanid)
   - 2.7 [modelPortfolio/{portfolioId}](#27-modelportfoliportfolioid)
   - 2.8 [faqArticles/{articleId}](#28-faqarticlesarticleid)
   - 2.9 [snapshots/{snapshotId}](#29-snapshotssnapshotid)
   - 2.10 [Subcoleções de users/{uid}](#210-subcoleções-de-usersuid)
3. [Modelos de Dados dos Módulos Legados](#3-modelos-de-dados-dos-módulos-legados)
4. [Regras de Segurança Firestore](#4-regras-de-segurança-firestore)
5. [Estratégia de Migração localStorage → Firestore](#5-estratégia-de-migração-localstorage--firestore)
6. [Índices Compostos](#6-índices-compostos)

---

## 1. Visão Geral

### 1.1 Firestore como Banco de Dados Principal

O **Firestore** (modo Native) é escolhido como único banco de dados do Appliquei SaaS, substituindo integralmente o `localStorage` utilizado na versão monolítica (v13.0, ~10.705 linhas em arquivo HTML único).

**Razões da escolha:**

| Critério | Firestore | localStorage (atual) |
|---|---|---|
| Persistência entre dispositivos | ✅ Sincronização em tempo real | ❌ Apenas no navegador |
| Segurança | ✅ Regras de segurança no servidor | ❌ Dados expostos no cliente |
| Consultas complexas | ✅ Índices compostos, filtros | ❌ Apenas iteração em memória |
| Escalabilidade | ✅ Infraestrutura gerenciada Google | ❌ Limitado a ~5-10 MB |
| Multi-tenancy | ✅ Partições por documento | ❌ Impossível |
| Backup | ✅ Automático + exportação | ❌ Perda ao limpar cache |

### 1.2 Organização em Subcoleções

O modelo adota **subcoleções para relacionamentos 1:N** quando:

- Os documentos-filho **não fazem sentido sem o pai** (ex: aportes de um sonho)
- É necessário **escopar acesso por segurança** (usuário só acessa seus próprios dados)
- O volume de documentos-filho por pai é **potencialmente grande** (> 100)

```
users/{uid}
├── operations/          ← Operações de investimento
├── transactions/        ← Transações do controle financeiro
├── dreams/{dreamId}
│   └── contributions/   ← Aportes por sonho
├── creditCards/         ← Cartões de crédito
└── suggestions/         ← Sugestões enviadas pelo usuário
```

Coleções de nível raiz são usadas quando os documentos possuem **identidade própria** ou são **consultados globalmente**:

```
subscriptions/     ← Gerenciado por webhook/service
referralCodes/     ← Consultados por código
referrals/         ← Relaciona dois usuários
subscriptionEvents/← Log de webhooks
plans/             ← Dados estáticos
modelPortfolio/    ← Conteúdo admin
faqArticles/       ← Conteúdo admin
snapshots/         ← Relatórios mensais
```

### 1.3 Regras de Segurança Baseadas em Auth UID

Todas as regras de segurançaFirestore baseiam-se no `request.auth.uid` obtido via Firebase Authentication. O modelo segue três princípios:

1. **Princípio do menor privilégio**: cada coleção possui as permissões mínimas necessárias.
2. **Validação de propriedade**: o campo `userId` deve obrigatoriamente igualar `request.auth.uid`.
3. **Separação admin/user**: funções administrativas (`ADMIN`) possuem acesso ampliado via função customizada verificada no token.

### 1.4 Estratégia de Indexação

- **Índice automático**: Firestore cria automaticamente índices simples (campo único ascendente).
- **Índices compostos**: criados explicitamente via `firestore.indexes.json` para consultas com múltipos filtros/order-by.
- **Exclusões**: campos com cardinalidade alta (ex: `ticker`, `descricao`) usam busca no cliente em vez de filtro no servidor.
- **Otimização de custo**: filtros de igualdade precedem filtros de desigualdade; orderBy usa o último campo filtrado.

---

## 2. Coleções e Subcoleções

### 2.1 users/{uid}

**Document ID:** Firebase Auth UID (custom, definido pelo Authentication).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `displayName` | `string` | ✅ | Nome de exibição do usuário |
| `email` | `string` | ✅ | E-mail (não indexado por privacidade) |
| `phone` | `string` | ❌ | Telefone (com DDD) |
| `photoURL` | `string` | ❌ | URL do avatar |
| `role` | `string` | ✅ | `'FREE' \| 'BASIC' \| 'PRO' \| 'ADMIN'` |
| `createdAt` | `Timestamp` | ✅ | Data de criação da conta |
| `updatedAt` | `Timestamp` | ✅ | Última atualização |
| `lastLoginAt` | `Timestamp` | ✅ | Último login |
| `preferences` | `map` | ✅ | Preferências do usuário |
| `preferences.darkMode` | `boolean` | ✅ | `false` por padrão |
| `preferences.valoresOcultos` | `boolean` | ✅ | Ocultar valores monetários |
| `preferences.sidebarCollapsed` | `boolean` | ✅ | Sidebar recolhida |
| `subscriptionId` | `string?` | ❌ | Referência a `subscriptions/{id}` |
| `referralCode` | `string` | ✅ | Código único de indicação (auto-gerado) |
| `referredBy` | `string?` | ❌ | Código do indicador |
| `currency` | `string` | ✅ | `'BRL'` (padrão) |
| `locale` | `string` | ✅ | `'pt-BR'` (padrão) |
| `activeSubscription` | `boolean` | ✅ | `false` por padrão (cache para regras) |

**Schema TypeScript:**

```typescript
interface User {
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: 'FREE' | 'BASIC' | 'PRO' | 'ADMIN';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  lastLoginAt: admin.firestore.Timestamp;
  preferences: {
    darkMode: boolean;
    valoresOcultos: boolean;
    sidebarCollapsed: boolean;
  };
  subscriptionId?: string;
  referralCode: string;
  referredBy?: string;
  currency: string;
  locale: string;
  activeSubscription: boolean;
}
```

**Validações:**

```typescript
function validateUser(data: Partial<User>): string[] {
  const errors: string[] = [];

  if (data.displayName !== undefined && (data.displayName.length < 2 || data.displayName.length > 50)) {
    errors.push('displayName deve ter entre 2 e 50 caracteres');
  }

  if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email inválido');
  }

  if (data.role !== undefined && !['FREE', 'BASIC', 'PRO', 'ADMIN'].includes(data.role)) {
    errors.push('role deve ser FREE, BASIC, PRO ou ADMIN');
  }

  if (data.referralCode !== undefined && !/^[A-Z0-9]{6,8}$/.test(data.referralCode)) {
    errors.push('referralCode deve ter 6-8 caracteres alfanuméricos maiúsculos');
  }

  return errors;
}
```

**Índices compostos necessários:**
- `referralCode` (ASC) — para busca rápida de código na inscrição.

---

### 2.2 subscriptions/{subscriptionId}

**Document ID:** `autoId` (gerado automaticamente).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `userId` | `string` | ✅ | UID do usuário (referência a `users/{uid}`) |
| `plan` | `string` | ✅ | `'MONTHLY' \| 'SEMI_ANNUAL' \| 'ANNUAL'` |
| `status` | `string` | ✅ | `'ACTIVE' \| 'PAST_DUE' \| 'CANCELLED' \| 'TRIALING'` |
| `asaasCustomerId` | `string` | ✅ | ID do cliente no Asaas |
| `asaasSubscriptionId` | `string` | ✅ | ID da assinatura no Asaas |
| `currentPeriodStart` | `Timestamp` | ✅ | Início do período atual |
| `currentPeriodEnd` | `Timestamp` | ✅ | Fim do período atual |
| `priceBRL` | `number` | ✅ | Preço base em reais |
| `discountPercent` | `number` | ✅ | Desconto por indicação (%) |
| `effectivePriceBRL` | `number` | ✅ | Preço efetivo (com desconto) |
| `cancelAtPeriodEnd` | `boolean` | ✅ | Cancelar ao fim do período |
| `createdAt` | `Timestamp` | ✅ | Data de criação |
| `updatedAt` | `Timestamp` | ✅ | Última atualização |
| `cancelledAt` | `Timestamp?` | ❌ | Data de cancelamento |
| `trialEndsAt` | `Timestamp?` | ❌ | Fim do período de trial |

**Schema TypeScript:**

```typescript
type SubscriptionPlan = 'MONTHLY' | 'SEMI_ANNUAL' | 'ANNUAL';
type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';

interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  asaasCustomerId: string;
  asaasSubscriptionId: string;
  currentPeriodStart: admin.firestore.Timestamp;
  currentPeriodEnd: admin.firestore.Timestamp;
  priceBRL: number;
  discountPercent: number;
  effectivePriceBRL: number;
  cancelAtPeriodEnd: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  cancelledAt?: admin.firestore.Timestamp;
  trialEndsAt?: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateSubscription(data: Partial<Subscription>): string[] {
  const errors: string[] = [];

  if (data.plan !== undefined && !['MONTHLY', 'SEMI_ANNUAL', 'ANNUAL'].includes(data.plan)) {
    errors.push('plan inválido');
  }

  if (data.status !== undefined && !['ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING'].includes(data.status)) {
    errors.push('status inválido');
  }

  if (data.priceBRL !== undefined && data.priceBRL < 0) {
    errors.push('priceBRL deve ser >= 0');
  }

  if (data.discountPercent !== undefined && (data.discountPercent < 0 || data.discountPercent > 100)) {
    errors.push('discountPercent deve estar entre 0 e 100');
  }

  if (data.effectivePriceBRL !== undefined && data.effectivePriceBRL < 0) {
    errors.push('effectivePriceBRL deve ser >= 0');
  }

  if (data.currentPeriodStart && data.currentPeriodEnd) {
    if (data.currentPeriodEnd.toMillis() <= data.currentPeriodStart.toMillis()) {
      errors.push('currentPeriodEnd deve ser posterior a currentPeriodStart');
    }
  }

  return errors;
}
```

**Índices compostos:**
- `userId` (ASC) + `status` (ASC) — verificar assinatura ativa do usuário.
- `asaasSubscriptionId` (ASC) — busca por webhook Asaas.

---

### 2.3 referralCodes/{code}

**Document ID:** O próprio código de indicação (custom, ex: `APLI3X`).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | `string` | ✅ | Código único (igual ao document ID) |
| `ownerId` | `string` | ✅ | UID do dono do código |
| `createdAt` | `Timestamp` | ✅ | Data de criação |
| `totalReferrals` | `number` | ✅ | Total de indicações feitas |
| `activeReferrals` | `number` | ✅ | Indicações com assinatura ativa |

**Schema TypeScript:**

```typescript
interface ReferralCode {
  code: string;       // Document ID
  ownerId: string;    // UID do usuário
  createdAt: admin.firestore.Timestamp;
  totalReferrals: number;
  activeReferrals: number;
}
```

**Validações:**

```typescript
function validateReferralCode(data: Partial<ReferralCode>): string[] {
  const errors: string[] = [];

  if (data.code !== undefined && !/^[A-Z0-9]{6,8}$/.test(data.code)) {
    errors.push('code deve ter 6-8 caracteres alfanuméricos maiúsculos');
  }

  if (data.totalReferrals !== undefined && data.totalReferrals < 0) {
    errors.push('totalReferrals deve ser >= 0');
  }

  return errors;
}
```

**Índices compostos:**
- `ownerId` (ASC) — buscar código de um usuário específico.

---

### 2.4 referrals/{referralId}

**Document ID:** `autoId`.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `referrerId` | `string` | ✅ | UID do indicador |
| `refereeId` | `string` | ✅ | UID do indicado |
| `referralCode` | `string` | ✅ | Código utilizado |
| `status` | `string` | ✅ | `'PENDING' \| 'ACTIVE' \| 'CANCELLED'` |
| `activatedAt` | `Timestamp?` | ❌ | Quando a indicação ficou ativa |
| `cancelledAt` | `Timestamp?` | ❌ | Quando foi cancelada |
| `createdAt` | `Timestamp` | ✅ | Data de criação |

**Schema TypeScript:**

```typescript
type ReferralStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED';

interface Referral {
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: ReferralStatus;
  activatedAt?: admin.firestore.Timestamp;
  cancelledAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateReferral(data: Partial<Referral>): string[] {
  const errors: string[] = [];

  if (data.referrerId !== undefined && !data.referrerId) {
    errors.push('referrerId é obrigatório');
  }

  if (data.refereeId !== undefined && !data.refereeId) {
    errors.push('refereeId é obrigatório');
  }

  if (data.referrerId && data.refereeId && data.referrerId === data.refereeId) {
    errors.push('referrerId e refereeId não podem ser iguais (auto-indicação)');
  }

  if (data.status !== undefined && !['PENDING', 'ACTIVE', 'CANCELLED'].includes(data.status)) {
    errors.push('status inválido');
  }

  return errors;
}
```

**Índices compostos:**
- `referrerId` (ASC) + `status` (ASC) — indicadores ver suas indicações.
- `refereeId` (ASC) — verificar de quem um usuário foi indicado.
- `referralCode` (ASC) + `status` (ASC) — contabilizar indicações ativas por código.

---

### 2.5 subscriptionEvents/{eventId}

**Document ID:** `autoId`.

Esta coleção funciona como **log imutável** de eventos de webhook do Asaas. Registros são **write-only** via webhook e **read-only** para admin.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `subscriptionId` | `string` | ✅ | Referência à assinatura |
| `eventType` | `string` | ✅ | Tipo do evento (ver enum) |
| `asaasEventId` | `string` | ✅ | ID do evento no Asaas (idempotência) |
| `payload` | `map` | ✅ | Payload bruto do webhook |
| `processedAt` | `Timestamp?` | ❌ | Quando foi processado |
| `error` | `string?` | ❌ | Mensagem de erro, se houver |
| `createdAt` | `Timestamp` | ✅ | Data de recebimento |

**Tipos de evento:**

```typescript
type SubscriptionEventType =
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_REACTIVATED'
  | 'PLAN_CHANGED'
  | 'TRIAL_STARTED'
  | 'TRIAL_ENDED';
```

**Schema TypeScript:**

```typescript
interface SubscriptionEvent {
  subscriptionId: string;
  eventType: SubscriptionEventType;
  asaasEventId: string;
  payload: Record<string, unknown>;
  processedAt?: admin.firestore.Timestamp;
  error?: string;
  createdAt: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateSubscriptionEvent(data: Partial<SubscriptionEvent>): string[] {
  const errors: string[] = [];
  const validEvents: SubscriptionEventType[] = [
    'PAYMENT_CONFIRMED', 'PAYMENT_FAILED', 'SUBSCRIPTION_CANCELLED',
    'SUBSCRIPTION_REACTIVATED', 'PLAN_CHANGED', 'TRIAL_STARTED', 'TRIAL_ENDED'
  ];

  if (data.eventType !== undefined && !validEvents.includes(data.eventType)) {
    errors.push('eventType inválido');
  }

  if (data.asaasEventId !== undefined && !data.asaasEventId) {
    errors.push('asaasEventId é obrigatório');
  }

  return errors;
}
```

**Índices compostos:**
- `asaasEventId` (ASC) — garantir idempotência (consulta antes de processar).
- `subscriptionId` (ASC) + `createdAt` (DESC) — histórico de eventos de uma assinatura.

---

### 2.6 plans/{planId}

**Document ID:** Custom — `'monthly'`, `'semi_annual'`, `'annual'`.

Coleção de **dados estáticos** gerenciada pelo admin. Usada para exibição na página de preços e referência na criação de assinaturas.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | `string` | ✅ | Nome de exibição |
| `planId` | `string` | ✅ | Identificador interno |
| `priceBRL` | `number` | ✅ | Preço em reais |
| `months` | `number` | ✅ | Duração em meses |
| `description` | `string` | ✅ | Descrição do plano |
| `features` | `string[]` | ✅ | Lista de funcionalidades |
| `isActive` | `boolean` | ✅ | Se está disponível |
| `sortOrder` | `number` | ✅ | Ordem de exibição |
| `createdAt` | `Timestamp` | ✅ | Data de criação |

**Dados iniciais:**

| planId | name | priceBRL | months |
|---|---|---|---|
| `monthly` | Mensal | 15,00 | 1 |
| `semi_annual` | Semestral | 78,00 | 6 |
| `annual` | Anual | 140,00 | 12 |

**Schema TypeScript:**

```typescript
interface Plan {
  name: string;
  planId: 'monthly' | 'semi_annual' | 'annual';
  priceBRL: number;
  months: number;
  description: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: admin.firestore.Timestamp;
}
```

---

### 2.7 modelPortfolio/{portfolioId}

**Document ID:** `autoId`.

Conteúdo gerenciado pelo **admin** para exibição de carteiras-modelo mensais.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `month` | `string` | ✅ | Mês de referência (`YYYY-MM`) |
| `year` | `number` | ✅ | Ano |
| `targetProfile` | `string` | ✅ | `'Conservador' \| 'Moderado' \| 'Agressivo'` |
| `thesis` | `string` | ✅ | Visão macro / tese de investimento |
| `distribution` | `map` | ✅ | Distribuição percentual por classe |
| `distribution.rendaFixa` | `number` | ✅ | % em renda fixa |
| `distribution.fiis` | `number` | ✅ | % em FIIs |
| `distribution.acoes` | `number` | ✅ | % em ações |
| `distribution.etfs` | `number` | ✅ | % em ETFs |
| `distribution.bdrs` | `number` | ✅ | % em BDRs |
| `assets` | `array` | ✅ | Lista de ativos recomendados |
| `publishedAt` | `Timestamp` | ✅ | Data de publicação |
| `publishedBy` | `string` | ✅ | UID do admin |
| `isActive` | `boolean` | ✅ | Se está publicado |

**Schema do item de `assets[]`:**

```typescript
interface PortfolioAsset {
  ticker: string;
  name: string;
  assetClass: 'renda_fixa' | 'fiis' | 'acoes' | 'etfs' | 'bdrs';
  weight: number;        // percentual da carteira
  currentPrice?: number; // preço atual (opcional)
  targetPrice?: number;  // preço-alvo (opcional)
  obs?: string;          // observação
}
```

**Schema TypeScript completo:**

```typescript
interface ModelPortfolio {
  month: string;
  year: number;
  targetProfile: 'Conservador' | 'Moderado' | 'Agressivo';
  thesis: string;
  distribution: {
    rendaFixa: number;
    fiis: number;
    acoes: number;
    etfs: number;
    bdrs: number;
  };
  assets: PortfolioAsset[];
  publishedAt: admin.firestore.Timestamp;
  publishedBy: string;
  isActive: boolean;
}
```

**Índices compostos:**
- `year` (DESC) + `month` (DESC) + `targetProfile` (ASC) — buscar carteira mais recente por perfil.
- `isActive` (ASC) + `targetProfile` (ASC) — listar carteiras ativas por perfil.

---

### 2.8 faqArticles/{articleId}

**Document ID:** `autoId`.

Artigos de FAQ gerenciados pelo admin.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `question` | `string` | ✅ | Pergunta |
| `answer` | `string` | ✅ | Resposta (suporta Markdown) |
| `category` | `string` | ✅ | Categoria |
| `order` | `number` | ✅ | Ordem de exibição |
| `isActive` | `boolean` | ✅ | Se está visível |
| `createdAt` | `Timestamp` | ✅ | Data de criação |
| `updatedAt` | `Timestamp` | ✅ | Última atualização |

**Categorias disponíveis:**

```typescript
type FaqCategory =
  | 'conta'       // Conta e autenticação
  | 'patrimonio'  // Gestão de patrimônio
  | 'controle'    // Controle financeiro
  | 'ferramentas' // Ferramentas gerais
  | 'applicash'   // Applicash
  | 'dados'       // Dados e privacidade
  | 'assinatura'; // Assinatura e planos
```

**Schema TypeScript:**

```typescript
interface FaqArticle {
  question: string;
  answer: string;
  category: FaqCategory;
  order: number;
  isActive: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}
```

**Índices compostos:**
- `category` (ASC) + `order` (ASC) — listar FAQs por categoria em ordem.
- `isActive` (ASC) + `category` (ASC) — filtrar apenas artigos ativos.

---

### 2.9 snapshots/{snapshotId}

**Document ID:** `autoId`.

Instantâneos mensais do patrimônio do usuário, gerados automaticamente via Cloud Function (trigger no fim do mês).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `userId` | `string` | ✅ | UID do usuário |
| `month` | `string` | ✅ | Mês de referência (`YYYY-MM`) |
| `totalPatrimony` | `number` | ✅ | Patrimônio total (R$) |
| `totalInvested` | `number` | ✅ | Total investido (R$) |
| `totalGains` | `number` | ✅ | Ganhos/Perdas (R$) |
| `categoryBreakdown` | `map` | ✅ | Por categoria |
| `categoryBreakdown.rendaVariavel` | `number` | ✅ | R$ em renda variável |
| `categoryBreakdown.rendaFixa` | `number` | ✅ | R$ em renda fixa |
| `categoryBreakdown.previdencia` | `number` | ✅ | R$ em previdência |
| `categoryBreakdown.reserva` | `number` | ✅ | R$ em reserva de emergência |
| `createdAt` | `Timestamp` | ✅ | Data de geração |

**Schema TypeScript:**

```typescript
interface Snapshot {
  userId: string;
  month: string;
  totalPatrimony: number;
  totalInvested: number;
  totalGains: number;
  categoryBreakdown: {
    rendaVariavel: number;
    rendaFixa: number;
    previdencia: number;
    reserva: number;
  };
  createdAt: admin.firestore.Timestamp;
}
```

**Índices compostos:**
- `userId` (ASC) + `month` (DESC) — histórico de patrimônio do usuário.
- `month` (ASC) — relatórios agregados (admin).

---

### 2.10 Subcoleções de users/{uid}

Todas as subcoleções herdam o escopo de segurança do documento pai (`users/{uid}`), garantindo isolamento de dados entre usuários.

#### users/{uid}/operations

Operações de compra/venda de ativos — migração direta do `localStorage` (chave `operacoes`).

#### users/{uid}/transactions

Transações do controle financeiro — migração do `localStorage` (chave `transacoes`).

#### users/{uid}/dreams/{dreamId}/contributions

Aportes em sonhos — migração do `localStorage` (chave `sonhos[].aportes`).

#### users/{uid}/creditCards

Cartões de crédito — migração do `localStorage` (chave `cartoesCredito`).

#### users/{uid}/suggestions

Sugestões enviadas pelo usuário — migração do `localStorage` (chave `sugestoes`).

---

## 3. Modelos de Dados dos Módulos Legados

### 3.1 Operation (Operação de Ativo)

**Coleção:** `users/{uid}/operations`
**Document ID:** `autoId`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `ticker` | `string` | ✅ | Ticker do ativo (ex: `PETR4`, `HGLG11`) |
| `tipo` | `string` | ✅ | `'compra' \| 'venda'` |
| `categoria` | `string` | ✅ | `'renda_variavel' \| 'renda_fixa' \| 'previdencia' \| 'reserva_emergencia'` |
| `subcategoria` | `string?` | ❌ | `'acoes' \| 'fiis' \| 'bdrs' \| 'etfs' \| 'cripto'` |
| `quantidade` | `number` | ✅ | Quantidade de cotas/unidades |
| `preco` | `number` | ✅ | Preço unitário em R$ |
| `dataOperacao` | `Timestamp` | ✅ | Data da operação |
| `corretora` | `string` | ✅ | Corretora |
| `vencimento` | `Timestamp?` | ❌ | Data de vencimento (renda fixa) |
| `rentabilidade` | `string?` | ❌ | Ex: `'110% CDI'` |
| `isRecorrentePrevidencia` | `boolean` | ❌ | Aporte recorrente de previdência |
| `prevDiaRecorrencia` | `number?` | ❌ | Dia do mês da recorrência |
| `prevDuracaoAnos` | `number?` | ❌ | Duração em anos |
| `prevTaxaMensal` | `number?` | ❌ | Taxa mensal (%) |
| `createdAt` | `Timestamp` | ✅ | Data de criação no Firestore |
| `updatedAt` | `Timestamp` | ✅ | Última atualização |

**Schema TypeScript:**

```typescript
type OperationTipo = 'compra' | 'venda';
type OperationCategoria = 'renda_variavel' | 'renda_fixa' | 'previdencia' | 'reserva_emergencia';
type OperationSubcategoria = 'acoes' | 'fiis' | 'bdrs' | 'etfs' | 'cripto';

interface Operation {
  ticker: string;
  tipo: OperationTipo;
  categoria: OperationCategoria;
  subcategoria?: OperationSubcategoria;
  quantidade: number;
  preco: number;
  dataOperacao: admin.firestore.Timestamp;
  corretora: string;
  vencimento?: admin.firestore.Timestamp;
  rentabilidade?: string;
  isRecorrentePrevidencia?: boolean;
  prevDiaRecorrencia?: number;
  prevDuracaoAnos?: number;
  prevTaxaMensal?: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateOperation(data: Partial<Operation>): string[] {
  const errors: string[] = [];

  if (data.ticker !== undefined && !/^[A-Z0-9]{4,7}\d{1,2}$/.test(data.ticker)) {
    errors.push('ticker inválido (formato esperado: AAAA4, XXXXXX11)');
  }

  if (data.tipo !== undefined && !['compra', 'venda'].includes(data.tipo)) {
    errors.push('tipo deve ser "compra" ou "venda"');
  }

  if (data.quantidade !== undefined && data.quantidade <= 0) {
    errors.push('quantidade deve ser > 0');
  }

  if (data.preco !== undefined && data.preco <= 0) {
    errors.push('preco deve ser > 0');
  }

  if (data.categoria === 'renda_fixa' && !data.vencimento && !data.rentabilidade) {
    errors.push('renda fixa requer vencimento ou rentabilidade');
  }

  if (data.prevDiaRecorrencia !== undefined &&
      (data.prevDiaRecorrencia < 1 || data.prevDiaRecorrencia > 31)) {
    errors.push('prevDiaRecorrencia deve estar entre 1 e 31');
  }

  return errors;
}
```

**Índices compostos:**
- `ticker` (ASC) + `dataOperacao` (DESC) — listar operações de um ativo em ordem cronológica.
- `categoria` (ASC) + `dataOperacao` (DESC) — filtrar por categoria.
- `tipo` (ASC) + `dataOperacao` (DESC) — filtrar compras ou vendas.

---

### 3.2 Transaction (Transação do Controle Financeiro)

**Coleção:** `users/{uid}/transactions`
**Document ID:** `autoId`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `tipo` | `string` | ✅ | `'receita' \| 'despesa_fixa' \| 'despesa_variavel' \| 'cartao_credito' \| 'investimento'` |
| `descricao` | `string` | ✅ | Descrição da transação |
| `valor` | `number` | ✅ | Valor em R$ (sempre positivo) |
| `dataVencimento` | `Timestamp` | ✅ | Data de vencimento |
| `dataPagamento` | `Timestamp?` | ❌ | Data de pagamento efetivo |
| `status` | `string` | ✅ | `'pendente' \| 'pago'` |
| `categoria` | `string` | ✅ | Categoria (ex: `'alimentacao'`, `'salario'`) |
| `cartaoId` | `string?` | ❌ | Referência ao cartão de crédito |
| `parcelas` | `number?` | ❌ | Número total de parcelas |
| `parcelaAtual` | `number?` | ❌ | Parcela atual |
| `isRecorrente` | `boolean` | ❌ | Transação recorrente |
| `recorrenciaFim` | `Timestamp?` | ❌ | Fim da recorrência |
| `isAportePrevidencia` | `boolean` | ❌ | Aporte para previdência |
| `originDreamId` | `string?` | ❌ | ID do sonho de origem |
| `observacao` | `string?` | ❌ | Observação livre |
| `bancoInstituicao` | `string?` | ❌ | Banco/instituição financeira |
| `createdAt` | `Timestamp` | ✅ | Data de criação |
| `updatedAt` | `Timestamp` | ✅ | Última atualização |

**Schema TypeScript:**

```typescript
type TransactionTipo =
  | 'receita'
  | 'despesa_fixa'
  | 'despesa_variavel'
  | 'cartao_credito'
  | 'investimento';

type TransactionStatus = 'pendente' | 'pago';

interface Transaction {
  tipo: TransactionTipo;
  descricao: string;
  valor: number;
  dataVencimento: admin.firestore.Timestamp;
  dataPagamento?: admin.firestore.Timestamp;
  status: TransactionStatus;
  categoria: string;
  cartaoId?: string;
  parcelas?: number;
  parcelaAtual?: number;
  isRecorrente?: boolean;
  recorrenciaFim?: admin.firestore.Timestamp;
  isAportePrevidencia?: boolean;
  originDreamId?: string;
  observacao?: string;
  bancoInstituicao?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateTransaction(data: Partial<Transaction>): string[] {
  const errors: string[] = [];

  const validTipos: TransactionTipo[] = [
    'receita', 'despesa_fixa', 'despesa_variavel', 'cartao_credito', 'investimento'
  ];
  if (data.tipo !== undefined && !validTipos.includes(data.tipo)) {
    errors.push('tipo inválido');
  }

  if (data.valor !== undefined && data.valor <= 0) {
    errors.push('valor deve ser > 0');
  }

  if (data.descricao !== undefined && data.descricao.trim().length === 0) {
    errors.push('descricao não pode estar vazia');
  }

  if (data.parcelas !== undefined && data.parcelas < 1) {
    errors.push('parcelas deve ser >= 1');
  }

  if (data.parcelaAtual !== undefined && data.parcelas !== undefined &&
      data.parcelaAtual > data.parcelas) {
    errors.push('parcelaAtual não pode ser maior que parcelas');
  }

  return errors;
}
```

**Índices compostos:**
- `dataVencimento` (ASC) + `status` (ASC) — listar transações pendentes por data.
- `tipo` (ASC) + `dataVencimento` (ASC) — filtrar receitas/despesas por mês.
- `categoria` (ASC) + `dataVencimento` (ASC) — agrupar por categoria.
- `status` (ASC) + `dataVencimento` (ASC) — painel de pendências.
- `cartaoId` (ASC) + `dataVencimento` (ASC) — fatura de cartão.

---

### 3.3 Dream (Sonho)

**Coleção:** `users/{uid}/dreams`
**Document ID:** `autoId`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome` | `string` | ✅ | Nome do sonho |
| `descricao` | `string?` | ❌ | Descrição detalhada |
| `valorTotal` | `number` | ✅ | Valor alvo em R$ |
| `valorAtual` | `number` | ✅ | Valor acumulado em R$ |
| `dataInicio` | `Timestamp` | ✅ | Data de início |
| `prazo` | `number` | ✅ | Prazo numérico |
| `prazoUnidade` | `string` | ✅ | `'meses' \| 'anos'` |
| `categoria` | `string` | ✅ | Categoria do sonho |
| `esforco` | `string` | ✅ | `'baixo' \| 'medio' \| 'alto'` |
| `status` | `string` | ✅ | `'ativo' \| 'agendado' \| 'conquistado' \| 'vencido'` |
| `aporteMensalCalculado` | `number?` | ❌ | Aporte mensal sugerido |
| `healthScore` | `number?` | ❌ | Score de saúde (0-100) |
| `createdAt` | `Timestamp` | ✅ | Data de criação |
| `updatedAt` | `Timestamp` | ✅ | Última atualização |

**Schema TypeScript:**

```typescript
type DreamCategoria =
  | 'viagem' | 'veiculo' | 'imovel' | 'educacao'
  | 'casamento' | 'reserva' | 'tech' | 'saude' | 'outro';

type DreamStatus = 'ativo' | 'agendado' | 'conquistado' | 'vencido';
type DreamEsforco = 'baixo' | 'medio' | 'alto';
type DreamPrazoUnidade = 'meses' | 'anos';

interface Dream {
  nome: string;
  descricao?: string;
  valorTotal: number;
  valorAtual: number;
  dataInicio: admin.firestore.Timestamp;
  prazo: number;
  prazoUnidade: DreamPrazoUnidade;
  categoria: DreamCategoria;
  esforco: DreamEsforco;
  status: DreamStatus;
  aporteMensalCalculado?: number;
  healthScore?: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}
```

**Índices compostos:**
- `status` (ASC) + `dataInicio` (DESC) — listar sonhos ativos.
- `categoria` (ASC) + `status` (ASC) — filtrar por categoria.

---

### 3.4 Dream Contribution (Aporte de Sonho)

**Coleção:** `users/{uid}/dreams/{dreamId}/contributions`
**Document ID:** `autoId`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `userId` | `string` | ✅ | UID do usuário (denormalizado) |
| `tipo` | `string` | ✅ | Tipo de aporte |
| `valor` | `number` | ✅ | Valor em R$ |
| `data` | `Timestamp` | ✅ | Data do aporte |
| `originType` | `string` | ✅ | `'saldo_livre' \| 'migracao_ativo'` |
| `originDetails` | `map?` | ❌ | Detalhes da origem |
| `originDetails.ticker` | `string?` | ❌ | Ticker do ativo migrado |
| `originDetails.quantidade` | `number?` | ❌ | Quantidade migrada |
| `originDetails.precoMedio` | `number?` | ❌ | Preço médio do ativo migrado |
| `createdAt` | `Timestamp` | ✅ | Data de criação |

**Tipos de aporte:**

```typescript
type ContributionTipo = 'inicial' | 'esporadico' | 'migracao' | 'mensal' | 'aporte';
type ContributionOriginType = 'saldo_livre' | 'migracao_ativo';
```

**Schema TypeScript:**

```typescript
interface DreamContribution {
  userId: string;
  tipo: ContributionTipo;
  valor: number;
  data: admin.firestore.Timestamp;
  originType: ContributionOriginType;
  originDetails?: {
    ticker: string;
    quantidade: number;
    precoMedio: number;
  };
  createdAt: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateContribution(data: Partial<DreamContribution>): string[] {
  const errors: string[] = [];

  if (data.valor !== undefined && data.valor <= 0) {
    errors.push('valor deve ser > 0');
  }

  if (data.originType === 'migracao_ativo' && !data.originDetails?.ticker) {
    errors.push('migracao_ativo requer originDetails.ticker');
  }

  return errors;
}
```

**Índices compostos:**
- `data` (DESC) — listar aportes em ordem cronológica.
- `tipo` (ASC) + `data` (ASC) — filtrar por tipo de aporte.

---

### 3.5 Credit Card (Cartão de Crédito)

**Coleção:** `users/{uid}/creditCards`
**Document ID:** `autoId`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome` | `string` | ✅ | Nome do cartão (ex: `Nubank Platinum`) |
| `limite` | `number` | ✅ | Limite de crédito em R$ |
| `diaFechamento` | `number` | ✅ | Dia de fechamento (1-31) |
| `diaVencimento` | `number` | ✅ | Dia de vencimento (1-31) |
| `arquivado` | `boolean` | ✅ | Se está arquivado |
| `bandeira` | `string?` | ❌ | Bandeira (`Visa`, `Mastercard`, etc.) |
| `cor` | `string?` | ❌ | Cor de identificação (hex) |
| `createdAt` | `Timestamp` | ✅ | Data de criação |

**Schema TypeScript:**

```typescript
interface CreditCard {
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  arquivado: boolean;
  bandeira?: string;
  cor?: string;
  createdAt: admin.firestore.Timestamp;
}
```

**Validações:**

```typescript
function validateCreditCard(data: Partial<CreditCard>): string[] {
  const errors: string[] = [];

  if (data.limite !== undefined && data.limite < 0) {
    errors.push('limite deve ser >= 0');
  }

  if (data.diaFechamento !== undefined &&
      (data.diaFechamento < 1 || data.diaFechamento > 31)) {
    errors.push('diaFechamento deve estar entre 1 e 31');
  }

  if (data.diaVencimento !== undefined &&
      (data.diaVencimento < 1 || data.diaVencimento > 31)) {
    errors.push('diaVencimento deve estar entre 1 e 31');
  }

  if (data.cor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(data.cor)) {
    errors.push('cor deve estar em formato hex (#RRGGBB)');
  }

  return errors;
}
```

---

## 4. Regras de Segurança Firestore

As regras a seguir protegem todos os dados, garantindo que:
- Usuários acessam **apenas seus próprios dados**.
- Admins possuem **acesso total**.
- Webhooks do Asaas podem escrever **apenas em subscriptionEvents**.
- Conteúdo admin (FAQ, carteiras-modelo, planos) é **read-only** para usuários comuns.

```javascript
rules_version = '2';
service cloud.firestore {

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  // Verifica se o usuário está autenticado
  function isAuthenticated() {
    return request.auth != null;
  }

  // Verifica se o usuário é admin (role no token customizado)
  function isAdmin() {
    return isAuthenticated()
      && request.auth.token.role == 'ADMIN';
  }

  // Verifica se o usuário é assinante ativo
  function isActiveSubscriber() {
    return isAuthenticated()
      && (request.auth.token.role == 'BASIC'
       || request.auth.token.role == 'PRO'
       || request.auth.token.role == 'ADMIN');
  }

  // Verifica se o usuário é dono do documento
  function isOwner(userIdField) {
    return isAuthenticated()
      && userIdField == request.auth.uid;
  }

  // Verifica se é dono via path parameter
  function isOwnerViaPath() {
    return isAuthenticated()
      && request.auth.uid == resource.data.userId;
  }

  // Valida dados mínimos de criação
  function isValidTimestamp(field) {
    return field is Timestamp;
  }

  // ============================================================
  // users
  // ============================================================

  match /users/{userId} {
    // Usuário pode ler e atualizar PRÓPRIO perfil
    allow read: if isAuthenticated() && request.auth.uid == userId;
    allow update: if isAuthenticated() && request.auth.uid == userId;

    // Criação restrita ao próprio usuário ou admin
    allow create: if isAuthenticated()
      && (request.auth.uid == userId || isAdmin());

    // Admin pode ler e atualizar qualquer perfil
    allow read, update, delete: if isAdmin();

    // Subcoleções herdam o contexto do documento pai
    match /operations/{opId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAdmin();
    }

    match /transactions/{txId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAdmin();
    }

    match /dreams/{dreamId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAdmin();

      match /contributions/{contribId} {
        allow read, write: if isAuthenticated() && request.auth.uid == userId;
        allow read: if isAdmin();
      }
    }

    match /creditCards/{cardId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAdmin();
    }

    match /suggestions/{sugId} {
      allow create: if isAuthenticated() && request.auth.uid == userId
        && request.resource.data.userId == request.auth.uid;
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAdmin();
    }
  }

  // ============================================================
  // subscriptions
  // ============================================================

  match /subscriptions/{subId} {
    // Usuário pode ler própria assinatura
    allow read: if isAuthenticated()
      && resource.data.userId == request.auth.uid;

    // Criação: via Cloud Function (service account) ou admin
    allow create: if isAdmin();

    // Atualização: Cloud Function ou admin
    allow update: if isAdmin();

    // Admin pode ler todas
    allow read: if isAdmin();
  }

  // ============================================================
  // referralCodes
  // ============================================================

  match /referralCodes/{code} {
    // Qualquer usuário autenticado pode ler (para validar código no signup)
    allow read: if isAuthenticated();

    // Apenas Cloud Function ou admin cria/atualiza
    allow create, update, delete: if isAdmin();
  }

  // ============================================================
  // referrals
  // ============================================================

  match /referrals/{refId} {
    // Referrer pode ler suas próprias indicações
    allow read: if isAuthenticated()
      && (resource.data.referrerId == request.auth.uid
       || resource.data.refereeId == request.auth.uid);

    // Criação via Cloud Function
    allow create: if isAdmin();

    // Admin pode tudo
    allow read, write: if isAdmin();
  }

  // ============================================================
  // subscriptionEvents (write-only via webhook)
  // ============================================================

  match /subscriptionEvents/{eventId} {
    // Escrita apenas por webhook (identificado por token do service account)
    allow create: if isAdmin();

    // Leitura apenas por admin
    allow read: if isAdmin();
  }

  // ============================================================
  // plans (read-only para usuários)
  // ============================================================

  match /plans/{planId} {
    // Qualquer pessoa pode ler planos ativos (incluindo não autenticados para pricing)
    allow read: if true;

    // Apenas admin gerencia
    allow create, update, delete: if isAdmin();
  }

  // ============================================================
  // modelPortfolio (read-only para usuários, write para admin)
  // ============================================================

  match /modelPortfolio/{portfolioId} {
    // Usuários autenticados e assinantes podem ler carteiras ativas
    allow read: if isAuthenticated() && isActiveSubscriber();

    // Admin pode gerenciar
    allow create, update, delete: if isAdmin();
  }

  // ============================================================
  // faqArticles (read-only para usuários)
  // ============================================================

  match /faqArticles/{articleId} {
    // Qualquer pessoa pode ler FAQs ativos
    allow read: if true;

    // Admin gerencia
    allow create, update, delete: if isAdmin();
  }

  // ============================================================
  // snapshots
  // ============================================================

  match /snapshots/{snapId} {
    // Usuário pode ler próprios snapshots
    allow read: if isAuthenticated()
      && resource.data.userId == request.auth.uid;

    // Criação via Cloud Function (mensal)
    allow create: if isAdmin();

    // Admin pode ler tudo
    allow read: if isAdmin();
  }

}
```

### 4.1 Tokens Customizados para Claims

Para que as regras acima funcionem com `request.auth.token.role`, é necessário definir **custom claims** no Firebase Auth via Admin SDK:

```typescript
// scripts/set-admin-claims.ts
import * as admin from 'firebase-admin';

async function setAdminRole(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'ADMIN',
  });
  console.log(`✅ Role ADMIN definida para o usuário ${uid}`);
}

async function setSubscriberRole(uid: string, plan: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, {
    role: plan === 'MONTHLY' ? 'BASIC' : 'PRO',
  });
  console.log(`✅ Role ${plan} definida para o usuário ${uid}`);
}

async function setFreeRole(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, {
    role: 'FREE',
  });
  console.log(`✅ Role FREE definida para o usuário ${uid}`);
}
```

> **Nota:** Custom claims são propagados com ~1 hora de latência. Para atualização imediata, force o refresh do token no cliente via `getIdToken(true)`.

---

## 5. Estratégia de Migração localStorage → Firestore

### 5.1 Visão Geral

A migração do `localStorage` para Firestore precisa ser:
1. **Segura** — nenhum dado pode ser perdido
2. **Validada** — dados inconsistentes devem ser corrigidos ou rejeitados
3. **Idempotente** — pode ser executada múltiplas vezes sem duplicações
4. **Transparente** — o usuário acompanha o progresso

### 5.2 Script de Migração

```typescript
// scripts/migrate-localStorage-to-firestore.ts
import * as admin from 'firebase-admin';
import { validateOperation, validateTransaction, validateDream, validateContribution, validateCreditCard } from '../src/validators';

interface MigrationResult {
  success: boolean;
  operations: { imported: number; errors: number };
  transactions: { imported: number; errors: number };
  dreams: { imported: number; errors: number };
  creditCards: { imported: number; errors: number };
  suggestions: { imported: number; errors: number };
  errors: string[];
}

/**
 * Migra dados do localStorage exportado (JSON) para Firestore.
 * O parâmetro `data` é o objeto JSON exportado do localStorage do usuário.
 */
async function migrateUserData(
  uid: string,
  data: Record<string, unknown>,
): Promise<MigrationResult> {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);
  const result: MigrationResult = {
    success: true,
    operations: { imported: 0, errors: 0 },
    transactions: { imported: 0, errors: 0 },
    dreams: { imported: 0, errors: 0 },
    creditCards: { imported: 0, errors: 0 },
    suggestions: { imported: 0, errors: 0 },
    errors: [],
  };

  const BATCH_SIZE = 500; // Firestore batch limit

  // ── 1. Operações ──────────────────────────────────────────────
  const operacoes = (data.operacoes || []) as Array<Record<string, unknown>>;
  if (operacoes.length > 0) {
    let batch = db.batch();
    let count = 0;

    for (const op of operacoes) {
      const operation = normalizeOperation(op, uid);
      const validationErrors = validateOperation(operation);

      if (validationErrors.length > 0) {
        result.operations.errors++;
        result.errors.push(`Operação inválida: ${validationErrors.join(', ')}`);
        continue;
      }

      const docRef = userRef.collection('operations').doc();
      batch.set(docRef, operation);
      count++;

      if (count % BATCH_SIZE === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    await batch.commit();
    result.operations.imported = count;
  }

  // ── 2. Transações ─────────────────────────────────────────────
  const transacoes = (data.transacoes || []) as Array<Record<string, unknown>>;
  if (transacoes.length > 0) {
    let batch = db.batch();
    let count = 0;

    for (const tx of transacoes) {
      const transaction = normalizeTransaction(tx, uid);
      const validationErrors = validateTransaction(transaction);

      if (validationErrors.length > 0) {
        result.transactions.errors++;
        result.errors.push(`Transação inválida: ${validationErrors.join(', ')}`);
        continue;
      }

      const docRef = userRef.collection('transactions').doc();
      batch.set(docRef, transaction);
      count++;

      if (count % BATCH_SIZE === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    await batch.commit();
    result.transactions.imported = count;
  }

  // ── 3. Sonhos + Aportes ──────────────────────────────────────
  const sonhos = (data.sonhos || []) as Array<Record<string, unknown>>;
  if (sonhos.length > 0) {
    for (const sonho of sonhos) {
      const dream = normalizeDream(sonho, uid);
      const validationErrors = validateDream(dream);

      if (validationErrors.length > 0) {
        result.dreams.errors++;
        result.errors.push(`Sonho inválidoido "${sonho.nome}": ${validationErrors.join(', ')}`);
        continue;
      }

      const dreamRef = userRef.collection('dreams').doc();
      await dreamRef.set(dream);

      // Aportes do sonho
      const aportes = (sonho.aportes || []) as Array<Record<string, unknown>>;
      if (aportes.length > 0) {
        let batch = db.batch();
        let aporteCount = 0;

        for (const aporte of aportes) {
          const contribution = normalizeContribution(aporte, uid);
          const contribErrors = validateContribution(contribution);

          if (contribErrors.length === 0) {
            const contribRef = dreamRef.collection('contributions').doc();
            batch.set(contribRef, contribution);
            aporteCount++;

            if (aporteCount % BATCH_SIZE === 0) {
              await batch.commit();
              batch = db.batch();
            }
          }
        }

        await batch.commit();
      }

      result.dreams.imported++;
    }
  }

  // ── 4. Cartões de Crédito ─────────────────────────────────────
  const cartoes = (data.cartoesCredito || []) as Array<Record<string, unknown>>;
  if (cartoes.length > 0) {
    let batch = db.batch();
    let count = 0;

    for (const cartao of cartoes) {
      const card = normalizeCreditCard(cartao, uid);
      const validationErrors = validateCreditCard(card);

      if (validationErrors.length > 0) {
        result.creditCards.errors++;
        continue;
      }

      const docRef = userRef.collection('creditCards').doc();
      batch.set(docRef, card);
      count++;

      if (count % BATCH_SIZE === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    await batch.commit();
    result.creditCards.imported = count;
  }

  // ── 5. Sugestões ─────────────────────────────────────────────
  const sugestoes = (data.sugestoes || []) as Array<Record<string, unknown>>;
  if (sugestoes.length > 0) {
    let batch = db.batch();
    let count = 0;

    for (const sug of sugestoes) {
      const docRef = userRef.collection('suggestions').doc();
      batch.set(docRef, {
        userId: uid,
        titulo: (sug.titulo || '').toString(),
        descricao: (sug.descricao || '').toString(),
        categoria: (sug.categoria || 'geral').toString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      count++;

      if (count % BATCH_SIZE === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    await batch.commit();
    result.suggestions.imported = count;
  }

  // ── 6. Marcar migração como concluída ────────────────────────
  await userRef.update({
    migrationCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    migratedFrom: 'localStorage_v13',
  });

  result.success = result.errors.length === 0;
  return result;
}
```

### 5.3 Funções de Normalização

```typescript
// scripts/normalizers.ts
import * as admin from 'firebase-admin';

/**
 * Converte dados do formato localStorage (v13) para o schema Firestore.
 */
function normalizeOperation(op: Record<string, unknown>, uid: string): Record<string, unknown> {
  return {
    userId: uid,
    ticker: (op.ticker || '').toString().toUpperCase().trim(),
    tipo: op.tipo === 'venda' ? 'venda' : 'compra',
    categoria: (op.categoria || 'renda_variavel').toString(),
    subcategoria: op.subcategoria ? op.subcategoria.toString() : null,
    quantidade: Number(op.quantidade) || 0,
    preco: Number(op.preco) || 0,
    dataOperacao: parseDate(op.dataOperacao || op.data),
    corretora: (op.corretora || '').toString(),
    vencimento: op.vencimento ? parseDate(op.vencimento) : null,
    rentabilidade: op.rentabilidade ? op.rentabilidade.toString() : null,
    isRecorrentePrevidencia: Boolean(op.isRecorrentePrevidencia),
    prevDiaRecorrencia: Number(op.prevDiaRecorrencia) || null,
    prevDuracaoAnos: Number(op.prevDuracaoAnos) || null,
    prevTaxaMensal: Number(op.prevTaxaMensal) || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function normalizeTransaction(tx: Record<string, unknown>, uid: string): Record<string, unknown> {
  return {
    userId: uid,
    tipo: (tx.tipo || 'despesa_variavel').toString(),
    descricao: (tx.descricao || '').toString(),
    valor: Math.abs(Number(tx.valor) || 0),
    dataVencimento: parseDate(tx.dataVencimento || tx.data),
    dataPagamento: tx.dataPagamento ? parseDate(tx.dataPagamento) : null,
    status: tx.status === 'pago' ? 'pago' : 'pendente',
    categoria: (tx.categoria || 'outros').toString(),
    cartaoId: tx.cartaoId ? tx.cartaoId.toString() : null,
    parcelas: Number(tx.parcelas) || null,
    parcelaAtual: Number(tx.parcelaAtual) || null,
    isRecorrente: Boolean(tx.isRecorrente),
    recorrenciaFim: tx.recorrenciaFim ? parseDate(tx.recorrenciaFim) : null,
    isAportePrevidencia: Boolean(tx.isAportePrevidencia),
    originDreamId: tx.originDreamId ? tx.originDreamId.toString() : null,
    observacao: tx.observacao ? tx.observacao.toString() : null,
    bancoInstituicao: tx.bancoInstituicao ? tx.bancoInstituicao.toString() : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function normalizeDream(dream: Record<string, unknown>, uid: string): Record<string, unknown> {
  return {
    userId: uid,
    nome: (dream.nome || '').toString(),
    descricao: dream.descricao ? dream.descricao.toString() : null,
    valorTotal: Number(dream.valorTotal) || 0,
    valorAtual: Number(dream.valorAtual) || 0,
    dataInicio: parseDate(dream.dataInicio),
    prazo: Number(dream.prazo) || 12,
    prazoUnidade: (dream.prazoUnidade || 'meses').toString(),
    categoria: (dream.categoria || 'outro').toString(),
    esforco: (dream.esforco || 'medio').toString(),
    status: (dream.status || 'ativo').toString(),
    aporteMensalCalculado: Number(dream.aporteMensalCalculado) || null,
    healthScore: Number(dream.healthScore) || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function normalizeContribution(aporte: Record<string, unknown>, uid: string): Record<string, unknown> {
  return {
    userId: uid,
    tipo: (aporte.tipo || 'esporadico').toString(),
    valor: Number(aporte.valor) || 0,
    data: parseDate(aporte.data),
    originType: (aporte.originType || 'saldo_livre').toString(),
    originDetails: aporte.ticker ? {
      ticker: aporte.ticker.toString().toUpperCase(),
      quantidade: Number(aporte.quantidade) || 0,
      precoMedio: Number(aporte.precoMedio) || 0,
    } : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function normalizeCreditCard(card: Record<string, unknown>, uid: string): Record<string, unknown> {
  return {
    userId: uid,
    nome: (card.nome || card.cartao || '').toString(),
    limite: Number(card.limite) || 0,
    diaFechamento: Number(card.diaFechamento) || 1,
    diaVencimento: Number(card.diaVencimento) || 10,
    arquivado: Boolean(card.arquivado),
    bandeira: card.bandeira ? card.bandeira.toString() : null,
    cor: card.cor ? card.cor.toString() : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

/**
 * Converte string de data (DD/MM/YYYY ou ISO) para Timestamp Firestore.
 */
function parseDate(dateInput: unknown): admin.firestore.Timestamp {
  if (!dateInput) {
    return admin.firestore.Timestamp.now();
  }

  const dateStr = String(dateInput);

  // Formato DD/MM/YYYY (usado no localStorage)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return admin.firestore.Timestamp.fromDate(date);
  }

  // ISO 8601 ou timestamp numérico
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return admin.firestore.Timestamp.fromDate(date);
  }

  // Fallback: data atual
  console.warn(`⚠️ Data inválida "${dateStr}", usando data atual`);
  return admin.firestore.Timestamp.now();
}
```

### 5.4 Fluxo de Migração no Cliente

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Tela de    │────▶│  Exportar    │────▶│  Upload para │────▶│  Processar   │
│  Login      │     │  localStorage│     │  Cloud Func  │     │  Migração    │
│  (Auth)     │     │  (JSON)      │     │  (HTTPS)     │     │  (Batch)     │
└─────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │  Retornar    │
                                                               │  Resultado   │
                                                               │  (Resumo)    │
                                                               └──────────────┘
```

1. **Tela de Login**: Após autenticação, detectar se `migrationCompletedAt` não existe no documento do usuário.
2. **Exportar localStorage**: Serializar todas as chaves relevantes em um objeto JSON.
3. **Upload via HTTPS Callable**: Enviar dados para Cloud Function `migrateUser`.
4. **Processamento**: Cloud Function executa `migrateUserData()` com validação e batch writes.
5. **Feedback**: Retornar resumo (quantos registros importados, quantos erros).
6. **Cleanup**: Após confirmação, opcionalmente limpar localStorage no cliente.

### 5.5 Resolução de Conflitos

| Situação | Estratégia |
|---|---|
| Documento já existe no Firestore | Ignorar (skip) — não sobrescrever dados migrados anteriormente |
| Dados com campos obrigatórios faltando | Logar erro, tentar inferir valor padrão |
| Datas inválidas | Usar `Timestamp.now()` como fallback e registrar warning |
| Ticker com formato inconsistente | Normalizar para maiúsculas, remover espaços |
| Valores numéricos inválidos | Tratar como `0` e registrar warning |
| Dados duplicados | Usar `autoId` para evitar conflitos de ID |

### 5.6 Checklist de Validação Pré-Migração

```typescript
// scripts/pre-migration-check.ts
interface PreMigrationCheck {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warnings: string[];
  criticalErrors: string[];
}

async function preMigrationCheck(data: Record<string, unknown>): Promise<PreMigrationCheck> {
  const check: PreMigrationCheck = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    warnings: [],
    criticalErrors: [],
  };

  // Verificar se dados existem
  if (!data.operacoes && !data.transacoes && !data.sonhos) {
    check.criticalErrors.push('Nenhum dado encontrado no localStorage');
    return check;
  }

  // Contar e validar operações
  const operacoes = (data.operacoes || []) as unknown[];
  check.totalRecords += operacoes.length;
  for (const op of operacoes) {
    const normalized = normalizeOperation(op as Record<string, unknown>, 'preview');
    const errors = validateOperation(normalized);
    if (errors.length === 0) {
      check.validRecords++;
    } else {
      check.invalidRecords++;
      check.warnings.push(`Operação: ${errors.join(', ')}`);
    }
  }

  // Contar e validar transações
  const transacoes = (data.transacoes || []) as unknown[];
  check.totalRecords += transacoes.length;
  for (const tx of transacoes) {
    const normalized = normalizeTransaction(tx as Record<string, unknown>, 'preview');
    const errors = validateTransaction(normalized);
    if (errors.length === 0) {
      check.validRecords++;
    } else {
      check.invalidRecords++;
      check.warnings.push(`Transação: ${errors.join(', ')}`);
    }
  }

  // Contar sonhos
  const sonhos = (data.sonhos || []) as unknown[];
  check.totalRecords += sonhos.length;

  // Contar cartões
  const cartoes = (data.cartoesCredito || []) as unknown[];
  check.totalRecords += cartoes.length;

  return check;
}
```

---

## 6. Índices Compostos

Todos os índices compostos necessários, organizados por coleção. Para criar, copie para `firestore.indexes.json` no projeto Firebase.

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "referralCode", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "asaasSubscriptionId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "referralCodes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "referrals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "referrerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "referrals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "refereeId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "referrals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "referralCode", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptionEvents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "asaasEventId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptionEvents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "subscriptionId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "modelPortfolio",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "year", "order": "DESCENDING" },
        { "fieldPath": "month", "order": "DESCENDING" },
        { "fieldPath": "targetProfile", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "modelPortfolio",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "targetProfile", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "faqArticles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "faqArticles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "snapshots",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "month", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "snapshots",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "month", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "operations",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "ticker", "order": "ASCENDING" },
        { "fieldPath": "dataOperacao", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "operations",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "categoria", "order": "ASCENDING" },
        { "fieldPath": "dataOperacao", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "operations",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "tipo", "order": "ASCENDING" },
        { "fieldPath": "dataOperacao", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "dataVencimento", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "tipo", "order": "ASCENDING" },
        { "fieldPath": "dataVencimento", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "categoria", "order": "ASCENDING" },
        { "fieldPath": "dataVencimento", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dataVencimento", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "cartaoId", "order": "ASCENDING" },
        { "fieldPath": "dataVencimento", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "dreams",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dataInicio", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "dreams",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "categoria", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "contributions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "data", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "contributions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "tipo", "order": "ASCENDING" },
        { "fieldPath": "data", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "users",
      "fieldPath": "email",
      "indexes": [],
      "arrayConfig": "EXCLUDED"
    },
    {
      "collectionGroup": "users",
      "fieldPath": "phone",
      "indexes": [],
      "arrayConfig": "EXCLUDED"
    }
  ]
}
```

### 6.1 Resumo de Índices por Coleção

| Coleção | Índices Compostos | Campos Excluídos |
|---|---|---|
| `users` | 1 (`referralCode`) | `email`, `phone` |
| `subscriptions` | 2 (`userId+status`, `asaasSubscriptionId`) | — |
| `referralCodes` | 1 (`ownerId`) | — |
| `referrals` | 3 (`referrerId+status`, `refereeId`, `referralCode+status`) | — |
| `subscriptionEvents` | 2 (`asaasEventId`, `subscriptionId+createdAt`) | — |
| `modelPortfolio` | 2 (`year+month+targetProfile`, `isActive+targetProfile`) | — |
| `faqArticles` | 2 (`category+order`, `isActive+category`) | — |
| `snapshots` | 2 (`userId+month`, `month`) | — |
| `operations` (sub) | 3 (`ticker+dataOperacao`, `categoria+dataOperacao`, `tipo+dataOperacao`) | — |
| `transactions` (sub) | 5 (ver acima) | — |
| `dreams` (sub) | 2 (`status+dataInicio`, `categoria+status`) | — |
| `contributions` (sub) | 2 (`data`, `tipo+data`) | — |
| **Total** | **27** | **2** |

### 6.2 Estratégia de Exclusão de Campos

Campos sensíveis como `email` e `phone` são **excluídos dos índices** (`EXCLUDED`) para:

- **Privacidade**: impedir consultas que enumerem e-mails.
- **Custo**: reduzir o número de entradas de índice (e o custo de leitura de índice).
- **Segurança**: dificultar ataques de enumeração.

Esses campos ainda são **consultáveis** por UID direto (`db.collection('users').doc(uid)`), mas não podem ser usados em `where()`.

---

## Diagrama de Relacionamentos

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         COLEÇÕES DE NÍVEL RAIZ                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐         │
│  │   plans     │    │  subscriptions  │    │ referralCodes    │         │
│  │ (estático)  │    │  ─────────────  │    │  ──────────────  │         │
│  │             │◀───│  planId ────────│    │  ownerId ────────│──┐      │
│  └─────────────┘    │  userId ────────│──┐ │  code (unique)   │  │      │
│                     └─────────────────┘  │ └──────────────────┘  │      │
│                                          │                        │      │
│  ┌──────────────────┐                    │  ┌──────────────────┐  │      │
│  │subscriptionEvents│                    │  │   referrals      │  │      │
│  │  ──────────────  │                    │  │  ──────────────  │  │      │
│  │  subscriptionId ─│────────────────────┘  │  referrerId ─────│──┘      │
│  │  asaasEventId    │                       │  referralCode ───│───────  │
│  │  (idempotência)  │                       │  refereeId ──────│──┐      │
│  └──────────────────┘                       └──────────────────┘  │      │
│                                                                      │      │
│  ┌──────────────────┐    ┌──────────────┐                          │      │
│  │  modelPortfolio  │    │ faqArticles  │                          │      │
│  │  (admin-managed) │    │ (admin)      │                          │      │
│  └──────────────────┘    └──────────────┘                          │      │
│                                                                      │      │
│  ┌──────────────┐                                                     │
│  │  snapshots   │◀────────────────────────────────────────────────────┘
│  │  userId ─────│──── ┐
│  └──────────────┘     │
│                        │
└────────────────────────│────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           users/{uid}                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ displayName, email, role, referralCode, preferences, ...            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ operations  │  │ transactions│  │   dreams     │  │ creditCards  │  │
│  │  ─────────  │  │  ─────────  │  │  ──────────  │  │  ──────────  │  │
│  │  ticker     │  │  tipo       │  │  nome        │  │  nome        │  │
│  │  tipo       │  │  descricao  │  │  valorTotal  │  │  limite      │  │
│  │  categoria  │  │  valor      │  │  status      │  │  diaFech.    │  │
│  │  preco      │  │  categoria  │  │  esforco     │  │  diaVenc.    │  │
│  │  dataOp.    │  │  dataVenc.  │  │  categoria   │  │  arquivado   │  │
│  └─────────────┘  │  status     │  └──────┬───────┘  └──────────────┘  │
│                   └─────────────┘         │                              │
│                                          ▼                              │
│                                 ┌──────────────────┐                     │
│                                 │  contributions   │                     │
│                                 │  ──────────────  │                     │
│                                 │  tipo            │                     │
│                                 │  valor           │                     │
│                                 │  originType      │                     │
│                                 │  data            │                     │
│                                 └──────────────────┘                     │
│                                                                          │
│  ┌──────────────┐                                                        │
│  │ suggestions  │                                                        │
│  │  ──────────  │                                                        │
│  │  titulo      │                                                        │
│  │  descricao   │                                                        │
│  │  categoria   │                                                        │
│  └──────────────┘                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Próximos Passos

| # | Ação | Prioridade | Responsável |
|---|---|---|---|
| 1 | Implementar Firebase Auth (email/senha + Google) | 🔴 Alta | Backend |
| 2 | Configurar projeto Firebase com `firestore.indexes.json` | 🔴 Alta | DevOps |
| 3 | Implementar Cloud Functions de migração | 🔴 Alta | Backend |
| 4 | Criar service layer (TypeScript) para CRUD de cada coleção | 🔴 Alta | Backend |
| 5 | Implementar integração Asaas (webhook + subscriptionEvents) | 🟡 Média | Backend |
| 6 | Painel Admin (FAQ, carteiras-modelo, planos) | 🟡 Média | Frontend |
| 7 | Sistema de indicações (referralCodes + referrals) | 🟡 Média | Fullstack |
| 8 | Cloud Function de snapshot mensal automático | 🟢 Baixa | Backend |
| 9 | Dashboard de patrimônio com gráficos temporais | 🟢 Baixa | Frontend |
| 10 | Testes E2E de migração localStorage → Firestore | 🔴 Alta | QA |

---

> **Documento gerado como parte da transformação Appliquei v13.0 → Appliquei SaaS.**
> **Revisão:** 2.0 | **Status:** Aprovado para implementação
