// ============================================================
// lib/formatters.ts — Utilitários de formatação monetária
// Lógica idêntica ao legacy (formatarMoeda, parseBRL, etc.)
// ============================================================

/**
 * Formata um número como moeda brasileira.
 * Ref: legacy formatarMoeda()
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata para exibição compacta (ex: R$ 1,5k, R$ 2,3M)
 */
export function formatarMoedaCompacta(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(valor) >= 1_000) {
    return `R$ ${(valor / 1_000).toFixed(1)}k`;
  }
  return formatarMoeda(valor);
}

/**
 * Parse valor BRL (string "1.234,56") para número.
 * Ref: legacy parseBRL()
 */
export function parseBRL(str: string): number {
  if (!str) return 0;
  const cleaned = str
    .replace(/[^\d,.\-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Formata número para input BRL (sem R$, com vírgula decimal).
 * Ref: legacy formatarBRLInput()
 */
export function formatarBRLInput(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

/**
 * Formata quantidade de ativos.
 * Ref: legacy formatarQtd()
 */
export function formatarQtd(qtd: number): string {
  if (Number.isInteger(qtd)) return qtd.toString();
  return qtd.toFixed(2).replace('.', ',');
}

/**
 * Formata percentual com sinal.
 */
export function formatarPercentual(valor: number, decimais = 2): string {
  const sinal = valor >= 0 ? '+' : '';
  return `${sinal}${valor.toFixed(decimais)}%`;
}

/**
 * Parse data YYYY-MM-DD com hora fixa 12:00 para evitar drift de timezone.
 * Ref: legacy parsePagTs (usado em dividendos)
 */
export function parseDateSafe(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  if (dateStr.length === 10) {
    return new Date(dateStr + 'T12:00:00');
  }
  return new Date(dateStr);
}

/**
 * Nome do mês em português (abreviado).
 */
export const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function labelMes(date: Date): string {
  return `${MESES_ABREV[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}
