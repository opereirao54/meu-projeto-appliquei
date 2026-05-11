// ============================================================
// lib/calculations/portfolio-evolution.ts — Evolução Patrimonial
// ZERO-REGRESSÃO: Lógica idêntica ao legacy linha ~5569-5670
// ============================================================

import type { EvolutionDataPoint, EvolutionPeriod } from '../../types/snapshots';
import type { DividendPayment } from '../../types/dividends';
import { parseDateSafe, labelMes } from '../formatters';

interface OperacaoCompra {
  id: number | string;
  ticker: string;
  quantidade: number;
  preco_op?: number;
  preco_pago?: number;
  tipo?: string;
  data_op?: string;
  categoria?: string;
  subcategoria?: string;
  taxaMensal?: number;
}

interface AtivoMercado {
  ticker: string;
  preco_atual: number;
  tipo?: string;
  nome?: string;
}

/**
 * Calcula o saldo de previdência com juros compostos.
 * 
 * @ref legacy/Appliquei_v13.html:5007-5022
 */
export function calcularSaldoPrevidencia(
  ticker: string,
  historicoCompras: OperacaoCompra[],
  refTs?: number
): number {
  const ts = refTs || Date.now();
  const aportes = historicoCompras.filter(
    (op) =>
      op.ticker === ticker &&
      op.categoria === 'previdencia' &&
      op.data_op
  );

  let saldo = 0;
  aportes.forEach((op) => {
    const dataAporte = new Date(op.data_op!).getTime();
    if (dataAporte > ts) return;

    const taxa = op.taxaMensal != null ? op.taxaMensal : 0.008;
    const meses = Math.max(0, (ts - dataAporte) / (30.4375 * 24 * 60 * 60 * 1000));
    const valor = op.preco_op || op.preco_pago || 0;
    const fator = Math.pow(1 + taxa, meses);

    if ((op.tipo || 'compra') === 'venda') {
      saldo -= valor * fator;
    } else {
      saldo += valor * fator;
    }
  });

  return Math.max(0, saldo);
}

/**
 * Calcula a quantidade de um ativo numa data específica.
 */
function qtdNaData(
  ticker: string,
  dataLimiteMs: number,
  historicoCompras: OperacaoCompra[]
): number {
  let qtd = 0;
  historicoCompras.forEach((op) => {
    if (op.ticker !== ticker || !op.data_op) return;
    const tsOp = new Date(op.data_op).getTime();
    if (tsOp > dataLimiteMs) return;
    const tipo = op.tipo || 'compra';
    if (tipo === 'compra') qtd += op.quantidade;
    else if (tipo === 'venda') qtd -= op.quantidade;
  });
  return Math.max(0, qtd);
}

/**
 * Calcula a série de evolução patrimonial mensal.
 * 
 * Gera arrays de: meses[], investido[], mercado[], dividendos[]
 * respeitando o período selecionado (1M, 3M, 6M, 12M, Tudo).
 * 
 * REGRA DO LEGADO:
 *   - Posição cumulativa por ticker até o fim do mês
 *   - Valor de mercado: usa preço atual (sem histórico de preços)
 *   - Previdência: calcularSaldoPrevidencia() com juros compostos
 *   - Dividendos: cacheDividendos filtrado pelo mês
 * 
 * @ref legacy/Appliquei_v13.html:5569-5670
 */
export function calcularSerieEvolucao(
  historicoCompras: OperacaoCompra[],
  ativosMercado: AtivoMercado[],
  cacheDividendos: Record<string, { pagamentos: DividendPayment[] }>,
  periodoEvolucao: EvolutionPeriod,
  filtroTipo?: string,
  filtroAtivo?: string
): EvolutionDataPoint[] {
  // Filtrar operações
  const opsFiltradas = historicoCompras.filter((op) => {
    if (!op.data_op) return false;
    if (filtroAtivo && (op.ticker || '').toUpperCase() !== filtroAtivo.toUpperCase()) return false;
    if (!filtroTipo || filtroTipo === 'todos') return true;

    const cat = op.categoria || 'renda_variavel';
    if (filtroTipo === 'renda_fixa') return cat === 'renda_fixa';
    if (filtroTipo === 'previdencia') return cat === 'previdencia';
    if (filtroTipo === 'reserva_emergencia') return cat === 'reserva_emergencia';

    // Subcategorias de renda variável
    if (cat !== 'renda_variavel') return false;
    const am = ativosMercado.find((a) => a.ticker === op.ticker);
    const sub = op.subcategoria || (am ? inferirSubcategoria(am.tipo) : null);
    return sub === filtroTipo;
  });

  if (opsFiltradas.length === 0) return [];

  // Determinar mês inicial e final
  const tsPrimeira = Math.min(...opsFiltradas.map((op) => new Date(op.data_op!).getTime()));
  const dPrimeira = new Date(tsPrimeira);
  let mesIni = new Date(dPrimeira.getFullYear(), dPrimeira.getMonth(), 1);
  const hoje = new Date();
  const mesFim = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  // Limitar pelo período selecionado (ref: legacy 5595-5598)
  if (periodoEvolucao > 0) {
    const limite = new Date(hoje.getFullYear(), hoje.getMonth() - (periodoEvolucao - 1), 1);
    if (limite > mesIni) mesIni = limite;
  }

  // Gerar lista de meses
  const meses: Date[] = [];
  const cursor = new Date(mesIni);
  while (cursor <= mesFim) {
    meses.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Calcular para cada mês
  return meses.map((m) => {
    const fimMes = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59).getTime();

    // Posição cumulativa por ticker até o fim do mês
    const posicao: Record<string, { qtd: number; custo: number; pm: number }> = {};
    let invest = 0;

    opsFiltradas.forEach((op) => {
      const tsOp = new Date(op.data_op!).getTime();
      if (tsOp > fimMes) return;

      const tipo = op.tipo || 'compra';
      const preco = op.preco_op || op.preco_pago || 0;

      if (!posicao[op.ticker]) posicao[op.ticker] = { qtd: 0, custo: 0, pm: 0 };
      const p = posicao[op.ticker];

      if (tipo === 'compra') {
        p.qtd += op.quantidade;
        p.custo += op.quantidade * preco;
        p.pm = p.qtd > 0 ? p.custo / p.qtd : 0;
        invest += op.quantidade * preco;
      } else if (tipo === 'venda') {
        invest -= op.quantidade * p.pm;
        p.qtd -= op.quantidade;
        p.custo -= op.quantidade * p.pm;
      }
    });

    // Valor de mercado (ref: legacy 5631-5643)
    let valorMercado = 0;
    Object.entries(posicao).forEach(([ticker, p]) => {
      if (p.qtd <= 0) return;
      const opTicker = opsFiltradas.find((o) => o.ticker === ticker);
      const cat = opTicker?.categoria;

      if (cat === 'previdencia') {
        valorMercado += calcularSaldoPrevidencia(ticker, historicoCompras, fimMes);
      } else {
        const am = ativosMercado.find((a) => a.ticker === ticker);
        const precoAtual = am ? am.preco_atual : p.pm;
        valorMercado += p.qtd * precoAtual;
      }
    });

    // Dividendos do mês (ref: legacy 5651-5666)
    let div = 0;
    const tickersFiltrados = new Set(opsFiltradas.map((o) => o.ticker));
    tickersFiltrados.forEach((ticker) => {
      const cache = cacheDividendos[ticker];
      if (!cache || !cache.pagamentos) return;

      cache.pagamentos.forEach((pag) => {
        if (!pag.data) return;
        const tsPag = parseDateSafe(pag.data).getTime();
        const iniMes = new Date(m.getFullYear(), m.getMonth(), 1).getTime();
        if (tsPag < iniMes || tsPag > fimMes) return;

        const qtdNoPag = qtdNaData(ticker, tsPag, historicoCompras);
        if (qtdNoPag <= 0) return;
        div += qtdNoPag * pag.valor;
      });
    });

    const investido = Math.max(0, invest);
    const mercado = Math.max(0, valorMercado);
    const ganhoCapital = Math.max(0, mercado - investido);
    const perdaCapital = Math.min(0, mercado - investido);

    return {
      date: m,
      label: labelMes(m),
      investido,
      mercado,
      dividendos: div,
      ganhoCapital,
      perdaCapital,
    };
  });
}

/**
 * Infere subcategoria de RV a partir do tipo de mercado.
 */
function inferirSubcategoria(tipo?: string): string | null {
  if (!tipo) return null;
  const t = tipo.toLowerCase();
  if (t.includes('ação') || t === 'acao') return 'acoes';
  if (t.includes('fii')) return 'fiis';
  if (t.includes('etf')) return 'etfs';
  if (t.includes('bdr')) return 'bdrs';
  return null;
}

/**
 * Calcula patrimônio total numa data, respeitando filtros.
 * 
 * @ref legacy/Appliquei_v13.html:5444-5462
 */
export function patrimonioNaData(
  dataLimite: Date,
  historicoCompras: OperacaoCompra[],
  ativosMercado: AtivoMercado[],
  filtroTipo?: string,
  filtroAtivo?: string
): number {
  const limiteMs = dataLimite.getTime();
  if (limiteMs <= 0) return 0;

  // Consolidar carteira até a data
  const consolidado: Record<string, { qtd: number; custo: number; pm: number; categoria?: string }> = {};

  historicoCompras.forEach((op) => {
    if (!op.data_op) return;
    const tsOp = new Date(op.data_op).getTime();
    if (tsOp > limiteMs) return;

    // Aplicar filtro
    if (filtroAtivo && (op.ticker || '').toUpperCase() !== filtroAtivo.toUpperCase()) return;
    if (filtroTipo && filtroTipo !== 'todos') {
      const cat = op.categoria || 'renda_variavel';
      if (filtroTipo === 'renda_fixa' && cat !== 'renda_fixa') return;
      if (filtroTipo === 'previdencia' && cat !== 'previdencia') return;
      if (filtroTipo === 'reserva_emergencia' && cat !== 'reserva_emergencia') return;
    }

    if (!consolidado[op.ticker]) {
      consolidado[op.ticker] = { qtd: 0, custo: 0, pm: 0, categoria: op.categoria };
    }
    const p = consolidado[op.ticker];
    const tipo = op.tipo || 'compra';
    const preco = op.preco_op || op.preco_pago || 0;

    if (tipo === 'compra') {
      p.qtd += op.quantidade;
      p.custo += op.quantidade * preco;
      p.pm = p.qtd > 0 ? p.custo / p.qtd : 0;
    } else {
      p.qtd -= op.quantidade;
      p.custo -= op.quantidade * p.pm;
    }
  });

  let patrim = 0;
  for (const ticker in consolidado) {
    const ativo = consolidado[ticker];
    if (ativo.qtd <= 0) continue;

    if (ativo.categoria === 'previdencia') {
      patrim += calcularSaldoPrevidencia(ticker, historicoCompras, limiteMs);
    } else {
      const am = ativosMercado.find((a) => a.ticker === ticker);
      const precoAtual = am ? am.preco_atual : ativo.pm;
      patrim += ativo.qtd * precoAtual;
    }
  }

  return patrim;
}

/**
 * Calcula aportes líquidos (compras - vendas) dentro de um período.
 * 
 * @ref legacy/Appliquei_v13.html:5422-5440
 */
export function aportesLiquidosNoPeriodo(
  historicoCompras: OperacaoCompra[],
  dataInicio: Date | null,
  filtroTipo?: string,
  filtroAtivo?: string
): number {
  const inicioMs = dataInicio ? dataInicio.getTime() : 0;
  let aplicado = 0;

  historicoCompras.forEach((op) => {
    if (!op.data_op) return;
    const tsOp = new Date(op.data_op).getTime();
    if (inicioMs > 0 && tsOp < inicioMs) return;

    // Aplicar filtros
    if (filtroAtivo && (op.ticker || '').toUpperCase() !== filtroAtivo.toUpperCase()) return;

    const tipo = op.tipo || 'compra';
    const preco = op.preco_op || op.preco_pago || 0;
    const valor = (op.quantidade || 1) * preco;

    if (tipo === 'compra') aplicado += valor;
    else if (tipo === 'venda') aplicado -= valor;
  });

  return aplicado;
}
