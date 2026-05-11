# 03 — Arquitetura de Rotas

> **Plataforma:** Appliquei SaaS
> **Stack:** Next.js 16 (App Router) · TypeScript · Firebase Auth · Asaas Payments
> **Versão do documento:** 1.0.0
> **Data:** Julho 2025

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Árvore Completa de Rotas](#2-árvore-completa-de-rotas)
3. [Detalhamento do Middleware](#3-detalhamento-do-middleware)
4. [Fluxos de Autenticação](#4-fluxos-de-autenticação)
5. [Fluxo de Assinatura (Asaas)](#5-fluxo-de-assinatura-asaas)
6. [Estado da Aplicação (Client-Side)](#6-estado-da-aplicação-client-side)
7. [Organização de Componentes](#7-organização-de-componentes)
8. [Tratamento de Erros Global](#8-tratamento-de-erros-global)

---

## 1. Visão Geral

### 1.1 Princípios Arquiteturais

A Appliquei adota um modelo **SPA (Single Page Application) dentro do App Router** do Next.js 16. O utilizador final interage com **uma única rota pública** (`/`), enquanto toda a lógica de navegação entre seções é gerida no lado do cliente via **estado React** — mantendo a experiência fluida e responsiva do projeto original.

Os **API Routes** do Next.js actuam como camada de serviço, expondo endpoints RESTful que:

- Validam e sanitizam inputs;
- Comunicam com Firebase Auth, Firestore, Asaas e fontes externas;
- Executam lógica de negócio (auth, subscrições, referral, exportação, etc.).

### 1.2 Pilares Técnicos

| Pilar | Abordagem |
|-------|-----------|
| **Roteamento** | App Router com uma página pública (`page.tsx`) + API Routes |
| **Renderização** | Server Components por padrão; Client Components onde há interactividade |
| **Auth** | Firebase Auth (Email/Password, Google, Magic Link) + session cookies HTTP-only |
| **Pagamentos** | Asaas REST API + webhook idempotente com validação HMAC |
| **Estado global** | Zustand (auth, UI, dados) + TanStack Query (cache, invalidação, refetch) |
| **Protecção** | Middleware Next.js para guardas de autenticação e papéis |
| **Tipo de app** | SPA-like no client; SSR/ISR nas API Routes |

### 1.3 Por que uma única página?

O design original da Appliquei funciona como um **dashboard multifacetado** com navegação lateral. A decisão de manter uma única `page.tsx` oferece:

- **Zero flash entre navigações** — sem recarregamentos de página;
- **Preservação de estado** — filtros, gráficos e formulários mantêm-se entre secções;
- **SEO irrelevante** — trata-se de uma aplicação autenticada, não de conteúdo público indexável;
- **Simplificação do deploy** — uma rota, um bundle optimizado.

As rotas que exigem renderização independente (login, admin) são tratadas via **modais e overlays** dentro da mesma página, ou por API Routes protegidas.

---

## 2. Árvore Completa de Rotas

```
src/app/
│
├── layout.tsx                          # Layout raiz — providers, fontes, metadata
├── page.tsx                            # SPA principal — única rota visível pelo utilizador
├── globals.css                         # Estilos globais + Tailwind CSS 4
├── not-found.tsx                       # Página 404 customizada
├── error.tsx                           # Error boundary raiz
├── loading.tsx                         # Loading state raiz (fallback Suspense)
│
├── middleware.ts                       # Guarda de autenticação + verificação de papéis
│
├── api/
│   ├── auth/
│   │   ├── login/route.ts              # POST — autenticação email/senha
│   │   ├── register/route.ts           # POST — criação de conta
│   │   ├── logout/route.ts             # POST — invalidação de sessão
│   │   └── session/route.ts            # GET — verificar sessão actual
│   │
│   ├── subscriptions/
│   │   ├── plans/route.ts              # GET — lista de planos disponíveis
│   │   ├── create/route.ts             # POST — criar subscrição Asaas
│   │   ├── cancel/route.ts             # POST — cancelar subscrição
│   │   ├── status/route.ts             # GET — estado da subscrição do utilizador
│   │   └── webhook/route.ts            # POST — handler webhook Asaas (HMAC)
│   │
│   ├── referral/
│   │   ├── code/route.ts               # POST — gerar código de referral
│   │   ├── validate/route.ts           # POST — validar código ao registar
│   │   └── stats/route.ts              # GET — estatísticas de referral do utilizador
│   │
│   ├── portfolio/
│   │   ├── model/route.ts              # GET — carteira modelo actual
│   │   └── snapshots/route.ts          # GET/POST/DELETE — snapshots de portfólio
│   │
│   ├── faq/
│   │   └── articles/route.ts           # GET — artigos de FAQ (público)
│   │
│   ├── suggestions/
│   │   └── route.ts                    # POST — enviar sugestão de artigo
│   │
│   ├── market/
│   │   ├── quotes/route.ts             # GET — cotações (proxy Yahoo Finance)
│   │   ├── dividends/route.ts          # GET — dividendos (proxy Brapi/Yahoo)
│   │   ├── rates/route.ts              # GET — taxas de juros (proxy BCB)
│   │   ├── inflation/route.ts          # GET — IPCA (proxy BCB)
│   │   └── news/route.ts               # GET — notícias (proxy RSS aggregator)
│   │
│   ├── dreams/
│   │   └── route.ts                    # GET/POST/PUT/DELETE — CRUD dos sonhos financeiros
│   │
│   ├── admin/
│   │   ├── users/route.ts              # GET/PUT — gestão de utilizadores
│   │   ├── subscriptions/route.ts      # GET/PUT — gestão de subscrições
│   │   ├── dashboard/route.ts          # GET — métricas administrativas
│   │   ├── faq/route.ts                # GET/POST/PUT/DELETE — CRUD de FAQ
│   │   └── portfolio/route.ts          # PUT — actualizar carteira modelo
│   │
│   └── export/
│       └── data/route.ts               # GET — exportação de dados do utilizador (JSON)
│
├── favicon.ico
└── (outros assets públicos)
```

### 2.1 Legenda de Métodos por Rota

| Método | Significado |
|--------|-------------|
| `GET` | Leitura de dados |
| `POST` | Criação ou acção (login, criar subscrição, enviar sugestão) |
| `PUT` | Actualização completa |
| `DELETE` | Remoção |
| `PATCH` | Actualização parcial |

### 2.2 Rotas Públicas vs Protegidas

```text
ROTAS PÚBLICAS (sem autenticação)
├── GET  /                         → SPA principal (modo convidado — leitura limitada)
├── GET  /api/auth/session         → Verificar se sessão existe
├── GET  /api/subscriptions/plans  → Planos disponíveis
├── GET  /api/faq/articles         → Artigos FAQ
├── GET  /api/market/*             → Dados de mercado (taxa limitada para convidados)
└── POST /api/auth/login           → Login
└── POST /api/auth/register        → Registo
└── POST /api/subscriptions/webhook→ Webhook Asaas (validação HMAC)

ROTAS AUTENTICADAS (qualquer utilizador logado)
├── POST /api/auth/logout
├── GET  /api/referral/code
├── POST /api/referral/validate
├── GET  /api/referral/stats
├── GET  /api/portfolio/model
├── *    /api/portfolio/snapshots
├── POST /api/suggestions
├── *    /api/dreams
├── POST /api/subscriptions/create
├── POST /api/subscriptions/cancel
├── GET  /api/subscriptions/status
├── GET  /api/export/data
└── GET  /api/market/*             → Sem taxa limit (plano define acesso)

ROTAS ADMIN (papel ADMIN obrigatório)
├── *    /api/admin/*
```

---

## 3. Detalhamento do Middleware

O `middleware.ts` é executado **em todos os pedidos** que entram no servidor Next.js (excepto ficheiros estáticos). A sua responsabilidade é validar sessões e garantir que apenas utilizadores autorizados acedam a recursos protegidos.

### 3.1 Estrutura Base

```typescript
// src/app/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/server"; // Admin SDK
import { getClaims } from "@/lib/auth/claims";

// Rotas que não requerem autenticação nenhuma
const PUBLIC_ROUTES = ["/", "/api/auth/login", "/api/auth/register"];

// Rotas de API que são públicas (GET)
const PUBLIC_API_GET = [
  "/api/auth/session",
  "/api/subscriptions/plans",
  "/api/faq/articles",
  "/api/market/quotes",
  "/api/market/dividends",
  "/api/market/rates",
  "/api/market/inflation",
  "/api/market/news",
];

// Rota de webhook — pública mas com validação HMAC própria
const WEBHOOK_ROUTE = "/api/subscriptions/webhook";

// Rotas que exigem papel ADMIN
const ADMIN_ROUTES = ["/api/admin/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ficheiros estáticos — passar à frente
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Rotas públicas — passar à frente
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // 3. Webhook Asaas — validação HMAC delegada à route handler
  if (pathname.startsWith(WEBHOOK_ROUTE)) {
    return NextResponse.next();
  }

  // 4. API GETs públicas — passar à frente
  if (
    request.method === "GET" &&
    PUBLIC_API_GET.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // 5. Todas as outras rotas requerem autenticação
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    return apiUnauthorized(request);
  }

  try {
    // 6. Verificar token JWT com Firebase Admin SDK
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const claims = getClaims(decodedToken);

    // 7. Injetar headers com dados do utilizador para as API Routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decodedToken.uid);
    requestHeaders.set("x-user-email", decodedToken.email ?? "");
    requestHeaders.set("x-user-role", claims.role);
    requestHeaders.set("x-user-plan", claims.plan);

    // 8. Verificar papéis ADMIN
    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      if (claims.role !== "ADMIN") {
        return apiForbidden(request, "Acesso restrito a administradores.");
      }
    }

    // 9. Rotas autenticadas — prosseguir com headers injectados
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    // Token inválido ou expirado
    return apiUnauthorized(request);
  }
}

// Matcher configuration
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// ---------- Helpers ----------

function apiUnauthorized(request: NextRequest) {
  // Se for pedido de API, retornar 401 JSON
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
        message: "Autenticação necessária.",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }
  // Se for navegação para página (não deveria acontecer com SPA),
  // redirecionar para / — a página lida com estado de auth
  return NextResponse.redirect(new URL("/", request.url));
}

function apiForbidden(request: NextRequest, message: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message,
        code: "INSUFFICIENT_PERMISSIONS",
      },
      { status: 403 }
    );
  }
  return NextResponse.redirect(new URL("/", request.url));
}
```

### 3.2 Helper — Extracção de Claims Personalizados

```typescript
// src/lib/auth/claims.ts

interface UserClaims {
  role: "USER" | "ADMIN";
  plan: "FREE" | "BASIC" | "PRO";
  referralCode?: string;
  referredBy?: string;
  subscriptionId?: string;
  mfaVerified?: boolean;
}

export function getClaims(decodedToken: {
  [key: string]: unknown;
}): UserClaims {
  const firebase = decodedToken.firebase || {};
  const signInProvider =
    (firebase as Record<string, Record<string, string>>).sign_in_provider
      ?.["0"] ?? "unknown";

  return {
    role: (decodedToken.role as UserClaims["role"]) || "USER",
    plan: (decodedToken.plan as UserClaims["plan"]) || "FREE",
    referralCode: decodedToken.referralCode as string | undefined,
    referredBy: decodedToken.referredBy as string | undefined,
    subscriptionId: decodedToken.subscriptionId as string | undefined,
    mfaVerified: decodedToken.mfaVerified as boolean | undefined,
  };
}
```

### 3.3 Fluxo de Decisão do Middleware

```text
Pedido HTTP chega ao middleware
│
├─ É ficheiro estático? ──── SIM ──→ Passa à frente
│
├─ Está na lista de rotas públicas? ──── SIM ──→ Passa à frente
│
├─ É webhook Asaas? ──── SIM ──→ Passa à frente (validação HMAC na route)
│
├─ É GET público? ──── SIM ──→ Passa à frente
│
├─ Tem cookie __session? ──── NÃO ──→ 401 (API) / redirect / (navegação)
│
├─ Token JWT válido? ──── NÃO ──→ 401 (API) / redirect / (navegação)
│
├─ É rota ADMIN?
│   ├─ role === "ADMIN"? ──── SIM ──→ Injecta headers, passa à frente
│   └─ role !== "ADMIN" ────→ 403 (API) / redirect / (navegação)
│
└─ Rota autenticada normal ──→ Injecta headers (x-user-id, x-user-role...),
                               passa à frente
```

### 3.4 Modo Convidado vs Autenticado

O SPA principal (`page.tsx`) funciona em dois modos:

| Característica | Convidado | Autenticado (FREE) | Autenticado (BASIC/PRO) |
|---------------|-----------|--------------------|------------------------|
| Ver secção Visão Geral | ✅ Limitada | ✅ Completa | ✅ Completa |
| Ver secção Património | ❌ | ✅ Limitado (simulação) | ✅ Completo |
| Ver secção Controle | ❌ | ✅ | ✅ |
| Ver secção Carteira | ❌ | ✅ Questionário | ✅ Completo |
| Ver secção Simulador | ✅ Básico | ✅ Completo | ✅ Completo |
| Ver secção Sonhos | ❌ | ✅ Limitado (1 sonho) | ✅ Completo |
| Ver secção Applicash | ❌ | ❌ | ✅ |
| Criar portfólio | ❌ | ✅ Limitado | ✅ |
| Exportar dados | ❌ | ✅ | ✅ |
| Acessar API market | ⚠️ Rate-limited | ✅ | ✅ |

A aplicação detecta o modo no client via Zustand store de autenticação e condicionalmente renderiza conteúdo.

---

## 4. Fluxos de Autenticação

### 4.1 Visão Geral dos Provedores

A Appliquei suporta **4 métodos de autenticação**:

```text
┌──────────────────────────────────────────────────┐
│                Firebase Auth                      │
├──────────────────────────────────────────────────┤
│  1. Email + Senha                                │
│  2. Google Sign-In (OAuth 2.0)                   │
│  3. Magic Link (passwordless email)              │
│  4. MFA SMS (obrigatório para ADMIN)             │
└──────────────────────────────────────────────────┘
         │
         ▼
   Session Cookie (HTTP-only, __session)
         │
         ▼
   Firestore — User Profile Document
   (/users/{uid})
         │
         ▼
   Custom Claims (role, plan, referral)
```

### 4.2 Fluxo 1 — Email + Senha

```text
FRONTEND                          API ROUTE                    FIREBASE
   │                                 │                            │
   ├─ Preenche email + senha ───────► POST /api/auth/login ─────►│
   │                                 │                            │
   │                                 │◄──── signInWithEmailAndPassword()
   │                                 │                            │
   │                                 │◄──── ID Token (JWT)
   │                                 │                            │
   │                                 ├─ Criar session cookie ────► createSessionCookie()
   │                                 │                            │
   │◄──── Set-Cookie: __session ─────┤                            │
   │                                 │                            │
   │◄──── { user, role, plan } ──────┤                            │
   │                                 │                            │
   ├─ Zustand store actualizado ─────┤                            │
   ├─ TanStack Query invalidated ────┤                            │
   └─ Redireciona para dashboard ────┤                            │
```

**API Route — Login:**

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Email e senha obrigatórios." },
        { status: 400 }
      );
    }

    // Autenticar com Firebase Client SDK (server-side)
    const userCredential = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password
    );

    const idToken = await userCredential.user.getIdToken();
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 dias em ms

    // Criar cookie de sessão via Admin SDK
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Buscar claims do utilizador
    const decodedClaims = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decodedClaims.uid);
    const customClaims = (userRecord.customClaims || {}) as Record<
      string,
      unknown
    >;

    const response = NextResponse.json({
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        displayName: decodedClaims.name || userRecord.displayName,
        photoURL: decodedClaims.picture || userRecord.photoURL,
        role: customClaims.role || "USER",
        plan: customClaims.plan || "FREE",
      },
    });

    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return response;
  } catch (error) {
    const firebaseError = error as { code?: string };

    if (firebaseError.code === "auth/user-not-found") {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    if (firebaseError.code === "auth/wrong-password") {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS", message: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    if (firebaseError.code === "auth/too-many-requests") {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: "Muitas tentativas. Tente novamente mais tarde.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Erro interno. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
```

### 4.3 Fluxo 2 — Google Sign-In

```text
FRONTEND                          API ROUTE                    FIREBASE
   │                                 │                            │
   ├─ Clica "Entrar com Google" ───►│                            │
   │                                 │                            │
   ├─ Popup OAuth (firebase UI) ────► signInWithPopup(Google) ──►│
   │                                 │                            │
   │◄──── ID Token ──────────────────┤                            │
   │                                 │                            │
   ├─ Envia ID token ───────────────► POST /api/auth/login ─────►│
   │    (com provider: "google")     │  (fluxo igual, mas         │
   │                                 │   detecta conta nova)      │
   │                                 │                            │
   │                                 ├─ Se conta nova:            │
   │                                 │  ├─ Criar doc Firestore    │
   │                                 │  ├─ Definir claims default │
   │                                 │  └─ Processar referral code│
   │                                 │                            │
   │◄──── Set-Cookie: __session ─────┤                            │
   └─ Estado actualizado ────────────┤                            │
```

### 4.4 Fluxo 3 — Magic Link

```text
FRONTEND                          API ROUTE                    FIREBASE
   │                                 │                            │
   ├─ Preenche email ───────────────► POST /api/auth/magic-link ─►│
   │                                 │                            │
   │                                 ├─ sendSignInLinkToEmail() ──►│
   │                                 │                            │
   │◄──── { success: true } ─────────┤          │                  │
   │                                 │          ├─ Email enviado ──┤
   │                                 │          │  com link         │
   │                                 │          │  https://appliquei
   │                                 │          │  .com/?action=     │
   │                                 │          │  verifyEmail&oob  │
   │                                 │          │  Code=xxx         │
   │                                 │          │                  │
   │◄──────── Utilizador clica link ───────────────────────────────┤
   │                                 │                            │
   ├─ useEffect detecta ?action= ───►│                            │
   │  verifyEmail                    │                            │
   │                                 ├─ isSignInWithEmailLink() ──►│
   │                                 ├─ signInWithEmailLink() ────►│
   │                                 │                            │
   │◄──── ID Token ──────────────────┤                            │
   │                                 │                            │
   ├─ Envia ID token ───────────────► POST /api/auth/login ─────►│
   │    (converte em session cookie) │                            │
   │                                 │                            │
   │◄──── Set-Cookie: __session ─────┤                            │
   └─ Redireciona para app ─────────┤                            │
```

### 4.5 Fluxo 4 — MFA SMS (ADMIN)

```text
ADMIN UTILIZADOR                   API ROUTE                    FIREBASE
   │                                 │                            │
   ├─ Login com email/senha ────────► POST /api/auth/login ─────►│
   │                                 │                            │
   │◄──── { requiresMFA: true,       │                            │
   │         mfaEnrollmentId: "..." } │                            │
   │                                 │                            │
   ├─ Mostra modal MFA ──────────────┤                            │
   │  "Insira o código SMS"          │                            │
   │                                 │                            │
   ├─ Preenche código 6 dígitos ────► POST /api/auth/verify-mfa ─►│
   │                                 │                            │
   │                                 ├─ multiFactor()             │
   │                                 │  .resolveSignIn() ────────►│
   │                                 │                            │
   │◄──── { success: true,           │                            │
   │         sessionCookie: "..." } ─┤                            │
   │                                 │                            │
   ├─ Estado actualizado como ADMIN ─┤                            │
   └─ Painel administrativo visível ─┤                            │
```

### 4.6 Gestão de Sessão

```typescript
// src/lib/auth/session.ts
//
// Estratégia:
//   - Cookie HTTP-only "__session" com 14 dias de validade
//   - Refresh silencioso via Firebase ID Token refresh
//   - On-demand: quando o middleware retorna 401, o client
//     tenta refresh e repete o pedido
//   - Logout: limpar cookie + invalidar sessão no Firebase

export const SESSION_CONFIG = {
  cookieName: "__session",
  maxAgeDays: 14,
  refreshThresholdMs: 5 * 60 * 1000, // refresh 5 min antes de expirar
};
```

### 4.7 Componentes de Auth no Frontend

```
src/components/auth/
├── AuthModal.tsx           # Modal wrapper — alterna entre login/register/magic-link
├── LoginForm.tsx           # Formulário email + senha + link "Esqueceu senha?"
├── RegisterForm.tsx        # Formulário registo + campo de referral code
├── GoogleButton.tsx        # Botão "Entrar com Google" (OAuth popup)
├── MagicLinkForm.tsx       # Formulário "Entrar sem senha"
├── MFAForm.tsx             # Formulário código 6 dígitos (só ADMIN)
├── ResetPasswordForm.tsx   # Recuperação de senha (sendPasswordResetEmail)
└── AuthGuard.tsx           # HOC que redireciona ou mostra modal se não autenticado
```

---

## 5. Fluxo de Assinatura (Asaas)

### 5.1 Visão Geral

A integração com o Asaas segue o modelo de **webhook-driven reconciliation**: o frontend inicia o pagamento, mas o estado definitivo é determinado pelo webhook com validação HMAC e idempotência.

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Frontend │    │ API Route│    │  Asaas   │    │ Firestore │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │  Selecciona   │               │               │
     │  plano        │               │               │
     │──────────────►│               │               │
     │               │  Criar        │               │
     │               │  Customer     │               │
     │               │──────────────►│               │
     │               │◄──────────────│               │
     │               │  customerId   │               │
     │               │               │               │
     │               │  Criar        │               │
     │               │  Subscription │               │
     │               │──────────────►│               │
     │               │◄──────────────│               │
     │               │  subId+link   │               │
     │               │               │               │
     │◄──────────────│               │               │
     │  paymentLink  │               │               │
     │               │               │               │
     │  Utilizador   │               │               │
     │  paga (boleto/ │               │               │
     │  cartão/PIX)  │               │               │
     │──────────────►│──────────────►│               │
     │               │               │               │
     │               │  Webhook      │               │
     │               │  (PAYMENT_    │               │
     │               │   RECEIVED)   │               │
     │               │◄──────────────│               │
     │               │               │               │
     │               │  Validar HMAC │               │
     │               │  Deduplicar   │               │
     │               │               │               │
     │               │  Actualizar   │               │
     │               │  Firestore    │──────────────►│
     │               │  + Claims     │               │
     │               │               │               │
     │◄──────────────│               │               │
     │  TanStack     │               │               │
     │  Query poll   │               │               │
     │  ou SSE       │               │               │
     └───────────────┘               │               │
```

### 5.2 Diagrama de Sequência — Checkout

```text
Actor: Utilizador    Component: PricingSection    API: /api/subscriptions/create    Asaas API
  │                        │                              │                              │
  │  Clica "Assinar PRO"  │                              │                              │
  │───────────────────────►│                              │                              │
  │                        │                              │                              │
  │                        │  POST { planId, paymentMethod }                            │
  │                        │─────────────────────────────►│                              │
  │                        │                              │                              │
  │                        │                              │  1. Verificar utilizador tem Asaas customerId
  │                        │                              │     (buscar em Firestore ou criar)
  │                        │                              │──────────────────────────────►
  │                        │                              │◄──────────────────────────────│
  │                        │                              │                              │
  │                        │                              │  2. Criar subscrição Asaas
  │                        │                              │──────────────────────────────►
  │                        │                              │◄──────────────────────────────│
  │                        │                              │     { id, paymentUrl, status }
  │                        │                              │                              │
  │                        │  3. Guardar subscriptionId em Firestore
  │                        │                              │                              │
  │                        │◄─────────────────────────────│                              │
  │                        │  { paymentUrl, subscriptionId }
  │                        │                              │                              │
  │  Abrir URL de pagamento (nova aba ou iframe)         │                              │
  │◄───────────────────────│                              │                              │
  │                        │                              │                              │
  │  ... paga ...          │                              │                              │
  │                        │                              │                              │
  │  Volta à app           │                              │                              │
  │───────────────────────►│                              │                              │
  │                        │                              │                              │
  │                        │  TanStack Query refetch     │                              │
  │                        │  /api/subscriptions/status  │                              │
  │                        │─────────────────────────────►│                              │
  │                        │                              │  Consulta Firestore          │
  │                        │◄─────────────────────────────│                              │
  │                        │  { status: "ACTIVE", plan: "PRO" }
  │                        │                              │                              │
  │  UI actualizada        │                              │                              │
  │◄───────────────────────│                              │                              │
```

### 5.3 Webhook Handler — Validação HMAC e Idempotência

```typescript
// src/app/api/subscriptions/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/server";

/**
 * Asaas Webhook Handler
 *
 * Validação HMAC: Asaas envia um header "asaas-access-token" que deve
 * corresponder ao token configurado no painel Asaas.
 *
 * Idempotência: Utilizamos a combinação { eventId + eventType } como chave
 * única no Firestore para evitar processamento duplicado.
 *
 * Eventos processados:
 * - PAYMENT_RECEIVED     → activar subscrição
 * - PAYMENT_CONFIRMED    → confirmar pagamento
 * - PAYMENT_OVERDUE      → marcar como atrasado
 * - SUBSCRIPTION_CANCELED → desactivar subscrição
 * - SUBSCRIPTION_EXPIRED  → reverter para FREE
 */
export async function POST(request: NextRequest) {
  // 1. Validação HMAC
  const asaasToken = request.headers.get("asaas-access-token");
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!asaasToken || asaasToken !== expectedToken) {
    return NextResponse.json(
      { error: "INVALID_TOKEN", message: "Token de webhook inválido." },
      { status: 401 }
    );
  }

  // 2. Parse do payload
  let payload: AsaasWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_BODY", message: "Payload inválido." },
      { status: 400 }
    );
  }

  const { event, payment, subscription } = payload;

  // 3. Idempotência — verificar se já processámos este evento
  const eventId = payload.id;
  const eventDoc = await db
    .collection("webhookEvents")
    .doc(eventId)
    .get();

  if (eventDoc.exists) {
    return NextResponse.json({
      status: "ALREADY_PROCESSED",
      eventId,
    });
  }

  // 4. Processar por tipo de evento
  try {
    switch (event) {
      case "PAYMENT_RECEIVED":
        await handlePaymentReceived(payment, subscription);
        break;

      case "PAYMENT_CONFIRMED":
        await handlePaymentConfirmed(payment, subscription);
        break;

      case "PAYMENT_OVERDUE":
        await handlePaymentOverdue(payment, subscription);
        break;

      case "SUBSCRIPTION_CANCELED":
        await handleSubscriptionCanceled(subscription);
        break;

      case "SUBSCRIPTION_EXPIRED":
        await handleSubscriptionExpired(subscription);
        break;

      default:
        console.warn(`[Webhook] Evento não processado: ${event}`);
    }

    // 5. Marcar evento como processado (idempotência)
    await db.collection("webhookEvents").doc(eventId).set({
      event,
      processedAt: new Date().toISOString(),
      payload: payload,
    });

    return NextResponse.json({ status: "PROCESSED", eventId });
  } catch (error) {
    console.error(`[Webhook] Erro ao processar evento ${eventId}:`, error);
    return NextResponse.json(
      { error: "PROCESSING_ERROR", message: "Erro interno ao processar." },
      { status: 500 }
    );
  }
}

// ---------- Handlers ----------

async function handlePaymentReceived(
  payment: AsaasPayment,
  subscription: AsaasSubscription | null
) {
  if (!subscription) return;

  const userId = subscription.externalReference; // UID do Firebase
  if (!userId) return;

  // Actualizar status no Firestore
  await db.collection("users").doc(userId).update({
    subscriptionStatus: "ACTIVE",
    plan: subscription.plan || determinePlanFromValue(subscription.value),
    subscriptionId: subscription.id,
    activatedAt: new Date().toISOString(),
  });

  // Actualizar custom claims
  await auth.setCustomUserClaims(userId, {
    plan: subscription.plan || "BASIC",
    subscriptionId: subscription.id,
  });
}

async function handleSubscriptionCanceled(
  subscription: AsaasSubscription
) {
  const userId = subscription.externalReference;
  if (!userId) return;

  await db.collection("users").doc(userId).update({
    subscriptionStatus: "CANCELED",
    canceledAt: new Date().toISOString(),
  });

  // Manter plano até o fim do período pago
  // A reversão para FREE acontece em SUBSCRIPTION_EXPIRED
}

async function handleSubscriptionExpired(
  subscription: AsaasSubscription
) {
  const userId = subscription.externalReference;
  if (!userId) return;

  await db.collection("users").doc(userId).update({
    subscriptionStatus: "EXPIRED",
    plan: "FREE",
    subscriptionId: null,
    expiredAt: new Date().toISOString(),
  });

  // Reverter claims
  await auth.setCustomUserClaims(userId, {
    plan: "FREE",
    subscriptionId: null,
  });
}

// ---------- Types ----------

interface AsaasWebhookPayload {
  id: string;
  event: string;
  payment: AsaasPayment;
  subscription: AsaasSubscription | null;
  dateCreated: string;
}

interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  status: string;
  dueDate: string;
  billingType: string;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  plan: string;
  status: string;
  value: number;
  externalReference: string; // Firebase UID
}
```

### 5.4 Ciclo de Vida Completo da Subscrição

```text
                    ┌─────────────────────────────────────────┐
                    │          CICLO DE VIDA DA ASSINATURA    │
                    └─────────────────────────────────────────┘

    FREE ──► Selecciona Plano ──► PENDING ──► PAYMENT_RECEIVED ──► ACTIVE
     ▲                                                                        │
     │                                                                        │
     │         SUBSCRIPTION_CANCELED ──► CANCELED ──(fim do período)──►      │
     │                                                                        │
     │         SUBSCRIPTION_EXPIRED ──► EXPIRED ──────────────────────►       │
     │                                                                        │
     │         PAYMENT_OVERDUE ──► OVERDUE ──(grace period 3 dias)──►       │
     │                                                                        ▼
     └──────────────────────────── ACTIVE (continua) ◄──── pagamento renovado
```

### 5.5 Fluxo de Cancelamento

```text
Utilizador                  Frontend                    API                        Asaas
   │                          │                           │                          │
   ├─ Clica "Cancelar plano" ─┤                           │                          │
   │                          │ Mostra modal de confirmação                          │
   │  Confirma cancelamento   │                           │                          │
   │─────────────────────────►│                           │                          │
   │                          │ POST /api/subscriptions/   │                          │
   │                          │ cancel                    │                          │
   │                          │──────────────────────────►│                          │
   │                          │                           │ DELETE /subscriptions/   │
   │                          │                           │ {id} ────────────────────►│
   │                          │                           │◄─────────────────────────│
   │                          │                           │ { status: "CANCELED" }   │
   │                          │                           │                          │
   │                          │                           │ Actualiza Firestore      │
   │                          │                           │ (status=CANCELED,        │
   │                          │                           │  acesso até fim do mês)  │
   │                          │◄──────────────────────────│                          │
   │◄─────────────────────────│ { message, accessUntil }  │                          │
   │                          │                           │                          │
   ├─ Toast: "Plano cancelado │                           │                          │
   │  com sucesso. Acesso     │                           │                          │
   │  até DD/MM/AAAA."        │                           │                          │
   └──────────────────────────┘                           │                          │
```

### 5.6 Fluxo de Troca de Plano (Upgrade/Downgrade)

```text
Utilizador            Frontend              API                         Asaas
   │                     │                     │                            │
   ├─ Clica "Upgrade PRO"┤                     │                            │
   │                     │ Mostra diff de preços                            │
   │  Confirma           │                     │                            │
   │─────────────────────►│                     │                            │
   │                     │ POST /api/subscriptions/create                  │
   │                     │ { newPlan, switchFrom: currentSubId }           │
   │                     │────────────────────►│                            │
   │                     │                     │ 1. Cancelar subscrição actual
   │                     │                     │ DELETE /subscriptions/{oldId}
   │                     │                     │───────────────────────────►│
   │                     │                     │ 2. Criar nova subscrição
   │                     │                     │ POST /subscriptions
   │                     │                     │───────────────────────────►│
   │                     │                     │◄──────────────────────────│
   │                     │                     │ 3. Crédito proporcional
   │                     │                     │    (prorrateado no Asaas)
   │                     │◄────────────────────│                            │
   │◄────────────────────│ { newPaymentUrl }   │                            │
   │                     │                     │                            │
   ├─ Paga diferença      │                     │                            │
   └──────────────────────┘                     │                            │
```

---

## 6. Estado da Aplicação (Client-Side)

### 6.1 Arquitectura de Estado

Como o `page.tsx` é o único ponto de entrada, toda a lógica de estado é gerida no client. Utilizamos uma **abordagem híbrida**:

- **Zustand** — estado síncrono, baixa latência (auth, UI, navegação entre secções)
- **TanStack Query** — estado de servidor, cache inteligente (dados de portfólio, cotações, subscrição)

```text
┌───────────────────────────────────────────────────────┐
│                    page.tsx (SPA)                      │
│                                                        │
│  ┌─────────────────┐    ┌──────────────────────────┐  │
│  │   Zustand Store  │    │    TanStack Query         │  │
│  │                  │    │                           │  │
│  │ • authStore      │    │ • useSubscription()      │  │
│  │ • uiStore        │    │ • usePortfolio()         │  │
│  │ • navigationStore│    │ • useMarketQuotes()      │  │
│  │                  │    │ • useDreams()             │  │
│  │                  │    │ • useFaqArticles()        │  │
│  │                  │    │ • useReferralStats()      │  │
│  └─────────────────┘    └──────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Navigation Context                   │  │
│  │                                                   │  │
│  │  activeSection: "patrimonio" | "controle" |       │  │
│  │                   "carteira" | "simulador" |      │  │
│  │                   "sonhos" | "applicash"           │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### 6.2 Zustand — Store de Autenticação

```typescript
// src/stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: "USER" | "ADMIN";
  plan: "FREE" | "BASIC" | "PRO";
  mfaVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updatePlan: (plan: AuthUser["plan"]) => void;
  updateMfaVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isGuest: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isGuest: !user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isGuest: true,
          isLoading: false,
        }),

      updatePlan: (plan) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, plan } });
        }
      },

      updateMfaVerified: (mfaVerified) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, mfaVerified } });
        }
      },
    }),
    {
      name: "appliquei-auth",
      storage: createJSONStorage(() => localStorage),
      // Restaurar apenas UID para re-validar com o servidor
      partialize: (state) => ({
        user: state.user
          ? { uid: state.user.uid, email: state.user.email }
          : null,
      }),
    }
  )
);
```

### 6.3 Zustand — Store de Navegação

```typescript
// src/stores/navigationStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppSection =
  | "visao-geral"
  | "patrimonio"
  | "controle"
  | "carteira"
  | "simulador"
  | "sonhos"
  | "applicash";

interface NavigationState {
  activeSection: AppSection;
  sectionHistory: AppSection[];
  isSidebarOpen: boolean;
  isMobileDrawerOpen: boolean;

  navigateTo: (section: AppSection) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setMobileDrawer: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      activeSection: "visao-geral",
      sectionHistory: ["visao-geral"],
      isSidebarOpen: true,
      isMobileDrawerOpen: false,

      navigateTo: (section) =>
        set((state) => ({
          activeSection: section,
          sectionHistory: [...state.sectionHistory, section],
          isMobileDrawerOpen: false,
        })),

      goBack: () =>
        set((state) => {
          const history = state.sectionHistory.slice(0, -1);
          const previousSection = history[history.length - 1] || "visao-geral";
          return {
            activeSection: previousSection,
            sectionHistory: history,
          };
        }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setMobileDrawer: (open) => set({ isMobileDrawerOpen: open }),
    }),
    {
      name: "appliquei-navigation",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        activeSection: state.activeSection,
      }),
    }
  )
);
```

### 6.4 TanStack Query — Configuração Global

```typescript
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutos — dados considerados frescos
      gcTime: 30 * 60 * 1000,         // 30 minutos — garbage collection
      retry: 2,
      refetchOnWindowFocus: true,     // revalidar quando a janela ganha foco
      refetchOnReconnect: true,       // revalidar ao recuperar conexão
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys — centralizados para consistência
export const queryKeys = {
  // Auth
  session: ["auth", "session"] as const,

  // Subscription
  plans: ["subscriptions", "plans"] as const,
  subscription: ["subscriptions", "status"] as const,

  // Portfolio
  portfolioModel: ["portfolio", "model"] as const,
  portfolioSnapshots: (userId: string) =>
    ["portfolio", "snapshots", userId] as const,

  // Market
  marketQuotes: (symbols: string[]) =>
    ["market", "quotes", symbols] as const,
  marketDividends: (symbols: string[]) =>
    ["market", "dividends", symbols] as const,
  marketRates: ["market", "rates"] as const,
  marketInflation: ["market", "inflation"] as const,
  marketNews: (page?: number) =>
    ["market", "news", page ?? 1] as const,

  // Dreams
  dreams: (userId: string) => ["dreams", userId] as const,

  // FAQ
  faqArticles: ["faq", "articles"] as const,

  // Referral
  referralStats: (userId: string) =>
    ["referral", "stats", userId] as const,

  // Admin
  adminUsers: (page?: number) =>
    ["admin", "users", page ?? 1] as const,
  adminSubscriptions: (page?: number) =>
    ["admin", "subscriptions", page ?? 1] as const,
  adminDashboard: ["admin", "dashboard"] as const,
  adminFaq: ["admin", "faq"] as const,
  adminPortfolio: ["admin", "portfolio"] as const,
} as const;
```

### 6.5 TanStack Query — Exemplo de Hook

```typescript
// src/hooks/usePortfolio.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";

export function usePortfolioModel() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.portfolioModel,
    queryFn: () =>
      apiFetch.get("/api/portfolio/model").then((r) => r.json()),
    enabled: !!user, // só faz fetch se autenticado
    select: (data) => data.portfolio,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (snapshot: PortfolioSnapshotData) =>
      apiFetch.post("/api/portfolio/snapshots", {
        body: JSON.stringify(snapshot),
      }),

    onSuccess: () => {
      // Invalidar cache para refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolioSnapshots(user!.uid),
      });
    },

    onError: (error) => {
      console.error("Erro ao criar snapshot:", error);
    },
  });
}
```

### 6.6 API Client com Tratamento de Auth

```typescript
// src/lib/api/client.ts
import { useAuthStore } from "@/stores/authStore";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      // Token expirado — tentar refresh
      if (response.status === 401) {
        const refreshed = await this.tryRefreshSession();
        if (refreshed) {
          // Repetir pedido original
          return this.request(response.url, {
            method: response.headers.get("x-original-method") || "GET",
          });
        }

        // Refresh falhou — logout
        useAuthStore.getState().logout();
        throw new ApiError("SESSION_EXPIRED", "Sessão expirada.", 401);
      }

      throw new ApiError(
        error.error || "UNKNOWN",
        error.message || "Erro desconhecido.",
        response.status
      );
    }

    return response.json();
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      method: "GET",
      headers: this.getHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      method: "POST",
      headers: this.getHeaders(options?.headers),
    });
    return this.handleResponse<T>(response);
  }

  private getHeaders(init?: HeadersInit): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...init,
    };
  }

  private async tryRefreshSession(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiFetch = new ApiClient();
```

---

## 7. Organização de Componentes

### 7.1 Estrutura de Directórios

```text
src/components/
│
├── layout/                          # Componentes estruturais do dashboard
│   ├── Sidebar.tsx                  # Menu lateral de navegação (desktop)
│   ├── MobileDrawer.tsx             # Menu drawer mobile (swipe + overlay)
│   ├── Header.tsx                   # Barra superior (logo, user menu, notifications)
│   ├── MainContent.tsx              # Wrapper de conteúdo com padding/responsividade
│   ├── SectionRenderer.tsx          # Renderizador condicional por activeSection
│   └── UserMenu.tsx                 # Dropdown do utilizador (profile, plano, logout)
│
├── patrimonio/                      # Secção: Evolução Patrimonial
│   ├── EvolucaoChart.tsx            # Gráfico de linha — evolução do património
│   ├── DonutChart.tsx               # Gráfico de rosca — alocação por classe
│   ├── RichRows.tsx                 # Tabela avançada com agrupamento
│   ├── OperacoesTimeline.tsx        # Timeline de operações (compras/vendas)
│   ├── DividendosPanel.tsx          # Painel de dividendos recebidos
│   └── PatrimonioSummary.tsx        # Cards KPI resumo do património
│
├── controle/                        # Secção: Controle Financeiro
│   ├── KpiCards.tsx                 # Cards de KPIs financeiros
│   ├── ExtratoTable.tsx             # Tabela de extrato de receitas/despesas
│   ├── TransacaoForm.tsx            # Formulário de nova transação
│   ├── TermometroGastos.tsx         # Gráfico termómetro de gastos por categoria
│   ├── VencimentosList.tsx          # Lista de vencimentos próximos
│   └── OrcamentoBar.tsx             # Barra de progresso do orçamento
│
├── carteira/                        # Secção: Carteira de Investimentos
│   ├── QuestionnaireWizard.tsx      # Questionário de perfil de investidor (steps)
│   ├── CalculadoraAportes.tsx       # Calculadora de aportes regulares
│   ├── AssetCards.tsx               # Cards de activos com cotação em tempo real
│   ├── CarteiraDonut.tsx            # Gráfico de alocação da carteira
│   ├── OperacoesTable.tsx           # Tabela de operações da carteira
│   └── AdminPortfolioPanel.tsx      # Painel admin para configurar carteira modelo
│
├── simulador/                       # Secção: Simulador de Investimentos
│   ├── SimuladorForm.tsx            # Formulário de inputs (valor, prazo, taxa)
│   ├── ResultadosPanel.tsx          # Painel de resultados (montante, juros)
│   ├── TabelaAmortizacao.tsx        # Tabela de amortização/empréstimo
│   ├── GraficoComparativo.tsx       # Gráfico comparativo entre cenários
│   └── CenariosList.tsx             # Lista de cenários salvos
│
├── sonhos/                          # Secção: Sonhos Financeiros
│   ├── SonhosOverview.tsx           # Dashboard dos sonhos (progresso geral)
│   ├── SonhoCard.tsx                # Card individual de sonho
│   ├── AportesTimeline.tsx          # Timeline de aportes por sonho
│   ├── SaudeFinanceiraPanel.tsx     # Painel de saúde financeira (score)
│   ├── NovoSonhoForm.tsx            # Formulário de criação de sonho
│   └── SonhoProgressChart.tsx       # Gráfico de progresso do sonho
│
├── applicash/                       # Secção: Applicash (PRO)
│   ├── ApplicashKpis.tsx            # KPIs específicos do Applicash
│   ├── TabelaApplicash.tsx          # Tabela de transacções Applicash
│   ├── MetaProgresso.tsx            # Barra de meta de poupança
│   ├── CupomPanel.tsx               # Painel de cupons de cashback
│   └── DashboardApplicash.tsx       # Dashboard consolidado Applicash
│
├── auth/                            # Componentes de autenticação
│   ├── AuthModal.tsx                # Modal wrapper (tabs: login/register/recover)
│   ├── LoginForm.tsx                # Formulário de login
│   ├── RegisterForm.tsx             # Formulário de registo
│   ├── GoogleButton.tsx             # Botão OAuth Google
│   ├── MagicLinkForm.tsx            # Formulário magic link
│   ├── MFAForm.tsx                  # Formulário MFA (6 dígitos)
│   ├── ResetPasswordForm.tsx        # Formulário de recuperação de senha
│   └── AuthGuard.tsx                # HOC de protecção de conteúdo
│
├── pricing/                         # Secção de planos e checkout
│   ├── PricingCards.tsx             # Cards de planos (FREE/BASIC/PRO)
│   ├── PlanFeatureList.tsx          # Lista de features por plano
│   ├── CheckoutModal.tsx            # Modal de checkout com métodos de pagamento
│   ├── SubscriptionStatus.tsx       # Badge de estado da subscrição
│   └── CancelSubscriptionModal.tsx  # Modal de confirmação de cancelamento
│
├── faq/                             # Secção FAQ
│   ├── FaqSearch.tsx                # Barra de pesquisa de artigos
│   ├── FaqAccordion.tsx             # Accordion de perguntas/respostas
│   ├── FaqArticle.tsx               # Visualização de artigo completo
│   └── SuggestionForm.tsx           # Formulário de sugestão de tópico
│
└── ui/                              # shadcn/ui components (já existente)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── select.tsx
    ├── toast.tsx
    ├── skeleton.tsx
    ├── tabs.tsx
    ├── badge.tsx
    ├── avatar.tsx
    ├── dropdown-menu.tsx
    ├── accordion.tsx
    ├── table.tsx
    ├── chart.tsx
    ├── form.tsx
    ├── label.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── tooltip.tsx
    └── ...
```

### 7.2 Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componente | PascalCase `.tsx` | `EvolucaoChart.tsx` |
| Hook | camelCase com prefixo `use` | `usePortfolio.ts` |
| Store | camelCase com sufixo `Store` | `authStore.ts` |
| Utilitário | camelCase | `formatCurrency.ts` |
| Tipo | PascalCase | `PortfolioSnapshot` |
| Constante | SCREAMING_SNAKE | `SESSION_CONFIG` |

### 7.3 Lazy Loading de Secções

Como todas as secções vivem dentro da mesma página, usamos `React.lazy` + `Suspense` para garantir que apenas a secção activa é carregada:

```typescript
// src/components/layout/SectionRenderer.tsx
import React, { Suspense } from "react";
import { useNavigationStore } from "@/stores/navigationStore";
import { SectionSkeleton } from "@/components/ui/skeleton";

const PatrimonioSection = React.lazy(
  () => import("@/sections/PatrimonioSection")
);
const ControleSection = React.lazy(
  () => import("@/sections/ControleSection")
);
const CarteiraSection = React.lazy(
  () => import("@/sections/CarteiraSection")
);
const SimuladorSection = React.lazy(
  () => import("@/sections/SimuladorSection")
);
const SonhosSection = React.lazy(
  () => import("@/sections/SonhosSection")
);
const ApplicashSection = React.lazy(
  () => import("@/sections/ApplicashSection")
);

const SECTION_MAP: Record<
  AppSection,
  React.LazyExoticComponent<React.ComponentType>
> = {
  "visao-geral": React.lazy(() => import("@/sections/VisaoGeralSection")),
  patrimonio: PatrimonioSection,
  controle: ControleSection,
  carteira: CarteiraSection,
  simulador: SimuladorSection,
  sonhos: SonhosSection,
  applicash: ApplicashSection,
};

export function SectionRenderer() {
  const { activeSection } = useNavigationStore();
  const SectionComponent = SECTION_MAP[activeSection];

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <SectionComponent />
    </Suspense>
  );
}
```

---

## 8. Tratamento de Erros Global

### 8.1 Estratégia de Camadas

```text
CAMADA 1: Component Level
├─ try/catch em event handlers
├─ TanStack Query onError (mutações)
└─ Form validation (react-hook-form + zod)

CAMADA 2: Error Boundary (React)
├─ error.tsx (raiz Next.js)
├─ Section-level error boundaries
└─ Recoverable vs fatal errors

CAMADA 3: API Level
├─ Middleware validation (401/403)
├─ Route handler try/catch
├─ Consistent error response format
└─ Error logging (structured)

CAMADA 4: Toast Notifications
├─ Success: operação realizada
├─ Warning: atenção necessária
├─ Error: falha na operação
└─ Info: informação útil
```

### 8.2 Formato de Erro API (Contract)

Todas as respostas de erro das API Routes seguem este formato:

```typescript
interface ApiErrorResponse {
  error: string;       // Código de erro machine-readable
  message: string;     // Mensagem human-readable (pt-BR)
  code: string;        // Código HTTP interno
  details?: Record<string, unknown>; // Detalhes adicionais (validação, etc.)
  timestamp: string;   // ISO 8601
  path: string;        // Rota do endpoint
}
```

**Exemplos:**

```typescript
// 400 — Validação
{
  "error": "VALIDATION_ERROR",
  "message": "O campo 'email' é obrigatório e deve ser um email válido.",
  "code": "INVALID_INPUT",
  "details": {
    "field": "email",
    "constraint": "required|email"
  },
  "timestamp": "2025-07-15T10:30:00.000Z",
  "path": "/api/auth/register"
}

// 401 — Não autenticado
{
  "error": "UNAUTHORIZED",
  "message": "Autenticação necessária para aceder a este recurso.",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-07-15T10:30:00.000Z",
  "path": "/api/portfolio/snapshots"
}

// 403 — Sem permissões
{
  "error": "FORBIDDEN",
  "message": "Acesso restrito a administradores.",
  "code": "INSUFFICIENT_PERMISSIONS",
  "timestamp": "2025-07-15T10:30:00.000Z",
  "path": "/api/admin/users"
}

// 404 — Não encontrado
{
  "error": "NOT_FOUND",
  "message": "Artigo FAQ não encontrado.",
  "code": "RESOURCE_MISSING",
  "timestamp": "2025-07-15T10:30:00.000Z",
  "path": "/api/faq/articles"
}

// 429 — Rate limit
{
  "error": "TOO_MANY_REQUESTS",
  "message": "Muitas requisições. Aguarde 60 segundos antes de tentar novamente.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60
  },
  "timestamp": "2025-07-15T10:30:00.000Z",
  "path": "/api/market/quotes"
}

// 500 — Erro interno
{
  "error": "INTERNAL_ERROR",
  "message": "Erro interno do servidor. Tente novamente mais tarde.",
  "code": "UNEXPECTED_FAILURE",
  "timestamp": "2025-07-15T10:30:00.000Z",
  "path": "/api/subscriptions/create"
}
```

### 8.3 Error Boundary Raiz

```typescript
// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log de erro estruturado para monitoring
    console.error("[ErrorBoundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Oops! Algo deu errado.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Ocorreu um erro inesperado. Os nossos engenheiros foram notificados.
            Tente recarregar a página.
          </p>

          {error.digest && (
            <p className="text-xs text-muted-foreground text-center font-mono">
              Código do erro: {error.digest}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Voltar ao Início
            </Button>
            <Button onClick={reset}>Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8.4 Error Boundary por Secção

```typescript
// src/components/layout/SectionErrorBoundary.tsx
"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary] ${this.props.sectionName}`, {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Erro na secção &quot;{this.props.sectionName}&quot;
          </h3>
          <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
            {this.state.error?.message ||
              "Não foi possível carregar esta secção."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 8.5 Hook de Toasts

```typescript
// src/hooks/useToast.ts
import { toast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useAppToast() {
  return {
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, options);
    },

    error: (error: ApiError | Error | string, options?: ToastOptions) => {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Erro inesperado. Tente novamente.";

      toast.error(message, {
        ...options,
        duration: options?.duration ?? 6000,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, options);
    },

    info: (message: string, options?: ToastOptions) => {
      toast.info(message, options);
    },

    promise: async <T>(
      promise: Promise<T>,
      opts: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ): Promise<T> => {
      return toast.promise(promise, opts);
    },
  };
}
```

### 8.6 Loading States — Skeletons

```typescript
// src/components/ui/skeleton.tsx — extensões
//
// Cada secção tem o seu skeleton dedicado:

// src/components/patrimonio/PatrimonioSkeleton.tsx
export function PatrimonioSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>

      {/* Table */}
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton genérico para secções
export function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
```

### 8.7 Validação de Input com Zod

```typescript
// src/lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório.")
    .email("Email inválido."),
  password: z
    .string()
    .min(1, "Senha é obrigatória.")
    .min(6, "Senha deve ter no mínimo 6 caracteres."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório.")
      .min(2, "Nome deve ter no mínimo 2 caracteres.")
      .max(100, "Nome deve ter no máximo 100 caracteres."),
    email: z
      .string()
      .min(1, "Email é obrigatório.")
      .email("Email inválido."),
    password: z
      .string()
      .min(1, "Senha é obrigatória.")
      .min(6, "Senha deve ter no mínimo 6 caracteres.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter letra maiúscula, minúscula e número."
      ),
    confirmPassword: z.string().min(1, "Confirmação obrigatória."),
    referralCode: z.string().optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Aceite os termos de uso." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const snapshotSchema = z.object({
  name: z.string().min(1, "Nome do snapshot obrigatório."),
  date: z.string().min(1, "Data obrigatória."),
  assets: z
    .array(
      z.object({
        ticker: z.string().min(1),
        quantity: z.number().positive("Quantidade deve ser positiva."),
        avgPrice: z.number().min(0, "Preço médio não pode ser negativo."),
        currentPrice: z.number().min(0).optional(),
      })
    )
    .min(1, "Adicione pelo menos um activo."),
});
```

### 8.8 Tabela de Códigos de Erro

| Código | Status HTTP | Descrição |
|--------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Input inválido (detalhes no campo `details`) |
| `INVALID_CREDENTIALS` | 401 | Email ou senha incorrectos |
| `AUTH_REQUIRED` | 401 | Sessão não encontrada ou expirada |
| `SESSION_EXPIRED` | 401 | Token expirado (necessário refresh) |
| `MFA_REQUIRED` | 403 | MFA não verificado (ADMIN) |
| `INSUFFICIENT_PERMISSIONS` | 403 | Papel insuficiente |
| `PLAN_LIMIT_EXCEEDED` | 403 | Limite do plano atingido |
| `RESOURCE_MISSING` | 404 | Recurso não encontrado |
| `TOO_MANY_REQUESTS` | 429 | Rate limit excedido |
| `PAYMENT_FAILED` | 402 | Falha no processamento do pagamento |
| `SUBSCRIPTION_ACTIVE` | 409 | Já possui subscrição activa |
| `REFERRAL_CODE_INVALID` | 400 | Código de referral inválido |
| `ASAAS_ERROR` | 502 | Erro de comunicação com Asaas |
| `FIREBASE_ERROR` | 502 | Erro de comunicação com Firebase |
| `INTERNAL_ERROR` | 500 | Erro inesperado do servidor |

---

## Anexo A — Mapeamento Rota → Permissão

| Rota | Método | Convidado | FREE | BASIC | PRO | ADMIN |
|------|--------|:---------:|:----:|:-----:|:---:|:-----:|
| `/` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/register` | POST | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/logout` | POST | — | ✅ | ✅ | ✅ | ✅ |
| `/api/auth/session` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/subscriptions/plans` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/subscriptions/create` | POST | — | ✅ | ✅ | ✅ | ✅ |
| `/api/subscriptions/cancel` | POST | — | ✅ | ✅ | ✅ | ✅ |
| `/api/subscriptions/status` | GET | — | ✅ | ✅ | ✅ | ✅ |
| `/api/subscriptions/webhook` | POST | ✅* | ✅* | ✅* | ✅* | ✅* |
| `/api/referral/code` | POST | — | ✅ | ✅ | ✅ | ✅ |
| `/api/referral/validate` | POST | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/referral/stats` | GET | — | ✅ | ✅ | ✅ | ✅ |
| `/api/portfolio/model` | GET | — | ✅ | ✅ | ✅ | ✅ |
| `/api/portfolio/snapshots` | ALL | — | ⚠️ 3 | ⚠️ 10 | ♾️ | ♾️ |
| `/api/faq/articles` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/suggestions` | POST | — | ✅ | ✅ | ✅ | ✅ |
| `/api/market/*` | GET | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| `/api/dreams` | ALL | — | ⚠️ 1 | ⚠️ 5 | ♾️ | ♾️ |
| `/api/export/data` | GET | — | ✅ | ✅ | ✅ | ✅ |
| `/api/admin/*` | ALL | — | — | — | — | ✅ |

*Webhook: validação HMAC, não depende de sessão.
⚠️ Limitado pelo plano.
♾️ Sem limite.

---

## Anexo B — Environment Variables Necessárias

```bash
# .env.local

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_ADMIN_CLIENT_EMAIL=xxx@appspot.gserviceaccount.com

# Asaas
ASAAS_API_KEY=xxx
ASAAS_ENVIRONMENT=sandbox           # sandbox | production
ASAAS_WEBHOOK_TOKEN=xxx             # Token configurado no painel Asaas

# Market Data
BRAPI_API_KEY=xxx                   # Brapi (cotações BR)
YAHOO_FINANCE_API_KEY=xxx          # Yahoo Finance API
BCB_API_KEY=xxx                     # Banco Central do Brasil (taxas, IPCA)
RSS_NEWS_URL=xxx                    # URL do feed RSS de notícias

# App
NEXT_PUBLIC_APP_URL=https://appliquei.com.br
NEXT_PUBLIC_APP_NAME=Appliquei
```

---

*Documento gerado como parte da série de arquitectura da plataforma Appliquei SaaS.*
*Documentos relacionados: 01_VISAO_GERAL.md · 02_MODELO_DE_DADOS.md · 04_ARQUITETURA_DE_COMPONENTES.md*
