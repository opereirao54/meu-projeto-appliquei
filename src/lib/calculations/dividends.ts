// ============================================================
// lib/calculations/dividends.ts — Dividendos & YOC
// ZERO-REGRESSÃO: Lógica idêntica ao legacy linha ~6600-6770
// ============================================================

import type { 
  DividendAssetRow, 
  DividendDashboardKPIs, 
  DividendMonthlyAggregated,
  DividendPayment,
  DividendPrevistoMes
} from '../../types/dividends';
import { parseDateSafe } from '../formatters';

interface OperacaoCompra {
  id: number | string;
  ticker: string;
  quantidade: number;
  preco_op?: number;
  preco_pago?: number;
  tipo?: string;          // 'compra' | 'venda'
  data_op?: string;
  categoria?: string;
}

interface AtivoConsolidado {
  qtdTotal: number;
  valorTotalInvestido: number;
  precoMedio: number;
}

/**
 * Calcula a quantidade de um ativo possuída numa determinada data.
 * Percorre o histórico de compras/vendas e soma/subtrai até a data limite.
 * 
 * @ref legacy/Appliquei_v13.html — função qtdNaData()
 */
export function qtdNaData(
  ticker: string,
  dataStr: string,
  historicoCompras: OperacaoCompra[]
): number {
  const dataLimite = parseDateSafe(dataStr).getTime();
  let qtd = 0;

  historicoCompras.forEach((op) => {
    if (op.ticker !== ticker || !op.data_op) return;
    const tsOp = new Date(op.data_op).getTime();
    if (tsOp > dataLimite) return;
    
    const tipo = op.tipo || 'compra';
    if (tipo === 'compra') {
      qtd += op.quantidade;
    } else if (tipo === 'venda') {
      qtd -= op.quantidade;
    }
  });

  return Math.max(0, qtd);
}

/**
 * Retorna a data da primeira compra de um ativo.
 * @ref legacy — dataPrimeiraCompra()
 */
export function dataPrimeiraCompra(
  ticker: string,
  historicoCompras: OperacaoCompra[]
): string | null {
  const compras = historicoCompras
    .filter((o) => o.ticker === ticker && (o.tipo || 'compra') === 'compra' && o.data_op)
    .map((o) => o.data_op!)
    .sort();
  return compras.length > 0 ? compras[0] : null;
}

/**
 * Calcula os KPIs de dividendos para um ou mais ativos.
 * 
 * REGRA YOC (legacy linha ~6669):
 *   yocAtivo = (recebidoTotal / investido) × 100
 *   yocCarteira = (totalGeral / totalInvestidoYOC) × 100
 * 
 * REGRA MÉDIA MENSAL (legacy linha ~6746-6759):
 *   mesesParaMedia = min(12, max(1, meses_desde_1ª_compra))
 *   mediaMensal = total12m / mesesParaMedia
 * 
 * @ref legacy/Appliquei_v13.html:6616-6759
 */
export function calcularDividendDashboard(
  tickers: string[],
  cacheDividendos: Record<string, { pagamentos: DividendPayment[] }>,
  carteiraConsolidada: Record<string, AtivoConsolidado>,
  historicoCompras: OperacaoCompra[],
  ativosMercado: Array<{ ticker: string; nome: string }>
): { kpis: DividendDashboardKPIs; linhas: DividendAssetRow[] } {
  const agora = Date.now();
  const limite12m = agora - 365 * 24 * 60 * 60 * 1000;

  let totalGeral = 0;
  let total12m = 0;
  let totalInvestidoYOC = 0;
  const linhas: DividendAssetRow[] = [];

  tickers.forEach((ticker) => {
    const cache = cacheDividendos[ticker];
    if (!cache || !cache.pagamentos || cache.pagamentos.length === 0) return;

    const ativo = carteiraConsolidada[ticker] || { qtdTotal: 0, valorTotalInvestido: 0, precoMedio: 0 };
    const am = ativosMercado.find((a) => a.ticker === ticker);
    const nomeAtivo = am ? am.nome : 'Ativo';
    const primeiraCompraStr = dataPrimeiraCompra(ticker, historicoCompras);
    if (!primeiraCompraStr) return;
    const limitePrimeiraCompraMs = new Date(primeiraCompraStr).getTime();

    let recebidoTotal = 0;
    let recebido12m = 0;

    cache.pagamentos.forEach((p) => {
      if (!p.data) return;
      const dataMs = parseDateSafe(p.data).getTime();
      if (dataMs < limitePrimeiraCompraMs) return;

      const qtd = qtdNaData(ticker, p.data, historicoCompras);
      if (qtd <= 0) return;

      const totalPag = qtd * p.valor;
      recebidoTotal += totalPag;
      if (dataMs >= limite12m) recebido12m += totalPag;
    });

    if (recebidoTotal === 0 && cache.pagamentos.length === 0) return;

    totalGeral += recebidoTotal;
    total12m += recebido12m;
    totalInvestidoYOC += Math.max(ativo.valorTotalInvestido, 0);

    const yoc = ativo.valorTotalInvestido > 0
      ? (recebidoTotal / ativo.valorTotalInvestido) * 100
      : 0;

    linhas.push({
      ticker,
      nomeAtivo,
      qtdAtual: ativo.qtdTotal,
      encerrada: ativo.qtdTotal <= 0,
      investido: ativo.valorTotalInvestido,
      recebidoTotal,
      recebido12m,
      yoc,
    });
  });

  // Ordena por recebido total desc
  linhas.sort((a, b) => b.recebidoTotal - a.recebidoTotal);

  // Média mensal: divide pelos meses efetivos de carteira (capado a 12)
  const primeirasMs = linhas
    .map((l) => dataPrimeiraCompra(l.ticker, historicoCompras))
    .filter(Boolean)
    .map((d) => parseDateSafe(d!).getTime());
  
  let mesesParaMedia = 12;
  if (primeirasMs.length) {
    const dPrim = new Date(Math.min(...primeirasMs));
    const hoje = new Date();
    const decorridos = 
      (hoje.getFullYear() - dPrim.getFullYear()) * 12 +
      (hoje.getMonth() - dPrim.getMonth()) + 1;
    mesesParaMedia = Math.min(12, Math.max(1, decorridos));
  }

  const yocCarteira = totalInvestidoYOC > 0
    ? (totalGeral / totalInvestidoYOC) * 100
    : 0;

  return {
    kpis: {
      totalRecebido: totalGeral,
      total12m,
      mediaMensal: total12m / mesesParaMedia,
      yocCarteira,
    },
    linhas,
  };
}

/**
 * Agrega pagamentos por (ticker, ano-mês).
 * JCP mensal + dividendos extras do mesmo mês viram uma única linha.
 * 
 * @ref legacy/Appliquei_v13.html:6703-6726
 */
export function agregarPagamentosMensais(
  todosPagamentos: Array<{
    data: string;
    ticker: string;
    qtd: number;
    valorCota: number;
    total: number;
  }>
): DividendMonthlyAggregated[] {
  const agregadoMap = new Map<string, DividendMonthlyAggregated>();

  todosPagamentos.forEach((p) => {
    if (!p.data) return;
    const d = parseDateSafe(p.data);
    const chave = `${p.ticker}|${d.getFullYear()}-${d.getMonth()}`;

    if (!agregadoMap.has(chave)) {
      agregadoMap.set(chave, {
        ticker: p.ticker,
        ano: d.getFullYear(),
        mes: d.getMonth(),
        qtdMes: p.qtd,
        tsMaisRecente: d.getTime(),
        somaValorCota: 0,
        total: 0,
        eventos: 0,
      });
    }

    const acc = agregadoMap.get(chave)!;
    if (d.getTime() > acc.tsMaisRecente) {
      acc.tsMaisRecente = d.getTime();
      acc.qtdMes = p.qtd;
    }
    acc.somaValorCota += p.valorCota;
    acc.total += p.total;
    acc.eventos += 1;
  });

  return [...agregadoMap.values()].sort((a, b) => b.tsMaisRecente - a.tsMaisRecente);
}

/**
 * Calcula dividendos previstos para o mês corrente.
 * 
 * @ref legacy/Appliquei_v13.html:5207-5305
 */
export function calcularDividendosPrevistosMes(
  carteiraConsolidada: Record<string, AtivoConsolidado>,
  cacheDividendos: Record<string, { pagamentos: DividendPayment[] }>,
  historicoCompras: OperacaoCompra[]
): DividendPrevistoMes[] {
  const hoje = new Date();
  const mesIni = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getTime();
  const mesFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59).getTime();

  const previstos: DividendPrevistoMes[] = [];

  for (const ticker in carteiraConsolidada) {
    const ativo = carteiraConsolidada[ticker];
    if (ativo.qtdTotal <= 0) continue;

    const cache = cacheDividendos[ticker];
    if (!cache || !cache.pagamentos || cache.pagamentos.length === 0) continue;

    const datasOrd = cache.pagamentos
      .map((p) => parseDateSafe(p.data).getTime())
      .sort((a, b) => a - b);
    const ultimo = datasOrd[datasOrd.length - 1];
    if (!ultimo) continue;

    const ultimoPag = cache.pagamentos.find(
      (p) => parseDateSafe(p.data).getTime() === ultimo
    );

    let proximoTs: number;
    let qtdEvento: number;

    if (ultimo >= mesIni && ultimo <= mesFim) {
      proximoTs = ultimo;
      qtdEvento = ultimoPag
        ? qtdNaData(ticker, ultimoPag.data, historicoCompras)
        : ativo.qtdTotal;
    } else {
      let intervaloDias = 30;
      if (datasOrd.length >= 2) {
        const diffs: number[] = [];
        for (let i = 1; i < datasOrd.length; i++) {
          diffs.push(datasOrd[i] - datasOrd[i - 1]);
        }
        intervaloDias = Math.round(
          diffs.reduce((a, b) => a + b, 0) / diffs.length / (24 * 60 * 60 * 1000)
        );
      }
      if (!intervaloDias || intervaloDias < 1) intervaloDias = 30;

      proximoTs = ultimo + intervaloDias * 24 * 60 * 60 * 1000;
      let guarda = 0;
      while (proximoTs < mesIni && guarda++ < 60) {
        proximoTs += intervaloDias * 24 * 60 * 60 * 1000;
      }
      if (proximoTs > mesFim) continue;

      qtdEvento = ativo.qtdTotal;
    }

    if (qtdEvento <= 0) continue;
    const valorPorAcao = ultimoPag ? ultimoPag.valor : 0;
    const valorEstim = valorPorAcao * qtdEvento;

    previstos.push({
      ticker,
      ts: proximoTs,
      valor: valorEstim,
      valorPorAcao,
      qtd: qtdEvento,
    });
  }

  return previstos.sort((a, b) => a.ts - b.ts);
}
