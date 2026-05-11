// ============================================================
// lib/calculations/simulator.ts — Simulador de Independência
// ZERO-REGRESSÃO: Lógica idêntica ao legacy linha ~8338-8494
// ============================================================

import type { SimulatorParams, SimulatorResult, SimulatorMonthRow } from '../../types/simulator';

/**
 * Converte taxa anual para mensal (juros compostos).
 * @ref legacy/Appliquei_v13.html:8349
 */
export function taxaAnualParaMensal(taxaAnualPercent: number): number {
  return Math.pow(1 + taxaAnualPercent / 100, 1 / 12) - 1;
}

/**
 * Executa a simulação completa: Investindo vs INSS.
 * 
 * REGRA DO LEGADO:
 *   - Investindo: montante = montante + (montante × taxaMensal) + aporte
 *   - INSS: montante = montante + (montante × taxaINSSMensal) + aporte
 *   - Taxa INSS fixa: 3% a.a. convertida para mensal
 *   - Renda passiva: patrimônio × 0.008 (0.8% ao mês)
 *   - Ponto de inflexão: mês onde juros mensais > aporte
 *   - Poder de compra real: montante / inflacaoFator
 *   - inflacaoFator = (1 + inflacao/100)^anos
 * 
 * @ref legacy/Appliquei_v13.html:8338-8494
 */
export function calcularSimulador(params: SimulatorParams): SimulatorResult {
  const {
    idadeAtual,
    idadeIndependencia,
    patrimonioAtual,
    aporteMensal,
    rendimentoAnual,
    salarioINSS: _salarioINSS, // Não usado diretamente — o INSS usa mesma lógica com taxa 3%
    inflacaoAnual,
    gastosMensais,
  } = params;

  const anosSimulacao = idadeIndependencia - idadeAtual;
  const meses = anosSimulacao * 12;
  const anos = meses / 12;

  // Taxa mensal de rendimento (juros compostos)
  const taxaMensal = taxaAnualParaMensal(rendimentoAnual);
  // Taxa INSS: 3% a.a. convertida para mensal (ref: legacy linha 8350)
  const taxaInssMensal = taxaAnualParaMensal(3.0);
  // Fator de inflação acumulada
  const inflacaoFator = Math.pow(1 + inflacaoAnual / 100, anos);

  // === INVESTINDO ===
  let montante = patrimonioAtual;
  let investidoTotal = patrimonioAtual;
  let mesJurosMaiorQueAporte: number | null = null;
  const tabela: SimulatorMonthRow[] = [];

  for (let i = 1; i <= meses; i++) {
    const jurosMes = montante * taxaMensal;
    montante = montante + jurosMes + aporteMensal;
    investidoTotal += aporteMensal;

    // Ponto de inflexão: juros mensais > aporte (ref: legacy 8361)
    const isInflexao = !mesJurosMaiorQueAporte && jurosMes > aporteMensal;
    if (isInflexao) {
      mesJurosMaiorQueAporte = i;
    }

    // Renda passiva mensal: patrimônio × 0.8% (ref: legacy 8428)
    const rendaPassiva = montante * 0.008;

    tabela.push({
      mes: i,
      idade: idadeAtual + i / 12,
      patrimonioInvestido: montante,
      patrimonioINSS: 0, // preenchido abaixo
      diferenca: 0,       // preenchido abaixo
      rendaPassiva,
      isInflexao: i === mesJurosMaiorQueAporte,
      isIndependencia: false, // preenchido abaixo
    });
  }

  // === INSS ===
  let montanteINSS = patrimonioAtual;
  let contribTotalINSS = patrimonioAtual;

  for (let i = 1; i <= meses; i++) {
    montanteINSS = montanteINSS + montanteINSS * taxaInssMensal + aporteMensal;
    contribTotalINSS += aporteMensal;

    // Atualizar a tabela
    if (tabela[i - 1]) {
      tabela[i - 1].patrimonioINSS = montanteINSS;
      tabela[i - 1].diferenca = tabela[i - 1].patrimonioInvestido - montanteINSS;
    }
  }

  // === INDEPENDÊNCIA ===
  let pontoIndependencia: SimulatorMonthRow | null = null;
  for (const row of tabela) {
    if (row.rendaPassiva >= gastosMensais && !pontoIndependencia) {
      row.isIndependencia = true;
      pontoIndependencia = row;
    }
  }

  // Resultado final
  const jurosGerados = montante - investidoTotal;
  const correcaoINSS = montanteINSS - contribTotalINSS;
  const poderRealInvest = montante / inflacaoFator;
  const poderRealINSS = montanteINSS / inflacaoFator;

  const rendaPassivaFinal = montante * 0.008;
  const multiplo = montanteINSS > 0 ? montante / montanteINSS : 0;

  return {
    tabela,
    pontoInflexao: mesJurosMaiorQueAporte
      ? tabela.find((r) => r.mes === mesJurosMaiorQueAporte) || null
      : null,
    pontoIndependencia,
    patrimonioFinalInvestido: montante,
    patrimonioFinalINSS: montanteINSS,
    diferencaFinal: montante - montanteINSS,
    rendaPassivaFinal,
    multiplicador: multiplo,
    composicao: {
      aportes: investidoTotal,
      rendimentos: Math.max(0, jurosGerados),
    },
  };
}

/**
 * Gera labels para o gráfico comparativo (anuais).
 * @ref legacy/Appliquei_v13.html:8364-8367
 */
export function gerarLabelsGrafico(tabela: SimulatorMonthRow[]): {
  labels: string[];
  dataPatrimonio: number[];
  dataINSS: number[];
} {
  const labels: string[] = [];
  const dataPatrimonio: number[] = [];
  const dataINSS: number[] = [];

  tabela.forEach((row) => {
    // Registrar anualmente ou no último mês
    if (row.mes % 12 === 0 || row.mes === tabela.length) {
      const anos = Math.floor(row.mes / 12);
      const mesesRestantes = row.mes % 12;
      const label = mesesRestantes > 0
        ? `${anos}a ${mesesRestantes}m`
        : `${anos}a`;
      labels.push(label);
      dataPatrimonio.push(+row.patrimonioInvestido.toFixed(2));
      dataINSS.push(+row.patrimonioINSS.toFixed(2));
    }
  });

  return { labels, dataPatrimonio, dataINSS };
}

/**
 * Busca IPCA atual do Banco Central do Brasil.
 * @ref legacy/Appliquei_v13.html:8303-8317
 */
export async function buscarIPCAoficial(): Promise<{ valor: number; data: string } | null> {
  try {
    const response = await fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json'
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        valor: parseFloat(data[0].valor),
        data: data[0].data,
      };
    }
    return null;
  } catch {
    return null;
  }
}
