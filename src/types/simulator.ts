// ============================================================
// Types — Simulador de Independência Financeira
// ============================================================

export interface SimulatorParams {
  idadeAtual: number;
  idadeIndependencia: number;
  patrimonioAtual: number;
  aporteMensal: number;
  rendimentoAnual: number;   // % a.a. (ex: 6.0)
  salarioINSS: number;       // Salário benefício mensal
  inflacaoAnual: number;     // % a.a. (ex: 4.5)
  gastosMensais: number;     // Despesas mensais desejadas
}

export interface SimulatorMonthRow {
  mes: number;               // Mês absoluto (0, 1, 2, ...)
  idade: number;             // Idade no mês
  patrimonioInvestido: number;
  patrimonioINSS: number;
  diferenca: number;         // investido - INSS
  rendaPassiva: number;      // patrimônio × (rend.mensal)
  isInflexao: boolean;       // Mês do ponto de inflexão
  isIndependencia: boolean;  // Renda passiva >= gastos
}

export interface SimulatorResult {
  tabela: SimulatorMonthRow[];
  pontoInflexao: SimulatorMonthRow | null;
  pontoIndependencia: SimulatorMonthRow | null;
  patrimonioFinalInvestido: number;
  patrimonioFinalINSS: number;
  diferencaFinal: number;
  rendaPassivaFinal: number;
  multiplicador: number;     // investindo / INSS
  composicao: {
    aportes: number;
    rendimentos: number;
  };
}

export interface IPCAEntry {
  ano: number;
  ipca: number;              // % acumulado anual
}
