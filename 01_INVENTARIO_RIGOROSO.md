# 📋 Deliverable 1 — Inventário Rigoroso do Sistema

## Appliquei v13.0 — Sistema de Gestão Financeira Premium

> **Documento:** Arquitetura de Software — Inventário Completo  
> **Versão do Sistema:** 13.0  
> **Data de Análise:** Julho 2025  
> **Entregável:** 1 de 4 — Inventário Rigoroso  
> **Classificação:** Interno — Equipe de Engenharia

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Módulos Existentes](#2-módulos-existentes)
3. [Regras de Negócio Identificadas](#3-regras-de-negócio-identificadas)
4. [Integrações Externas](#4-integrações-externas)
5. [Armazenamento — localStorage Keys](#5-armazenamento--localstorage-keys)
6. [Design System](#6-design-system)
7. [Funções JavaScript — Catálogo Completo](#7-funções-javascript--catálogo-completo)

---

## 1. Visão Geral do Sistema

### 1.1 Arquitetura

| Atributo | Valor |
|---|---|
| **Tipo de Aplicação** | Single-Page Application (SPA) monolítica |
| **Formato** | Arquivo HTML único (~10.705 linhas) |
| **Stack** | HTML5 + CSS3 + JavaScript vanilla (ES6+) |
| **Renderização** | Client-side DOM manipulation (sem framework) |
| **Persistência** | 100% client-side — `localStorage` |
| **Servidor** | Nenhum — arquivo estático servido via HTTP/HTTPS |
| **Idioma da Interface** | Português brasileiro (pt-BR) |
| **Moeda** | Real brasileiro (BRL / R$) |
| **Localização** | Formatos de data/hora/number pt-BR |

### 1.2 Dependências Externas (CDN)

| Dependência | Versão | Uso |
|---|---|---|
| **Syne** (Google Fonts) | — | Tipografia principal — títulos, headings |
| **Figtree** (Google Fonts) | — | Tipografia de corpo — textos corridos |
| **DM Mono** (Google Fonts) | — | Tipografia monoespaçada — valores numéricos, código |
| **Phosphor Icons** | — | Sistema de ícones completo (outline + bold) |
| **Chart.js** | ^4.x | Gráficos: linha, pizza, doughnut, barras |
| **chartjs-plugin-datalabels** | ^2.x | Rótulos de dados nos gráficos |

### 1.3 Características Técnicas

| Característica | Detalhe |
|---|---|
| **Navegação SPA** | Menu lateral inferior (mobile) + sidebar (desktop) — 10 seções |
| **Dark Mode** | Toggle completo com variáveis CSS customizadas |
| **Responsividade** | 7 breakpoints adaptativos (desktop → mobile) |
| **Ocultação de Valores** | Blur CSS (desfoque) para privacidade financeira |
| **Backup/Restore** | Exportação/importação completa em JSON |
| **Offline-first** | Toda lógica client-side — funciona sem internet (exceto APIs externas) |
| **Cache Inteligente** | Dividendos e cotações em cache com TTL no localStorage |
| **Fallback de APIs** | Mecanismo `fetchComFallback` com timeout e estimativas |

### 1.4 Estrutura do Arquivo

```
index.html
├── <head>
│   ├── Meta tags (SEO, viewport, charset)
│   ├── Google Fonts (Syne, Figtree, DM Mono)
│   ├── Phosphor Icons CDN
│   ├── Chart.js + DataLabels CDN
│   └── <style> — ~3.200 linhas de CSS
├── <body>
│   ├── Sidebar / Navegação
│   ├── Seção: #patrimonio
│   ├── Seção: #controle
│   ├── Seção: #carteira
│   ├── Seção: #simulador
│   ├── Seção: #meus_sonhos
│   ├── Seção: #applicash
│   ├── Seção: #duvidas_sugestões
│   ├── Seção: #noticias
│   ├── Seção: #meu_patrimonio (placeholder)
│   ├── Seção: #relatorio_mensal (placeholder)
│   ├── Modais globais
│   ├── Drawers
│   └── <script> — ~7.500 linhas de JavaScript
```

---

## 2. Módulos Existentes

### 2.1 Matriz de Módulos

| # | Seção HTML | Nome de Exibição | Status | Linhas Est. |
|---|---|---|---|---|
| 1 | `#patrimonio` | Visão Geral do Patrimônio | ✅ ATIVO | ~1.800 |
| 2 | `#controle` | Controle Financeiro | ✅ ATIVO | ~2.400 |
| 3 | `#carteira` | Carteira Recomendada | ✅ ATIVO | ~1.200 |
| 4 | `#simulador` | Simule sua Liberdade | ✅ ATIVO | ~800 |
| 5 | `#meus_sonhos` | Meus Sonhos | ✅ ATIVO | ~1.400 |
| 6 | `#applicash` | Programa de Indicação | ✅ ATIVO | ~600 |
| 7 | `#duvidas_sugestões` | Dúvidas & Sugestões | ✅ ATIVO | ~500 |
| 8 | `#noticias` | Radar de Mercado | ✅ ATIVO | ~300 |
| 9 | `#meu_patrimonio` | Meu Patrimônio | 🔒 Em breve | ~50 |
| 10 | `#relatorio_mensal` | Relatório Mensal | 🔒 Em breve | ~50 |

---

### 2.2 Módulo: `#patrimonio` — Visão Geral do Patrimônio

**Status:** ✅ ATIVO  
**Responsável por:** Gestão completa do portfólio de investimentos

#### Sub-abas

| Sub-aba | Descrição |
|---|---|
| **Carteira** | Visão consolidada dos ativos e distribuição |
| **Operações** | Timeline de compras/vendas com filtros |
| **Dividendos** | Dashboard completo de proventos |

#### Componentes de UI — Aba Carteira

| Componente | Descrição |
|---|---|
| Gráfico de Evolução Patrimonial | Linha temporal com filtro por período (1M, 3M, 6M, 12M, Tudo) |
| Filtro por Tipo/Ativo | Dropdown de seleção para drill-down no gráfico |
| Gráfico Donut de Distribuição | Composição percentual da carteira |
| Card "Próximo Evento" | Próximo dividendo previsto |
| Rich Rows da Carteira | Avatar, ticker, nome, saldo, preço médio, sparkline SVG inline, lucro/prejuízo |
| Categorias Inferiores | Posição agrupada por categoria (RF, RV, Previdência, Reserva) |
| Filtro por Categoria | Tabs/botões: renda_variavel, renda_fixa, previdencia, reserva_emergencia |

#### Componentes de UI — Aba Operações

| Componente | Descrição |
|---|---|
| Timeline de Operações | Lista cronológica de compra/venda |
| Filtros | Todos, Compras, Vendas |
| Busca por Ticker | Input de busca textual |
| Exportação CSV | Botão para download de operações em formato CSV |

#### Componentes de UI — Aba Dividendos

| Componente | Descrição |
|---|---|
| KPIs Hero | Total recebido, 12 meses, YOC (Yield on Cost), Média mensal |
| Gráfico de Barras | Dividendos por mês |
| Ranking Top Pagadores | Lista dos ativos que mais pagam dividendos |
| Tabela por Ativo | Dividendos consolidados por ticker |
| Tabela Pagamentos Recentes | Últimos recebimentos com data e valor |
| Modal "Dividendos Previstos do Mês" | Overlay com projeção de proventos do mês atual |

#### Funções JavaScript Associadas

```javascript
// Renderização
renderizarGraficoEvolucao()
renderizarGraficoDistribuicao()
atualizarCarteiraAtivos()
renderizarOperacoes()
carregarDividendos()
atualizarKPIsResumo()

// Cálculos
calcularSerieEvolucao()
consolidarCarteiraNaData()
calcularDividendosRecebidos()

// Atualizações
atualizarProximoEvento()
atualizarCategoriasInferiores()
atualizarRankingDividendos()
exportarOperacoesCSV()
```

---

### 2.3 Módulo: `#controle` — Controle Financeiro

**Status:** ✅ ATIVO  
**Responsável por:** Orçamento pessoal, receitas, despesas e cartões de crédito

#### Componentes de UI

| Componente | Descrição |
|---|---|
| Navegação Mensal | Input `type=month` com setas anterior/próximo |
| KPIs Hero | Saldo livre (destaque), Receita, Despesas, Cartão de crédito, Investimentos |
| Alertas Contextuais | Contas vencidas (vermelho), vencendo hoje (amarelo), alerta cartão (kanban) |
| Banner Saldo Mês Anterior | Card com valor do carry-forward — botões aceitar/recusar/desfazer |
| Painel de Vencimentos | Grid de cards com contas a vencer no mês |
| Termômetro dos 60% | Barra progressiva + estatísticas + alerta contextual quando ultrapassa |
| Gráfico Pizza | Composição do mês (categorias de despesas) |
| Extrato Unificado | Tabs: Todos, Entradas, Saídas, Cartão, Investimentos |
| Formulário Novo Lançamento | Tipo (entrada/saída/cartão), categoria, valor, descrição, data, recorrência |
| Cartão de Crédito — Parcelas | Suporte a compra parcelada e fixo mensal |
| Faturas Agrupadas | Grupo de parcelas com opção de baixa em lote |
| Modal de Configuração | Metas verde/vermelha, cadastro de cartões (nome, dia fechamento, dia vencimento, limite) |
| Checkbox Recorrência | Marca lançamento como recorrente (replica mês a mês) |

#### Funções JavaScript Associadas

```javascript
// Navegação e renderização
atualizarTelaControle()
navegarMes(direcao)
inicializarControle()

// Cálculos orçamentários
calcularResumoMes(mes)
calcularResultadoMes(mes)
calcularDespesasFixas(mes)
calcularReceitas(mes)
calcularDespesasCartao(mes)

// Fluxo de caixa
aceitarSaldoMesAnterior()
recusarSaldoMesAnterior()
desfazerSaldoMesAnterior()
carregarSaldoMesAnterior()

// Termômetro 60%
atualizarTermometro60()
calcularPercentualDespesasFixas()

// Vencimentos
atualizarVencimentos()
verificarContasVencidas()
verificarContasVencendoHoje()

// Lançamentos
adicionarLancamento(tipo)
editarLancamento(id)
excluirLancamento(id)
marcarLancamentoPago(id)
toggleRecorrenciaLancamento(id)
processarLancamentosRecorrentes()

// Cartão de crédito
calcularFaturasMes(mes)
baixarGrupoFatura(grupoId)
calcularTotalCartaoMes(mes)
registrarCompraCartao(dados)

// Investimentos via controle
registrarAportePorPagamentoSonho(dados)

// Exportação
exportarExtratoMes(mes)
```

---

### 2.4 Módulo: `#carteira` — Carteira Recomendada

**Status:** ✅ ATIVO  
**Responsável por:** Recomendação de alocação baseada em perfil de investidor

#### Componentes de UI

| Componente | Descrição |
|---|---|
| Questionário Perfil Investidor | 5 perguntas com cálculo de score |
| Resultado do Perfil | Conservador / Moderado / Agressivo |
| Calculadora de Alocação | Input de capital + distribuição sugerida |
| Gráfico Donut | Carteira recomendada por classe |
| Gráfico Benchmark | Comparativo de performance vs benchmark |
| KPIs por Classe | RF, FIIs, Ações, ETFs, BDRs — percentual e valor |
| Risco Estimado | Indicador visual de risco da carteira |
| DY Médio | Dividend yield médio projetado |
| Alerta de Concentração | Warning quando uma classe ultrapassa limite |
| Asset Cards Enhanced | Cards de ativos com detalhes expandidos |
| Painel Admin (toggle) | Configuração da carteira modelo: mês/ano, perfil, tese macro, distribuição percentual, CRUD de ativos |

#### Funções JavaScript Associadas

```javascript
// Perfil
calcularPerfilInvestidor(respostas)
classificarPerfil(score)
exibirResultadoPerfil(perfil)

// Carteira recomendada
calcularCarteiraRecomendada(capital, perfil)
inferirClasse(ticker)
estimarDY(ticker)

// Renderização
renderizarGraficoDonut(dados)
renderizarGraficoBenchmark(dados)
renderizarKPIsCarteira(dados)
renderizarAssetCards(ativos)
renderizarAlertaConcentracao(dados)

// Admin
toggleModoAdmin()
salvarCarteiraAdmin(dados)
carregarCarteiraCliente()
adicionarAtivoAdmin(ativo)
removerAtivoAdmin(ticker)
exportarCarteiraAdmin()
importarCarteiraAdmin(json)
```

---

### 2.5 Módulo: `#simulador` — Simule sua Liberdade

**Status:** ✅ ATIVO  
**Responsável por:** Simulação de juros compostos e projeção de independência financeira

#### Componentes de UI

| Componente | Descrição |
|---|---|
| Parâmetros de Entrada | Capital inicial, aporte mensal, inflação (% a.a.), taxa juros (%), período |
| Busca Inflação BCB | Botão/botão automático que busca IPCA do Banco Central |
| Card Hero | Diferença investindo vs INSS + renda passiva estimada (regra 0,8% a.m.) |
| Paralelo Visual | Duas colunas: Investindo (juros compostos) vs INSS (3% a.a. corrigido) |
| Detalhamento Numérico | Montante final, poder de compra real, total investido, juros gerados, rentabilidade, renda passiva |
| Gráficos Pizza | Composição do patrimônio e distribuição INSS |
| Gráfico Comparativo | Evolução patrimonial ao longo do tempo (linha) |
| Tabela Expansível | Colunas: Mês, Aporte acumulado, Juros do mês, Juros acumulados, Patrimônio total |
| Ponto de Inflexão | Indicador do mês em que juros > aportes |
| Toggle Tabela | Botão para expandir/recolher a tabela detalhada |

#### Funções JavaScript Associadas

```javascript
// Cálculos
calcularSimulador(params)
calcularJurosCompostos(capital, aporte, taxa, meses)
calcularProjecaoINSS(capital, aporte, meses)
calcularRendaPassiva(patrimonio, taxa)
calcularPontoInflexao(dados)
calcularPoderCompraReal(valor, inflacao, anos)

// Inflação
buscarInflacaoBCB()
sincronizarInflacao()

// Renderização
renderizarGraficoComparativo(dados)
renderizarGraficosPizza(dados)
renderizarTabelaSimulacao(dados)
renderizarPontoInflexao(dados)
toggleTabelaSim()

// Formatação
formatarMesAno(mesIndex)
exportarSimulacaoCSV(dados)
```

---

### 2.6 Módulo: `#meus_sonhos` — Meus Sonhos / Dream Planner

**Status:** ✅ ATIVO  
**Responsável por:** Planejamento de metas financeiras com aportes e saúde financeira

#### Componentes de UI

| Componente | Descrição |
|---|---|
| KPI Grid | Total acumulado, sonhos ativos, conquistados, mensalidade total, saúde geral |
| Barra Progresso Geral | Progressão percentual com efeito shimmer |
| Cards "Tempo para Conquistar" | Urgência visual: alta (vermelho), média (amarelo), baixa (verde), conquistado (check) |
| Sonho Card Expandido | Progress ring SVG, stats mini, passos conquistados, timeline de aportes |
| Aportes | Tipos: inicial, esporádico, migração, mensal, aporte — com edição e exclusão |
| Diálogo "Origem do Aporte" | Escolha: saldo livre ou migrar de investimento |
| Migração de Investimento | Reduz posição de ativo no patrimônio para aporte no sonho |
| Painel de Saúde Financeira | Análise de viabilidade + plano sugerido |
| Níveis de Esforço | Leve, moderado, intenso — cálculo de mensalidade necessária |
| Categorias | viagem, veículo, imóvel, educação, casamento, reserva, tech, saúde, outro |
| Status | ativo, agendado, conquistado, vencido |
| Banner Agendado | Borda dashed para sonhos com data futura |
| Efeito "CONQUISTADO!" | Ribbon visual de celebração |

#### Funções JavaScript Associadas

```javascript
// Renderização
renderizarSonhos()
renderResumoSonhos()
renderPainelSaudeSonhos()
renderTimelineAportes(sonhoId)
renderizarCardsTempoConquistar()
renderizarProgressBarGeral()

// CRUD
salvarSonho(dados)
editarSonho(id, dados)
excluirSonho(id)
finalizarSonho(id)

// Aportes
registrarAporteSonho(sonhoId, aporte)
editarAporteSonho(sonhoId, aporteId, dados)
excluirAporteSonho(sonhoId, aporteId)
finalizarAporteSonho(sonhoId, aporteId)

// Migração
perguntarOrigemAporte(sonhoId)
migrarAporteInvestimento(sonhoId, aporte)
reduzirPosicaoAtivo(ticker, valor)

// Saúde Financeira
analisarSaudeFinanceiraSonhos()
gerarPlanoSugerido(sonhoId)
calcularEsforcoNecessario(sonho)
calcularTempoConquista(sonho)

// Helpers
calcularTotalAcumulado()
calcularMensalidadeTotal()
classificarUrgencia(sonho)
```

---

### 2.7 Módulo: `#applicash` — Programa de Indicação

**Status:** ✅ ATIVO  
**Responsável por:** Sistema de indicação com recompensas recorrentes

#### Componentes de UI

| Componente | Descrição |
|---|---|
| KPIs | Indicações efetivas, cupom ativo, "você paga", "você recebe" |
| Gráfico Pizza | Proporção paga vs recebe |
| Cenário com Frase | Texto explicativo do ganho atual |
| Meta Progressiva | Barra com marcos (5, 10, 20 indicações) |
| Tabela "Minhas Indicações" | Nome mascarado, plano, valor, periodicidade, lucro, status |
| Cupom | Gerar, copiar para clipboard, compartilhar (Web Share API) |
| Como Funciona | 3 passos ilustrados |
| Regras | 10% desconto indicado + 10% crédito recorrente ao indicador |

#### Funções JavaScript Associadas

```javascript
gerarCupomPadrao()
obterCupomApplicash()
obterAssinaturaApplicash()
carregarIndicacoesApplicash()
mascararNome(nome)
atualizarTelaApplicash()
copiarCupomApplicash()
compartilharCupomApplicash()
calcularCreditoRecorrente(indicacoes)
atualizarMetaProgressiva()
```

---

### 2.8 Módulo: `#duvidas_sugestões` — Dúvidas & Sugestões

**Status:** ✅ ATIVO  
**Responsável por:** FAQ interativo e canal de feedback

#### Componentes de UI

| Componente | Descrição |
|---|---|
| Tabs de Navegação | FAQ e Sugestão |
| FAQ com Busca | Input de busca textual em tempo real |
| Filtro por Categoria | conta, patrimonio, controle, ferramentas, applicash, dados |
| Perguntas Expansíveis | Accordion com respostas |
| Formulário Sugestão | Aba relacionada, tipo (melhoria/novo/bug), texto (1000 chars) |
| Histórico de Sugestões | Lista das enviadas com data e status |

#### Funções JavaScript Associadas

```javascript
renderizarFaq()
filtrarFaq(termo, categoria)
trocarTabDuvidas(tab)
selecionarTipoSugestao(tipo)
enviarSugestao(dados)
renderizarHistoricoSugestoes()
buscarPerguntaFaq(id)
```

---

### 2.9 Módulo: `#noticias` — Radar de Mercado / Info Mercado

**Status:** ✅ ATIVO  
**Responsável por:** Agregação de notícias financeiras

#### Componentes de UI

| Componente | Descrição |
|---|---|
| Feed de Notícias | Grid de cards com imagem, título, resumo, fonte e data |
| Loader | Indicador de carregamento durante fetch |
| Link Externo | Abre artigo no site de origem (target _blank) |

#### Funções JavaScript Associadas

```javascript
carregarNoticias()
filtrarNoticias(termo)
```

---

### 2.10 Módulo: `#meu_patrimonio` — Meu Patrimônio

**Status:** 🔒 EM BREVE  
**Descrição:** Placeholder reservado para futura funcionalidade de visão patrimonial avançada.

---

### 2.11 Módulo: `#relatorio_mensal` — Relatório Mensal

**Status:** 🔒 EM BREVE  
**Descrição:** Placeholder reservado para futura funcionalidade de relatórios periódicos.

---

## 3. Regras de Negócio Identificadas

### 3.1 Cotações e Preços

| Regra | Detalhe |
|---|---|
| **Fonte de Cotações** | Yahoo Finance via proxy CORS |
| **Timeout de Requisição** | Limite configurado (padrão ~5s) |
| **Fallback** | `fetchComFallback()` — tenta proxy primário, secundário e preço estimado |
| **Lote de Tickers** | Busca em lote para otimizar chamadas de API |
| **Preço Estimado** | Quando todas as fontes falham, utiliza último preço conhecido ou média do período |
| **Cache** | Cotações ficam em cache com TTL definido no localStorage |

### 3.2 Taxas e Índices — Banco Central do Brasil

| Regra | Detalhe |
|---|---|
| **Taxa Selic/CDI** | Busca via API pública do BCB |
| **IPCA (Inflação)** | Busca via API pública do BCB para o simulador |
| **Sincronização** | Atualização automática ao abrir o simulador |
| **Fallback** | Valor padrão hardcoded quando API indisponível |

### 3.3 Dividendos

| Regra | Detalhe |
|---|---|
| **Fonte Primária** | Brapi API — dividendos de ativos brasileiros |
| **Fonte Secundária** | Yahoo Finance — dividendos internacionais e fallback |
| **Cache** | Armazenado em `localStorage` com chave por ticker |
| **Inferência de Frequência** | Detecta padrão mensal, trimestral, semestral ou anual |
| **Previsão** | Calcula dividendos previstos do mês baseado na frequência |
| **YOC (Yield on Cost)** | Dividend Yield calculado sobre o preço médio de compra |

### 3.4 Previdência Privada

| Regra | Detalhe |
|---|---|
| **Aportes Recorrentes** | Geram lançamentos futuros automáticos no Controle Financeiro |
| **Juros Compostos** | Cálculo mensal com base na taxa contratada |
| **Projeção** | Estima valor acumulado até a data de resgate |
| **Integração** | Aparece no Patrimônio como categoria `previdencia` |

### 3.5 Renda Fixa

| Regra | Detalhe |
|---|---|
| **Parsing de Rentabilidade** | Interpreta textos como "110% CDI", "IPCA+6%", "12% a.a." |
| **Projeção** | Calcula valor futuro com base na rentabilidade e prazo |
| **Preview no Drawer** | Drawer lateral mostra detalhamento da aplicação |
| **Categorização** | Agrupada como `renda_fixa` no patrimônio |

### 3.6 Controle Financeiro — Regras Orçamentárias

| Regra | Detalhe |
|---|---|
| **Regra dos 60%** | Despesas fixas devem ser ≤ 60% da receita total |
| **Meta Verde** | Valor alvo de economia mensal (configurável) |
| **Meta Vermelha** | Valor limite de gastos mensal (configurável) |
| **Carry-forward** | Saldo do mês anterior pode ser aceito/recusado/desfazido |
| **Recorrência** | Lançamentos marcados como recorrentes são replicados automaticamente |
| **Alertas** | Vencidas (vermelho), vencendo hoje (amarelo), cartão (kanban) |

### 3.7 Cartões de Crédito

| Regra | Detalhe |
|---|---|
| **Dia de Fechamento** | Configurável por cartão |
| **Dia de Vencimento** | Configurável por cartão |
| **Limite** | Valor máximo configurável |
| **Parcelas** | Suporte a compra parcelada (N vezes) e fixo mensal |
| **Faturas Agrupadas** | Parcelas do mesmo lançamento são agrupadas |
| **Baixa em Grupo** | Marca todas as parcelas como pagas de uma vez |

### 3.8 Simulador

| Regra | Detalhe |
|---|---|
| **Juros Compostos** | Fórmula padrão: `M = C × (1 + i)^n` |
| **INSS** | Projeção com correção de 3% a.a. |
| **Inflação** | Desconta IPCA do poder de compra |
| **Ponto de Inflexão** | Mês em que os juros acumulados superam o total de aportes |
| **Renda Passiva** | Estimada pela regra de 0,8% ao mês sobre o patrimônio |
| **Taxa em Mês ou Ano** | Toggle para converter entre % a.m. e % a.a. |

### 3.9 Sonhos / Dream Planner

| Regra | Detalhe |
|---|---|
| **Análise de Saúde** | Avalia viabilidade baseada em aportes vs tempo necessário |
| **Plano Sugerido** | Gera recomendação com nível de esforço (leve/moderado/intenso) |
| **Migração de Investimento** | Permite migrar valor de ativo do patrimônio como aporte |
| **Tipos de Aporte** | inicial, esporádico, migração, mensal, aporte |
| **Progress Ring** | SVG circular com percentual de conclusão |
| **Urgência** | Alta (< 6 meses), média (6-24 meses), baixa (> 24 meses), conquistado |

### 3.10 Applicash — Programa de Indicação

| Regra | Detalhe |
|---|---|
| **Cupom Único** | Cada usuário possui um cupom exclusivo |
| **Desconto ao Indicado** | 10% na primeira cobrança |
| **Crédito ao Indicador** | 10% do valor recorrente enquanto o indicado for assinante ativo |
| **Nome Mascarado** | Exibe apenas iniciais para privacidade |
| **Meta Progressiva** | Marcos em 5, 10, 20 indicações com recompensas |

### 3.11 Carteira Recomendada

| Regra | Detalhe |
|---|---|
| **Perfil Investidor** | Questionário de 5 perguntas → conservador/moderado/agressivo |
| **Alocação por Classe** | Distribuição sugerida baseada no perfil |
| **Concentração** | Alerta quando uma classe ultrapassa porcentagem segura |
| **Admin Toggle** | Painel administrativo para configurar carteira modelo |

### 3.12 Regras Transversais

| Regra | Detalhe |
|---|---|
| **Mascaramento de Valores** | Blur CSS (`filter: blur()`) para ocultar valores financeiros |
| **Dark Mode** | Toggle completo com 2 paletas de variáveis CSS |
| **Backup/Restore** | Exportação/importação de todo o estado em JSON |
| **Formatação BRL** | `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` |
| **Formato de Data** | `Intl.DateTimeFormat('pt-BR', { ... })` |

---

## 4. Integrações Externas

### 4.1 Mapa de Integrações

```
┌──────────────────────────────────────────────────────────┐
│                    APPLIQUEI v13.0                       │
│                  (Browser — Client)                      │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐ │
│  │ Patrim. │  │ Controle │  │ Simulad.│  │  Notícias │ │
│  └────┬────┘  └──────────┘  └────┬────┘  └─────┬─────┘ │
│       │                         │             │        │
│       ▼                         ▼             ▼        │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Camada de Integração                │   │
│  │  fetchComFallback() + cache localStorage         │   │
│  └────────┬──────────┬──────────┬────────┬──────────┘   │
│           │          │          │        │              │
│     ┌─────▼────┐ ┌──▼────┐ ┌───▼───┐ ┌──▼────────┐    │
│     │  Yahoo   │ │  BCB  │ │ Brapi │ │ RSS Feeds │    │
│     │ Finance  │ │  API  │ │  API  │ │ (notícias)│    │
│     └──────────┘ └───────┘ └───────┘ └───────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Chart.js + chartjs-plugin-datalabels (CDN)      │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Detalhamento por Integração

| Integração | Endpoint / Fonte | Protocolo | Uso no Sistema | Fallback |
|---|---|---|---|---|
| **Yahoo Finance** | `query1.finance.yahoo.com/v8/finance/chart/` via proxy CORS | HTTPS REST | Cotações em tempo real, dividendos, dados históricos | Último preço cache, preço estimado |
| **Banco Central do Brasil** | `api.bcb.gov.br/api/dados/v1/` | HTTPS REST | Taxa Selic, CDI, IPCA | Valor hardcoded |
| **Brapi API** | `brapi.dev/api/quote/` | HTTPS REST | Dividendos de ativos brasileiros | Yahoo Finance como fallback |
| **RSS Feeds** | Múltiplas fontes de notícias financeiras | HTTP GET | Feed de notícias do Radar de Mercado | Loader infinito |
| **Chart.js** | CDN (static) | — | Renderização de gráficos (linha, pizza, doughnut, barras) | N/A |
| **chartjs-plugin-datalabels** | CDN (static) | — | Rótulos nos gráficos | N/A |

### 4.3 Mecanismo fetchComFallback

```javascript
// Pseudocódigo do mecanismo de resiliência
async function fetchComFallback(url, opcoes) {
    // 1. Tenta proxy primário com timeout
    try {
        const response = await Promise.race([
            fetch(proxyPrimario + url, opcoes),
            timeout(TIMEOUT_PRIMARIO)
        ]);
        if (response.ok) return await response.json();
    } catch (e) { /* falha silenciosa */ }

    // 2. Tenta proxy secundário
    try {
        const response = await fetch(proxySecundario + url, opcoes);
        if (response.ok) return await response.json();
    } catch (e) { /* falha silenciosa */ }

    // 3. Retorna cache ou valor estimado
    return obterCacheOuEstimativa(url);
}
```

---

## 5. Armazenamento — localStorage Keys

### 5.1 Mapa Completo de Chaves

| Chave localStorage | Tipo | Descrição | Módulo |
|---|---|---|---|
| `futurorico_metaVerde` | `number` | Meta de economia mensal (R$) | Controle |
| `futurorico_metaVermelha` | `number` | Limite de gastos mensal (R$) | Controle |
| `futurorico_saldoCarregado` | `object` (map) | Mapa `{ "YYYY-MM": number }` de saldos aceitos | Controle |
| `futurorico_transacoes` | `array` | Lista de transações (receitas, despesas, cartão, investimentos) | Controle |
| `futurorico_cartoes` | `array` | Cadastro de cartões de crédito | Controle |
| `futurorico_historicoCompras` | `array` | Operações de compra/venda de investimentos | Patrimônio |
| `futurorico_sonhos` | `array` | Lista de sonhos com aportes | Sonhos |
| `futurorico_sugestoes` | `array` | Histórico de sugestões enviadas | Dúvidas |
| `futurorico_applicash_cupom` | `string` | Cupom de indicação do usuário | Applicash |
| `futurorico_applicash_indicacoes` | `array` | Lista de indicações efetuadas | Applicash |
| `futurorico_applicash_assinatura` | `object` | Dados da assinatura do plano | Applicash |
| `futurorico_dividendos_*` | `object` (map) | Cache de dividendos por ticker (sufixo variável) | Patrimônio |
| `futurorico_cotacoes_*` | `object` (map) | Cache de cotações por ticker (sufixo variável) | Patrimônio |
| `futurorico_snapshotsCarteira` | `array` | Snapshots mensais da carteira para gráfico de evolução | Patrimônio |
| `futurorico_carteiraAdmin` | `object` | Configuração da carteira modelo (painel admin) | Carteira |
| `futurorico_mockAtivosMercado` | `array` | Mock de ativos de mercado (preview/demo) | Carteira |
| `futurorico_inflacao` | `object` | Cache de IPCA (valor + data de busca) | Simulador |
| `appliquei_valores_ocultos` | `boolean` | Preferência de ocultação de valores (blur) | Global |
| `appliquei_carteira_extras` | `array` | Colunas extras visíveis na carteira | Patrimônio |
| `appliquei_darkMode` | `boolean` | Estado do tema (claro/escuro) | Global |
| `appliquei_sonhos_admin` | `object` | Configurações de sonhos (admin) | Sonhos |

### 5.2 Convenção de Nomenclatura

- **Prefixo `futurorico_`**: Dados de domínio financeiro (legado do nome original da marca)
- **Prefixo `appliquei_`**: Preferências e configurações de UI
- **Sufixo `_cache` ou implícito**: Dados de cache com TTL

### 5.3 Estimativa de Consumo

| Categorias | Chaves ~ | Tamanho Estimado |
|---|---|---|
| Dados de domínio | 10–15 | 50–500 KB (depende do uso) |
| Cache de APIs | Dinâmico | 100–300 KB |
| Preferências | 3–5 | < 5 KB |
| **Total estimado** | **~20 chaves** | **< 1 MB** |

> ⚠️ **Nota:** O `localStorage` possui limite de ~5 MB por origem. O sistema está dentro de limites seguros para uso normal.

---

## 6. Design System

### 6.1 Tipografia

| Fonte | Uso | Peso | Tamanhos |
|---|---|---|---|
| **Syne** | Títulos, headings, marca | 600–800 | 24px, 28px, 32px, 40px |
| **Figtree** | Corpo de texto, labels, botões | 400–600 | 12px, 13px, 14px, 16px, 18px |
| **DM Mono** | Valores numéricos, código, tags | 400–500 | 12px, 13px, 14px, 16px |

### 6.2 Paleta de Cores — Light Mode

| Variável CSS | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Background principal |
| `--bg-secondary` | `#F8F9FA` | Background secundário, cards |
| `--bg-tertiary` | `#F0F2F5` | Background terciário, hover states |
| `--text-primary` | `#1A1D23` | Texto principal |
| `--text-secondary` | `#6B7280` | Texto secundário |
| `--text-tertiary` | `#9CA3AF` | Texto placeholder, hints |
| `--accent-green` | `#22C55E` | Positivo, ganhos, receitas |
| `--accent-red` | `#EF4444` | Negativo, perdas, despesas |
| `--accent-blue` | `#3B82F6` | Destaque, links, ações |
| `--accent-purple` | `#8B5CF6` | Investimentos, premium |
| `--accent-orange` | `#F59E0B` | Alertas, avisos, cartão |
| `--accent-pink` | `#EC4899` | Sonhos, indicadores especiais |
| `--border-color` | `#E5E7EB` | Bordas de cards e divisores |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Sombras leves |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Sombras médias |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Sombras elevadas |

### 6.3 Paleta de Cores — Dark Mode

| Variável CSS | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#0F1117` | Background principal |
| `--bg-secondary` | `#1A1D28` | Background secundário, cards |
| `--bg-tertiary` | `#252836` | Background terciário, hover states |
| `--text-primary` | `#F9FAFB` | Texto principal |
| `--text-secondary` | `#9CA3AF` | Texto secundário |
| `--text-tertiary` | `#6B7280` | Texto placeholder |
| `--accent-green` | `#34D399` | Positivo (versão clara) |
| `--accent-red` | `#F87171` | Negativo (versão clara) |
| `--accent-blue` | `#60A5FA` | Destaque (versão clara) |
| `--accent-purple` | `#A78BFA` | Investimentos (versão clara) |
| `--accent-orange` | `#FBBF24` | Alertas (versão clara) |
| `--border-color` | `#2D3041` | Bordas em dark |

### 6.4 Border Radius

| Classe / Uso | Valor |
|---|---|
| Cards | `12px` / `16px` |
| Botões | `8px` / `10px` |
| Inputs | `8px` |
| Modais | `16px` / `20px` |
| Tags/Badges | `20px` (pill) |
| Avatares | `50%` (círculo) |

### 6.5 Sombras

| Nível | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards inline, dividers |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards elevados, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modais, drawers, popovers |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Modais full-screen |

### 6.6 Transições e Animações

| Propriedade | Valor | Uso |
|---|---|---|
| `transition-all` | `0.2s ease` | Hover em cards e botões |
| `transition-transform` | `0.3s ease` | Micro-interações |
| `transition-opacity` | `0.3s ease` | Fade in/out de seções |
| `@keyframes shimmer` | `background-position` | Barra de progresso com brilho |
| `@keyframes fadeIn` | `opacity 0 → 1` | Entrada de componentes |
| `@keyframes slideUp` | `translateY(20px) → 0` | Entrada de modais |
| `@keyframes pulse` | `scale(1) → scale(1.05)` | KPIs em destaque |
| `@keyframes ribbon` | — | Efeito "CONQUISTADO!" |

### 6.7 Grid e Layout

| Sistema | Configuração |
|---|---|
| **Sidebar Desktop** | `width: 260px`, fixa à esquerda |
| **Sidebar Mobile** | Bottom navigation bar, `height: 60px` |
| **Content Area** | `margin-left: 260px` (desktop), `margin-bottom: 60px` (mobile) |
| **KPI Grid** | CSS Grid, `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` |
| **Card Grid** | CSS Grid, `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` |
| **Form Layout** | Flexbox, `flex-direction: column`, `gap: 16px` |

### 6.8 Breakpoints Responsivos

| Breakpoint | Dispositivo | Alterações Principais |
|---|---|---|
| `> 1024px` | Desktop | Sidebar visível, grid multicolumna |
| `≤ 1024px` | Tablet landscape | Sidebar colapsa, grid 2 colunas |
| `≤ 980px` | Tablet portrait | Layout compacto, fontes menores |
| `≤ 900px` | Tablet pequeno | Cards empilhados, tabela scroll horizontal |
| `≤ 860px` | Mobile grande | Menu bottom nav, drawer full-width |
| `≤ 768px` | Mobile padrão | Single column, touch-optimized |
| `≤ 600px` | Mobile pequeno | KPIs scroll horizontal, badges compactos |

### 6.9 Componentes Visuais Reutilizáveis

| Componente | Descrição | Classes / Padrão |
|---|---|---|
| **Card** | Container elevado com sombra e borda | `.card`, `.card-elevated` |
| **KPI Card** | Card com label, valor grande e indicador | `.kpi-card`, `.kpi-value` |
| **Tag/Badge** | Rótulo inline com cor de fundo | `.tag`, `.tag-green`, `.tag-red` |
| **Button Primary** | Botão principal com gradiente | `.btn-primary` |
| **Button Secondary** | Botão outline | `.btn-secondary` |
| **Button Ghost** | Botão sem fundo | `.btn-ghost` |
| **Input** | Campo de entrada estilizado | `.input`, `.input-search` |
| **Tabs** | Navegação por abas | `.tabs`, `.tab-active` |
| **Modal** | Overlay centralizado | `.modal-overlay`, `.modal-content` |
| **Drawer** | Painel lateral deslizante | `.drawer-overlay`, `.drawer-panel` |
| **Toast** | Notificação temporária | `.toast`, `.toast-success` |
| **Progress Bar** | Barra de progresso horizontal | `.progress-bar`, `.progress-fill` |
| **Progress Ring** | Anel de progresso SVG | SVG inline com `stroke-dasharray` |
| **Sparkline** | Mini gráfico inline | SVG polyline inline |
| **Accordion** | Item expansível | `.accordion-item`, `.accordion-content` |
| **Shimmer** | Efeito de carregamento | `.shimmer`, `@keyframes shimmer` |
| **Blur Value** | Valor mascarado | `.valor-oculto { filter: blur(8px); }` |

---

## 7. Funções JavaScript — Catálogo Completo

### 7.1 Resumo por Módulo

| Módulo | Qtde. Funções | Categoria |
|---|---|---|
| Patrimônio (`#patrimonio`) | ~28 | Renderização, cálculos, API, exportação |
| Controle Financeiro (`#controle`) | ~32 | CRUD, cálculos, recorrência, cartão |
| Carteira Recomendada (`#carteira`) | ~18 | Perfil, alocação, admin, renderização |
| Simulador (`#simulador`) | ~14 | Cálculos, inflação, renderização |
| Meus Sonhos (`#meus_sonhos`) | ~26 | CRUD, aportes, saúde, migração |
| Applicash (`#applicash`) | ~10 | Cupom, indicações, cálculo |
| Dúvidas & Sugestões (`#duvidas_sugestões`) | ~7 | FAQ, sugestões, filtro |
| Notícias (`#noticias`) | ~2 | Feed, filtro |
| Utilitários Globais | ~25 | Formatação, storage, navegação, backup |
| Event Listeners / Init | ~15 | Setup, routing, listeners |
| **TOTAL** | **~177** | — |

---

### 7.2 Patrimônio — `#patrimonio` (~28 funções)

```javascript
// ── Renderização ──────────────────────────────────────────
renderizarPatrimonio()              // Render principal da seção
renderizarGraficoEvolucao(periodo)  // Gráfico linha — evolução patrimonial
renderizarGraficoDistribuicao()     // Gráfico donut — composição da carteira
atualizarCarteiraAtivos()           // Lista de ativos com rich rows
atualizarCategoriasInferiores()     // Posição por categoria
atualizarKPIsResumo()               // KPIs da aba Carteira
renderizarOperacoes(filtro, busca)  // Timeline de operações
carregarDividendos()                // Dashboard de dividendos
atualizarProximoEvento()            // Card próximo dividendo
atualizarRankingDividendos()        // Ranking top pagadores
renderizarTabelaDividendosPorAtivo() // Tabela consolidada
renderizarPagamentosRecentes()      // Últimos recebimentos
renderizarDividendosPrevistosMes()  // Modal de previsão mensal

// ── Cálculos ──────────────────────────────────────────────
calcularSerieEvolucao(periodo)      // Série temporal do patrimônio
consolidarCarteiraNaData(data)      // Snapshot da carteira em data específica
calcularDividendosRecebidos()       // Total de dividendos por período
calcularYOC(ticker, custoMedio)     // Yield on Cost por ativo
inferirFrequenciaDividendo(ticker)  // Detecta periodicidade de pagamentos
calcularValorTotalCarteira()        // Soma de todos os ativos
calcularLucroPrejuizo(ticker)       // Resultado por posição

// ── API e Dados ───────────────────────────────────────────
buscarCotacoesBatch(tickers)        // Cotações em lote
fetchComFallback(url, opcoes)       // Fetch com timeout e fallback
obterCotacao(ticker)                // Cotação individual com cache
buscarDividendosBrapi(ticker)       // Dividendos via Brapi
buscarDividendosYahoo(ticker)       // Dividendos via Yahoo
cacheDividendos(ticker, dados)      // Cache de dividendos no localStorage
obterDividendosCache(ticker)        // Leitura de cache

// ── Exportação ────────────────────────────────────────────
exportarOperacoesCSV()              // Download CSV de operações

// ── Filtros ───────────────────────────────────────────────
filtrarCarteiraPorCategoria(cat)    // Filtro de categoria
filtrarEvolucaoPorTipo(tipo)        // Filtro por tipo de ativo
```

---

### 7.3 Controle Financeiro — `#controle` (~32 funções)

```javascript
// ── Navegação e Inicialização ─────────────────────────────
atualizarTelaControle()             // Render completo do mês atual
navegarMes(direcao)                 // Avançar/retroceder mês
inicializarControle()               // Setup da seção ao carregar

// ── Cálculos Orçamentários ────────────────────────────────
calcularResumoMes(mes)              // Resumo geral do mês
calcularResultadoMes(mes)           // Receita - Despesa
calcularReceitas(mes)               // Total de entradas
calcularDespesas(mes)               // Total de saídas
calcularDespesasFixas(mes)          // Despesas recorrentes
calcularDespesasCartao(mes)         // Total de cartão
calcularInvestimentos(mes)          // Total de investimentos
calcularSaldoLivre(mes)             // Saldo disponível

// ── Carry-forward ─────────────────────────────────────────
carregarSaldoMesAnterior()          // Detecta pendência de aceite
aceitarSaldoMesAnterior()           // Aplica saldo do mês anterior
recusarSaldoMesAnterior()           // Ignora saldo
desfazerSaldoMesAnterior()          // Reverte aceite

// ── Termômetro 60% ────────────────────────────────────────
atualizarTermometro60()             // Calcula e renderiza barra
calcularPercentualDespesasFixas(mes)// % das fixas sobre receita
renderizarAlertaTermometro(pct)     // Alerta contextual

// ── Vencimentos ───────────────────────────────────────────
atualizarVencimentos()              // Grid de contas a vencer
verificarContasVencidas()           // Alerta contas vencidas
verificarContasVencendoHoje()       // Alerta contas vencendo hoje

// ── CRUD Lançamentos ──────────────────────────────────────
adicionarLancamento(tipo, dados)    // Cria nova transação
editarLancamento(id, dados)         // Atualiza transação
excluirLancamento(id)               // Remove transação
marcarLancamentoPago(id)            // Marca como pago/não pago
toggleRecorrenciaLancamento(id)     // Ativa/desativa recorrência
processarLancamentosRecorrentes(mes)// Replica recorrentes no mês

// ── Cartão de Crédito ─────────────────────────────────────
calcularFaturasMes(mes)             // Lista faturas do mês
baixarGrupoFatura(grupoId)          // Marca grupo como pago
calcularTotalCartaoMes(mes)         // Soma de cartão
registrarCompraCartao(dados)        // Nova compra parcelada/fixa
configurarCartao(dados)             // CRUD de cartões
atualizarAlertaCartao()             // Alerta kanban de limite

// ── Investimentos via Controle ────────────────────────────
registrarAportePorPagamentoSonho()  // Aporte como pagamento de sonho

// ── Gráficos ──────────────────────────────────────────────
renderizarGraficoComposicao(mes)    // Gráfico pizza de categorias
renderizarExtrato(filtros)          // Extrato com tabs

// ── Configuração ──────────────────────────────────────────
salvarMetasConfig(verde, vermelha)  // Persiste metas
carregarMetasConfig()               // Lê metas salvas
exportarExtratoMes(mes)             // Download do extrato
```

---

### 7.4 Carteira Recomendada — `#carteira` (~18 funções)

```javascript
// ── Questionário ──────────────────────────────────────────
calcularPerfilInvestidor(respostas) // Score de 0-10
classificarPerfil(score)            // Mapeia para conservador/moderado/agressivo
exibirResultadoPerfil(perfil)       // Renderiza resultado

// ── Carteira ──────────────────────────────────────────────
calcularCarteiraRecomendada(capital, perfil) // Alocação sugerida
inferirClasse(ticker)               // Classifica RF/FII/Ação/ETF/BDR
estimarDY(ticker)                   // Estima dividend yield

// ── Renderização ──────────────────────────────────────────
renderizarGraficoDonut(dados)       // Donut de classes
renderizarGraficoBenchmark(dados)   // Comparativo de performance
renderizarKPIsCarteira(dados)       // KPIs por classe
renderizarAssetCards(ativos)        // Cards de ativos
renderizarAlertaConcentracao(dados) // Warning de concentração
renderizarCalculadora()             // Interface de input de capital

// ── Admin ─────────────────────────────────────────────────
toggleModoAdmin()                   // Mostra/esconde painel admin
salvarCarteiraAdmin(dados)          // Persiste carteira modelo
carregarCarteiraAdmin()             // Lê carteira modelo
adicionarAtivoAdmin(ativo)          // Adiciona ativo à carteira modelo
removerAtivoAdmin(ticker)           // Remove ativo da carteira modelo
atualizarDistribuicaoAdmin()        // Recalcula percentuais
exportarCarteiraAdmin()             // Exporta configuração
```

---

### 7.5 Simulador — `#simulador` (~14 funções)

```javascript
// ── Cálculos ──────────────────────────────────────────────
calcularSimulador(params)           // Processa simulação completa
calcularJurosCompostos(cap, aporte, taxa, n) // Fórmula composta
calcularProjecaoINSS(cap, aporte, n)// Projeção com 3% a.a.
calcularRendaPassiva(patrimonio)    // 0,8% a.m. do patrimônio
calcularPontoInflexao(dados)        // Mês em que juros > aportes
calcularPoderCompraReal(valor, inflacao, anos) // Desconta inflação
converterTaxaAnualParaMensal(taxaAnual) // Conversão de taxa

// ── Inflação ──────────────────────────────────────────────
buscarInflacaoBCB()                 // IPCA via API do BCB
sincronizarInflacao()               // Atualiza e cacheia

// ── Renderização ──────────────────────────────────────────
renderizarGraficoComparativo(dados) // Gráfico de evolução
renderizarGraficosPizza(dados)      // Pizza patrimônio e INSS
renderizarTabelaSimulacao(dados)    // Tabela expansível
renderizarPontoInflexao(dados)      // Indicador visual
renderizarCardHero(dados)           // Diferença investindo vs INSS

// ── Interação ─────────────────────────────────────────────
toggleTabelaSim()                   // Expandir/recolher tabela
exportarSimulacaoCSV(dados)         // Download da simulação
```

---

### 7.6 Meus Sonhos — `#meus_sonhos` (~26 funções)

```javascript
// ── Renderização ──────────────────────────────────────────
renderizarSonhos()                  // Lista de sonhos
renderResumoSonhos()                // KPIs do resumo geral
renderPainelSaudeSonhos()           // Painel de análise financeira
renderTimelineAportes(sonhoId)      // Histórico de aportes
renderizarCardsTempoConquistar()    // Cards com urgência
renderizarProgressBarGeral()        // Barra shimmer geral
renderizarCardSonhoExpandido(sonho) // Detalhes completos do sonho

// ── CRUD Sonhos ───────────────────────────────────────────
salvarSonho(dados)                  // Cria novo sonho
editarSonho(id, dados)              // Atualiza existente
excluirSonho(id)                    // Remove
finalizarSonho(id)                  // Marca como conquistado
agendarSonho(id, data)              // Define data futura

// ── CRUD Aportes ──────────────────────────────────────────
registrarAporteSonho(sonhoId, aporte)// Novo aporte
editarAporteSonho(sonhoId, aporteId, dados)// Atualiza aporte
excluirAporteSonho(sonhoId, aporteId)// Remove aporte
finalizarAporteSonho(sonhoId, aporteId)// Confirma aporte

// ── Migração de Investimentos ─────────────────────────────
perguntarOrigemAporte(sonhoId)      // Diálogo saldo livre vs migração
migrarAporteInvestimento(sonhoId, aporte)// Executa migração
reduzirPosicaoAtivo(ticker, valor)  // Reduz posição no patrimônio
registrarAportePorPagamentoSonho()  // Integração com Controle

// ── Saúde Financeira ──────────────────────────────────────
analisarSaudeFinanceiraSonhos()     // Análise de viabilidade geral
analisarSaudeSonho(sonhoId)         // Análise individual
gerarPlanoSugerido(sonhoId)         // Recomendação com plano
calcularEsforcoNecessario(sonho)    // Nível: leve/moderado/intenso
calcularTempoConquista(sonho)       // Estimativa de meses
classificarUrgencia(sonho)          // Alta/média/baixa/conquistado

// ── Helpers ───────────────────────────────────────────────
calcularTotalAcumulado()            // Soma de todos os aportes
calcularMensalidadeTotal()          // Soma de mensalidades ativas
calcularPercentualConquistado(sonho)// Progresso individual
```

---

### 7.7 Applicash — `#applicash` (~10 funções)

```javascript
gerarCupomPadrao()                  // Gera cupom único
obterCupomApplicash()               // Lê cupom do localStorage
obterAssinaturaApplicash()          // Lê dados da assinatura
carregarIndicacoesApplicash()       // Lista indicações
mascararNome(nome)                  // Oculta nome do indicado
atualizarTelaApplicash()            // Render completo
copiarCupomApplicash()              // Copia para clipboard
compartilharCupomApplicash()        // Web Share API
calcularCreditoRecorrente(indicacoes)// Soma 10% de ativos
atualizarMetaProgressiva()          // Barra de marcos
```

---

### 7.8 Dúvidas & Sugestões — `#duvidas_sugestoes` (~7 funções)

```javascript
renderizarFaq()                     // Lista de perguntas
filtrarFaq(termo, categoria)        // Busca + filtro
trocarTabDuvidas(tab)               // Navegação FAQ ↔ Sugestão
selecionarTipoSugestao(tipo)        // Seleciona melhoria/novo/bug
enviarSugestao(dados)               // Persiste sugestão
renderizarHistoricoSugestoes()      // Lista enviadas
buscarPerguntaFaq(id)               // Detalhe de pergunta
```

---

### 7.9 Notícias — `#noticias` (~2 funções)

```javascript
carregarNoticias()                  // Fetch RSS feeds
filtrarNoticias(termo)              // Busca textual
```

---

### 7.10 Funções Utilitárias Globais (~25 funções)

```javascript
// ── Formatação ────────────────────────────────────────────
formatarMoeda(valor)                // Intl.NumberFormat → R$ 1.234,56
formatarNumero(valor, decimais)     // Intl.NumberFormat genérico
formatarPercentual(valor)           // 12,34%
formatarData(data)                  // dd/mm/aaaa
formatarDataAbreviada(data)         // dd/mm
formatarPeriodo(mes, ano)           // "Julho 2025"
formatarNumeroCompacto(valor)       // 1,2M / 890K

// ── Armazenamento ─────────────────────────────────────────
salvarDados(chave, dados)           // JSON.stringify → localStorage
carregarDados(chave, padrao)        // JSON.parse ← localStorage
removerDados(chave)                 // localStorage.removeItem
obterTodasChaves()                  // Lista todas as keys

// ── Navegação SPA ─────────────────────────────────────────
navegarPara(secao)                  // Mostra seção e oculta demais
obterSecaoAtiva()                   // Retorna seção corrente
atualizarMenuAtivo(secao)           // Highlight no menu

// ── Backup / Restore ──────────────────────────────────────
exportarBackupCompleto()            // Gera JSON com todos os dados
importarBackupCompleto(json)        // Restaura de JSON
validarBackup(json)                 // Valida estrutura do backup

// ── Dark Mode ─────────────────────────────────────────────
toggleDarkMode()                    // Alterna tema
aplicarTema(dark)                   // Aplica variáveis CSS
salvarPreferenciaTema(dark)         // Persiste escolha

// ── Ocultação de Valores ──────────────────────────────────
toggleValoresOcultos()              // Liga/desliga blur
aplicarBlurValores(ocultar)         // Aplica/remove classe CSS
salvarPreferenciaOcultacao(ocultar) // Persiste escolha

// ── Toast / Notificações ──────────────────────────────────
mostrarToast(mensagem, tipo)        // Exibe notificação temporária

// ── Init ──────────────────────────────────────────────────
inicializarAplicacao()              // Setup global ao carregar página
```

---

### 7.11 Event Listeners e Inicialização (~15 funções)

```javascript
document.addEventListener('DOMContentLoaded', inicializarAplicacao)
setupSidebarToggle()                // Menu hamburger mobile
setupBottomNavigation()             // Navegação inferior
setupModais()                       // Fechamento por overlay/ESC
setupDrawers()                      // Abrir/fechar painéis laterais
setupFormularios()                  // Submit handlers
setupInputsMascara()                // Máscaras de input (moeda, data)
setupScrollListeners()              // Lazy load, infinite scroll
setupIntersectionObserver()         // Visibilidade de seções
setupResizeListener()               // Responsividade dinâmica
```

---

## Apendice A — Estatísticas do Código

| Métrica | Valor |
|---|---|
| **Total de linhas** | ~10.705 |
| **HTML** | ~3.000 linhas |
| **CSS (inline `<style>`)** | ~3.200 linhas |
| **JavaScript (inline `<script>`)** | ~7.500 linhas |
| **Seções HTML (navegáveis)** | 10 |
| **Funções JavaScript identificadas** | ~177 |
| **localStorage keys** | ~20 |
| **Integrações externas** | 4 (Yahoo, BCB, Brapi, RSS) |
| **Dependências CDN** | 6 (3 fonts, 1 icons, 2 chart) |
| **Breakpoints responsivos** | 7 |
| **CSS variables (design tokens)** | ~30 |
| **Módulos ativos** | 8 de 10 |
| **Módulos placeholder** | 2 de 10 |

---

## Apendice B — Glossário

| Termo | Definição |
|---|---|
| **YOC** | Yield on Cost — Dividend yield calculado sobre o custo de aquisição |
| **DRE** | Demonstrativo de Resultado do Exercício — Metas verde/vermelha |
| **DY** | Dividend Yield — Dividendos pagos / Preço atual × 100 |
| **Sparkline** | Mini gráfico de linha inline sem eixos |
| **Drawer** | Painel lateral deslizante (side sheet) |
| **Rich Row** | Linha de tabela com elementos visuais avançados |
| **Carry-forward** | Transporte de saldo entre meses |
| **Shimmer** | Efeito visual de brilho em barras de progresso |
| **Progress Ring** | Anel de progresso circular em SVG |
| **Dark Mode** | Modo de exibição com tema escuro |
| **SPA** | Single-Page Application — aplicação de página única |
| **Fallback** | Mecanismo alternativo quando o primário falha |
| **TTL** | Time to Live — tempo de validade do cache |

---

## Apendice C — Próximos Entregáveis

| # | Entregável | Descrição |
|---|---|
| 2 | **Análise de Complexidade** | Avaliação de dívida técnica, complexidade ciclomática, pontos de refatoração |
| 3 | **Plano de Arquitetura** | Proposta de decomposição em microsserviços, estrutura de pastas, stack sugerido |
| 4 | **Roadmap de Migração** | Fases, dependências, estimativa de esforço, riscos e mitigações |

---

> **Fim do Deliverable 1 — Inventário Rigoroso**  
> *Documento gerado como parte da análise de arquitetura do sistema Appliquei v13.0*
