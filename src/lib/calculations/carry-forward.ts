// ============================================================
// lib/calculations/carry-forward.ts — Saldo Carregado entre Meses
// ZERO-REGRESSÃO: Lógica idêntica ao legacy linha ~7290-7342
// ============================================================

import type { CarryForwardEntry, CarryForwardMap } from '../../types/transactions';

/**
 * Gera a chave para o mapa de saldo carregado.
 * @ref legacy/Appliquei_v13.html:7295
 */
export function chaveMes(mes: number, ano: number): string {
  return `${ano}-${mes}`;
}

/**
 * Obtém o saldo carregado para um mês específico.
 * Retorna 0 se não houver registro ou se foi recusado.
 * 
 * @ref legacy/Appliquei_v13.html:7302-7306
 */
export function obterSaldoCarregadoParaMes(
  mapa: CarryForwardMap,
  mes: number,
  ano: number
): number {
  const reg = mapa[chaveMes(mes, ano)];
  return reg && typeof reg.valor === 'number' ? reg.valor : 0;
}

/**
 * Aceita o saldo do mês anterior, gravando no mapa.
 * 
 * @ref legacy/Appliquei_v13.html:7317-7326
 */
export function aceitarSaldoMesAnterior(
  mapa: CarryForwardMap,
  mesDestino: number,
  anoDestino: number,
  resultadoMesAnterior: number
): CarryForwardMap {
  const mesAnt = mesDestino === 0 ? 11 : mesDestino - 1;
  const anoAnt = mesDestino === 0 ? anoDestino - 1 : anoDestino;

  return {
    ...mapa,
    [chaveMes(mesDestino, anoDestino)]: {
      valor: resultadoMesAnterior,
      origemAno: anoAnt,
      origemMes: mesAnt,
    },
  };
}

/**
 * Recusa o saldo do mês anterior.
 * 
 * @ref legacy/Appliquei_v13.html:7328-7334
 */
export function recusarSaldoMesAnterior(
  mapa: CarryForwardMap,
  mesDestino: number,
  anoDestino: number
): CarryForwardMap {
  return {
    ...mapa,
    [chaveMes(mesDestino, anoDestino)]: {
      valor: 0,
      origemAno: null,
      origemMes: null,
      recusado: true,
    },
  };
}

/**
 * Desfaz a transferência de saldo.
 * 
 * @ref legacy/Appliquei_v13.html:7336-7342
 */
export function desfazerSaldoMesAnterior(
  mapa: CarryForwardMap,
  mesDestino: number,
  anoDestino: number
): CarryForwardMap {
  const novo = { ...mapa };
  delete novo[chaveMes(mesDestino, anoDestino)];
  return novo;
}

/**
 * Determina o estado do banner de carry-forward.
 * Retorna:
 *   - 'accepted' se já aceitou (mostra resumo + desfazer)
 *   - 'pending' se há saldo no mês anterior para oferecer
 *   - 'hidden' se recusou ou resultado anterior ≈ 0
 * 
 * @ref legacy/Appliquei_v13.html:7344-7385
 */
export function estadoBannerCarryForward(
  mapa: CarryForwardMap,
  mesAtual: number,
  anoAtual: number,
  resultadoMesAnterior: number
): {
  estado: 'accepted' | 'pending' | 'hidden';
  entry?: CarryForwardEntry;
  resultadoAnterior: number;
  mesAnterior: number;
  anoAnterior: number;
} {
  const mesAnt = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnt = mesAtual === 0 ? anoAtual - 1 : anoAtual;
  const reg = mapa[chaveMes(mesAtual, anoAtual)];

  if (reg) {
    if (reg.recusado || reg.valor === 0) {
      return { estado: 'hidden', resultadoAnterior: resultadoMesAnterior, mesAnterior: mesAnt, anoAnterior: anoAnt };
    }
    return { estado: 'accepted', entry: reg, resultadoAnterior: resultadoMesAnterior, mesAnterior: mesAnt, anoAnterior: anoAnt };
  }

  if (Math.abs(resultadoMesAnterior) < 0.01) {
    return { estado: 'hidden', resultadoAnterior: resultadoMesAnterior, mesAnterior: mesAnt, anoAnterior: anoAnt };
  }

  return { estado: 'pending', resultadoAnterior: resultadoMesAnterior, mesAnterior: mesAnt, anoAnterior: anoAnt };
}
