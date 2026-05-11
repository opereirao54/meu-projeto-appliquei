// ============================================================
// lib/calculations/dreams.ts — Dream Planner Engine
// ZERO-REGRESSÃO: Lógica idêntica ao legacy linha ~8638-9100
// ============================================================

import type { Dream, DreamProgress, FinancialHealthScore } from '../../types/dreams';
import type { TransactionSummary } from '../../types/transactions';

/**
 * Taxa mensal fixa para cálculos de sonhos (0.8% ao mês).
 * @ref legacy/Appliquei_v13.html:8658
 */
export const SONHO_TAXA_MENSAL = 0.008;

/**
 * Calcula o PMT (aporte mensal) necessário para atingir a meta do sonho
 * no prazo restante, com juros compostos.
 * 
 * FÓRMULA PMT (idêntica ao legado):
 *   pmt = falta × r / ((1+r)^n - 1)
 *   onde r = 0.008, n = mesesRestantes, falta = valorTotal - valorAtual
 * 
 * @ref legacy/Appliquei_v13.html:8968-8976
 */
export function calcSonhoMensal(
  valorTotal: number,
  valorAtual: number,
  mesesRestantes: number
): number {
  if (mesesRestantes <= 0) return 0;
  const falta = valorTotal - valorAtual;
  if (falta <= 0) return 0;

  const r = SONHO_TAXA_MENSAL;
  const pmt = (falta * r) / (Math.pow(1 + r, mesesRestantes) - 1);
  return Math.max(0, pmt);
}

/**
 * Calcula projeção futura do saldo de um sonho.
 * 
 * @ref legacy/Appliquei_v13.html:8978-8982
 */
export function calcSonhoProjecao(
  valorAtual: number,
  aporteMensal: number,
  meses: number
): number {
  let saldo = valorAtual;
  for (let i = 0; i < meses; i++) {
    saldo = saldo * (1 + SONHO_TAXA_MENSAL) + aporteMensal;
  }
  return saldo;
}

/**
 * Calcula diferença em meses entre duas datas.
 * @ref legacy/Appliquei_v13.html:8984-8987
 */
export function mesesEntre(dataIni: string | Date, dataFim: string | Date): number {
  const d1 = new Date(dataIni);
  const d2 = new Date(dataFim);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

/**
 * Determina o status de um sonho.
 * 
 * @ref legacy/Appliquei_v13.html:8942-8958
 */
export function statusSonho(
  s: Dream
): 'agendado' | 'ativo' | 'conquistado' | 'vencido' {
  if (!s) return 'ativo';
  const conquistado = (s.valorAtual || 0) >= (s.valorTotal || 0);
  if (conquistado) return 'conquistado';

  const hoje = new Date();
  const hojeMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getTime();

  if (s.createdAt) {
    // Check if start date is in the future
    const dIni = new Date(s.createdAt);
    const iniMes = new Date(dIni.getFullYear(), dIni.getMonth(), 1).getTime();
    if (hojeMes < iniMes) return 'agendado';
  }

  // Check if deadline has passed
  if (s.prazoMeses) {
    const created = new Date(s.createdAt || Date.now());
    const deadline = new Date(created);
    deadline.setMonth(deadline.getMonth() + s.prazoMeses);
    if (hoje > deadline) return 'vencido';
  }

  return 'ativo';
}

/**
 * Calcula dias até o início de um sonho agendado.
 * @ref legacy/Appliquei_v13.html:8960-8966
 */
export function diasAteInicioSonho(s: Dream): number {
  if (!s || !s.createdAt) return 0;
  const hoje = new Date();
  const dIni = new Date(s.createdAt);
  const diff = Math.ceil((dIni.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff);
}

/**
 * Calcula o progresso detalhado de um sonho.
 */
export function calcularProgresso(dream: Dream): DreamProgress {
  const percentual = Math.min(100, (dream.valorAtual / dream.valorTotal) * 100);
  const mesesDecorridos = dream.prazoMeses - (dream.mesesRestantes || dream.prazoMeses);
  const mesesRestantes = dream.mesesRestantes || dream.prazoMeses;

  // Verifica se está no track esperado
  const pctTempo = dream.prazoMeses > 0 
    ? (mesesDecorridos / dream.prazoMeses) * 100 
    : 0;
  const noTrack = percentual >= pctTempo * 0.85;

  const pmtNecessario = calcSonhoMensal(dream.valorTotal, dream.valorAtual, mesesRestantes);

  // Tempo estimado ao ritmo atual
  let tempoEstimado = mesesRestantes;
  if (mesesDecorridos > 0 && dream.valorAtual > 0) {
    const aporteMedioMensal = dream.valorAtual / mesesDecorridos;
    const falta = dream.valorTotal - dream.valorAtual;
    tempoEstimado = aporteMedioMensal > 0 ? Math.ceil(falta / aporteMedioMensal) : 999;
  }

  return {
    dreamId: dream.id,
    percentual,
    mesesDecorridos,
    mesesRestantes,
    noTrack,
    pmtNecessario,
    tempoEstimado,
  };
}

/**
 * Gera alerta contextual para um sonho.
 * 
 * @ref legacy/Appliquei_v13.html:9067-9078
 */
export function gerarAlertaSonho(
  dream: Dream
): { tipo: 'ok' | 'warn' | 'danger'; msg: string } | null {
  const pct = (dream.valorAtual / dream.valorTotal) * 100;

  if (pct >= 100) {
    return { tipo: 'ok', msg: '🎉 Parabéns! Você atingiu a meta deste sonho!' };
  }

  const mesesRestantes = dream.mesesRestantes || 0;
  if (mesesRestantes <= 0) {
    return {
      tipo: 'danger',
      msg: '⏰ O prazo original já expirou! Considere estender o prazo ou aumentar os aportes.',
    };
  }

  const mesesPassados = dream.prazoMeses - mesesRestantes;
  if (mesesPassados <= 0) return null;

  const pctTempo = (mesesPassados / dream.prazoMeses) * 100;

  if (pct < pctTempo * 0.6) {
    return {
      tipo: 'danger',
      msg: `⚠️ Atenção: você está com ${pct.toFixed(0)}% guardado, mas já se passaram ${pctTempo.toFixed(0)}% do tempo. O plano precisa de ajustes urgentes!`,
    };
  }

  if (pct < pctTempo * 0.85) {
    return {
      tipo: 'warn',
      msg: '📊 Seu progresso está um pouco abaixo do esperado. Considere aumentar os aportes ou cortar algum gasto extra.',
    };
  }

  return null;
}

/**
 * Gera a cor do progress ring baseada no percentual.
 * 
 * @ref legacy/Appliquei_v13.html:9080-9099
 */
export function corProgressRing(pct: number): string {
  if (pct >= 100) return '#10b981';
  if (pct >= 60) return '#059669';
  if (pct >= 30) return '#d97706';
  return '#ef4444';
}

/**
 * Calcula os parâmetros SVG do progress ring.
 * 
 * @ref legacy/Appliquei_v13.html:9080-9099
 */
export function calcProgressRingSVG(
  pct: number,
  radius = 58
): { circumference: number; offset: number; color: string } {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;
  return {
    circumference,
    offset,
    color: corProgressRing(pct),
  };
}

/**
 * Análise de saúde financeira para sonhos.
 * Avalia últimos 3 meses + mês corrente do controle financeiro.
 * 
 * @ref legacy/Appliquei_v13.html:8775-8831
 */
export function analisarSaudeFinanceiraSonhos(
  resumosMensais: Array<{ mes: number; ano: number; resumo: TransactionSummary }>,
  sonhos: Dream[]
): FinancialHealthScore {
  const hoje = new Date();
  let receita = 0;
  let despesa = 0;
  let invest = 0;
  let mesesComDados = 0;

  for (let i = 0; i < 4; i++) {
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const entry = resumosMensais.find(
      (r) => r.mes === ref.getMonth() && r.ano === ref.getFullYear()
    );
    if (!entry) continue;

    const r = entry.resumo;
    const totalMov =
      r.receita + r.despFixa + r.despVar + r.cartao + r.invFixo + r.invVar + r.resgate + r.sonho;
    
    if (totalMov > 0) {
      receita += r.receita + r.resgate;
      despesa += r.despFixa + r.despVar + r.cartao;
      invest += r.invFixo + r.invVar + r.sonho;
      mesesComDados++;
    }
  }

  if (mesesComDados === 0) {
    return {
      score: 0,
      breakdown: {
        termometro60: 0,
        investimentos: 0,
        sonhos: 0,
        reserva: 0,
        diversificacao: 0,
      },
      nivel: 'atencao',
      mensagem: 'Sem dados suficientes para análise.',
    };
  }

  const receitaMedia = receita / mesesComDados;
  const despesaMedia = despesa / mesesComDados;
  const investMedio = invest / mesesComDados;
  const sobraMedia = receitaMedia - despesaMedia - investMedio;
  const taxaPoupanca = receitaMedia > 0 ? (sobraMedia / receitaMedia) * 100 : 0;

  // Pontuação por componente (0-20 cada)
  const termometro60 = Math.min(20, Math.max(0,
    receitaMedia > 0 
      ? (despesaMedia / receitaMedia <= 0.6 ? 20 : despesaMedia / receitaMedia <= 0.8 ? 10 : 0) 
      : 0
  ));

  const investimentos = Math.min(20, Math.max(0,
    investMedio > 0 ? (taxaPoupanca >= 20 ? 20 : taxaPoupanca >= 10 ? 15 : 10) : 0
  ));

  const sonhosAtivos = sonhos.filter((s) => statusSonho(s) === 'ativo');
  const sonhosEmDia = sonhosAtivos.filter((s) => {
    const prog = calcularProgresso(s);
    return prog.noTrack;
  });
  const sonhosPontos = sonhosAtivos.length > 0
    ? Math.round((sonhosEmDia.length / sonhosAtivos.length) * 20)
    : 10; // Sem sonhos = neutro

  const reserva = 10; // Placeholder — precisa de dados de reserva de emergência
  const diversificacao = 10; // Placeholder — precisa de dados da carteira

  const score = termometro60 + investimentos + sonhosPontos + reserva + diversificacao;

  let nivel: FinancialHealthScore['nivel'];
  let mensagem: string;

  if (score >= 80) {
    nivel = 'excelente';
    mensagem = 'Saúde financeira forte — alta capacidade de investimento';
  } else if (score >= 60) {
    nivel = 'bom';
    mensagem = 'Saúde financeira estável — taxa de poupança saudável';
  } else if (score >= 40) {
    nivel = 'atencao';
    mensagem = 'Saúde financeira frágil — poupança abaixo de 10%';
  } else {
    nivel = 'critico';
    mensagem = 'Atenção: suas despesas estão consumindo toda a renda';
  }

  return {
    score,
    breakdown: {
      termometro60,
      investimentos,
      sonhos: sonhosPontos,
      reserva,
      diversificacao,
    },
    nivel,
    mensagem,
  };
}
