// ============================================================
// lib/constants.ts — Constantes do design system e categorias
// Ref: legacy ROTULOS_CATEGORIA, CORES_CATEGORIA, paletaCarteira()
// ============================================================

export const ROTULOS_CATEGORIA: Record<string, string> = {
  renda_variavel: 'Renda Variável',
  renda_fixa: 'Renda Fixa',
  previdencia: 'Previdência',
  reserva_emergencia: 'Reserva de Emergência',
};

export const CORES_CATEGORIA: Record<string, string> = {
  renda_variavel: '#2563eb',
  renda_fixa: '#059669',
  previdencia: '#7c3aed',
  reserva_emergencia: '#d97706',
};

export const CORES_SUBCATEGORIA: Record<string, string> = {
  acoes: '#059669',
  fiis: '#10b981',
  bdrs: '#047857',
  etfs: '#34d399',
  cripto: '#d97706',
  renda_fixa: '#2563eb',
  previdencia: '#7c3aed',
  reserva_emergencia: '#6b7280',
};

export const ROTULOS_TRANSACAO: Record<string, string> = {
  receita: 'Receita',
  resgate_investimento: 'Resgate',
  despesa_fixa: 'Desp. Fixa',
  despesa_variavel: 'Desp. Variável',
  cartao_credito: 'C. Crédito',
  investimento_fixo: 'Inv. Fixo',
  investimento_variavel: 'Inv. Variável',
  sonho: '⭐ Sonho',
};

export const CORES_COMPOSICAO: Record<string, string> = {
  receita: '#10b981',
  resgate: '#34d399',
  cartao: '#f59e0b',
  despFixa: '#f97316',
  despVar: '#e11d48',
  investimentos: '#2563eb',
  sonhos: '#7c3aed',
  sobra: '#10b981',
};

// Paleta do gráfico de evolução
export const PALETA_EVOLUCAO = {
  investido: '#059669',
  ganhoCapital: 'rgba(5, 150, 105, 0.35)',
  perdaCapital: 'rgba(220, 38, 38, 0.35)',
  dividendos: '#2563eb',
};

// Dream emojis por categoria
export const DREAM_EMOJIS: Record<string, string> = {
  viagem: '✈️',
  educacao: '🎓',
  moradia: '🏠',
  veiculo: '🚗',
  reserva: '🛡️',
  objetivo: '🎯',
  outro: '⭐',
};

// Limites do termômetro 60%
export const THERMOMETER_LIMITS = {
  safe: 50,
  warning: 60,
} as const;

// Simulador defaults
export const SIMULATOR_DEFAULTS = {
  rendimentoAnual: 6.0,
  inflacaoAnual: 4.5,
  idadeIndependencia: 65,
} as const;
