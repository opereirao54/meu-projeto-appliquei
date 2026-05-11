// ============================================================
// lib/calculations/thermometer.ts — Termômetro dos 60%
// ZERO-REGRESSÃO: Lógica idêntica ao legacy linha ~7574-7632
// ============================================================

import type { TransactionSummary } from '../../types/transactions';
import { THERMOMETER_LIMITS } from '../constants';

export type ThermometerStatus = 'ok' | 'warning' | 'danger' | 'no_data';

export interface ThermometerResult {
  totalDespesa: number;
  totalReceita: number;
  limite60: number;
  percentualGasto: number;
  status: ThermometerStatus;
  barWidth: number;           // 0-100 (capped)
  barColor: string;
  badgeLabel: string;
  badgeClass: string;
  mensagem: string;
  mensagemCor: string;
}

/**
 * Calcula o estado do termômetro dos 60%.
 * 
 * REGRA EXATA DO LEGADO:
 *   totalDespesa = despFixa + despVar + cartao
 *   percentualGasto = (totalDespesa / totalReceita) × 100
 *   ≤50% → verde "Dentro do limite"
 *   ≤60% → amarelo "Atenção"
 *   >60% → vermelho "Limite ultrapassado"
 * 
 * @ref legacy/Appliquei_v13.html:7574-7632
 */
export function calcularTermometro60(resumo: TransactionSummary): ThermometerResult {
  const totalReceita = resumo.receita;
  const totalDespesa = resumo.despFixa + resumo.despVar + resumo.cartao;
  const limite60 = totalReceita * 0.6;

  if (totalReceita === 0) {
    return {
      totalDespesa,
      totalReceita,
      limite60: 0,
      percentualGasto: 0,
      status: 'no_data',
      barWidth: 0,
      barColor: 'var(--cor-texto-mutado)',
      badgeLabel: 'Sem dados',
      badgeClass: 'badge-status-warn',
      mensagem: 'Adicione receitas para calcular seu limite de segurança.',
      mensagemCor: 'var(--cor-texto-mutado)',
    };
  }

  const percentualGasto = (totalDespesa / totalReceita) * 100;
  const barWidth = Math.min(percentualGasto, 100);

  if (percentualGasto <= THERMOMETER_LIMITS.safe) {
    return {
      totalDespesa,
      totalReceita,
      limite60,
      percentualGasto,
      status: 'ok',
      barWidth,
      barColor: 'var(--cor-primaria)',
      badgeLabel: 'Dentro do limite',
      badgeClass: 'badge-status-ok',
      mensagem: 'Seus gastos estão sob controle.',
      mensagemCor: 'var(--cor-txt-primaria)',
    };
  }

  if (percentualGasto <= THERMOMETER_LIMITS.warning) {
    return {
      totalDespesa,
      totalReceita,
      limite60,
      percentualGasto,
      status: 'warning',
      barWidth,
      barColor: 'var(--cor-cartao)',
      badgeLabel: 'Atenção',
      badgeClass: 'badge-status-warn',
      mensagem: 'Gastos próximos do limite de segurança.',
      mensagemCor: 'var(--cor-txt-amber)',
    };
  }

  return {
    totalDespesa,
    totalReceita,
    limite60,
    percentualGasto,
    status: 'danger',
    barWidth,
    barColor: 'var(--cor-erro)',
    badgeLabel: 'Limite ultrapassado',
    badgeClass: 'badge-status-danger',
    mensagem: 'Você ultrapassou o limite de segurança de 60%.',
    mensagemCor: 'var(--cor-txt-erro)',
  };
}

/**
 * Calcula o resumo financeiro de um mês a partir das transações.
 * 
 * @ref legacy/Appliquei_v13.html:7273-7288
 */
export function calcularResumoMes(
  transacoes: Array<{ mes: number; ano: number; categoria: string; valor: number }>,
  mesAlvo: number,
  anoAlvo: number
): TransactionSummary {
  const res: TransactionSummary = {
    receita: 0,
    resgate: 0,
    despFixa: 0,
    despVar: 0,
    cartao: 0,
    invFixo: 0,
    invVar: 0,
    sonho: 0,
  };

  transacoes.forEach((t) => {
    if (t.mes === mesAlvo && t.ano === anoAlvo) {
      switch (t.categoria) {
        case 'receita': res.receita += t.valor; break;
        case 'resgate_investimento': res.resgate += t.valor; break;
        case 'despesa_fixa': res.despFixa += t.valor; break;
        case 'despesa_variavel': res.despVar += t.valor; break;
        case 'cartao_credito': res.cartao += t.valor; break;
        case 'investimento_fixo': res.invFixo += t.valor; break;
        case 'investimento_variavel': res.invVar += t.valor; break;
        case 'sonho': res.sonho += t.valor; break;
      }
    }
  });

  return res;
}

/**
 * Calcula o resultado bruto do mês (sem carry-forward).
 * 
 * @ref legacy/Appliquei_v13.html:7309-7315
 */
export function calcularResultadoMes(resumo: TransactionSummary): number {
  const totRec = resumo.receita + resumo.resgate;
  const totDesp = resumo.despFixa + resumo.despVar + resumo.sonho;
  const totInv = resumo.invFixo + resumo.invVar;
  return totRec - totDesp - resumo.cartao - totInv;
}
