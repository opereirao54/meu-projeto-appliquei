'use client';

import React from 'react';
import type { CarryForwardMap } from '../../types/transactions';
import { estadoBannerCarryForward } from '../../lib/calculations/carry-forward';
import { formatarMoeda, MESES_CURTOS } from '../../lib/formatters';

interface CarryForwardBannerProps {
  mesAtual: number;
  anoAtual: number;
  resultadoMesAnterior: number;
  carryForwardMap: CarryForwardMap;
  onAceitar: () => void;
  onRecusar: () => void;
  onDesfazer: () => void;
  className?: string;
}

/**
 * Banner de Saldo Carregado do Mês Anterior.
 * 
 * Oferece ao usuário a opção de levar o resultado do mês anterior para o mês atual.
 * Comportamento opt-in (não propaga automaticamente).
 * 
 * @ref legacy/Appliquei_v13.html:7344-7385
 */
export function CarryForwardBanner({
  mesAtual,
  anoAtual,
  resultadoMesAnterior,
  carryForwardMap,
  onAceitar,
  onRecusar,
  onDesfazer,
  className = '',
}: CarryForwardBannerProps) {
  const { estado, entry, mesAnterior, anoAnterior } = estadoBannerCarryForward(
    carryForwardMap,
    mesAtual,
    anoAtual,
    resultadoMesAnterior
  );

  if (estado === 'hidden') return null;

  const mesAntLabel = `${MESES_CURTOS[mesAnterior]}/${anoAnterior}`;
  const mesAtualLabel = `${MESES_CURTOS[mesAtual]}/${anoAtual}`;

  if (estado === 'accepted') {
    const valor = entry?.valor || 0;
    const sinal = valor >= 0 ? '+' : '';
    const cor = valor >= 0 ? 'var(--cor-primaria, #059669)' : 'var(--cor-erro, #dc2626)';

    return (
      <div
        className={className}
        style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'var(--cor-bg-primaria, #ecfdf5)',
          border: '1px solid var(--cor-borda-primaria, #a7f3d0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '16px' }}>💰</span>
          <div>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--cor-texto-principal)',
                fontWeight: 600,
              }}
            >
              Saldo de {mesAntLabel} transferido:
            </span>{' '}
            <strong
              style={{
                fontFamily: "'DM Mono', monospace",
                color: cor,
                fontSize: '13px',
              }}
            >
              {sinal}{formatarMoeda(valor)}
            </strong>
          </div>
        </div>

        <button
          onClick={onDesfazer}
          style={{
            background: 'transparent',
            border: '1px solid var(--cor-borda)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            color: 'var(--cor-texto-secundario)',
            fontFamily: "'Figtree', sans-serif",
          }}
        >
          ↩ Desfazer
        </button>
      </div>
    );
  }

  // estado === 'pending'
  const sinal = resultadoMesAnterior >= 0 ? '+' : '';
  const cor = resultadoMesAnterior >= 0 ? 'var(--cor-primaria, #059669)' : 'var(--cor-erro, #dc2626)';

  return (
    <div
      className={className}
      style={{
        padding: '14px 18px',
        borderRadius: '10px',
        background: 'var(--cor-bg-info, #eff6ff)',
        border: '1px solid var(--cor-borda-info, #93c5fd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <span style={{ fontSize: '16px' }}>📊</span>
        <div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--cor-texto-principal)',
              fontWeight: 600,
              marginBottom: '2px',
            }}
          >
            Resultado de {mesAntLabel}:{' '}
            <strong
              style={{
                fontFamily: "'DM Mono', monospace",
                color: cor,
              }}
            >
              {sinal}{formatarMoeda(resultadoMesAnterior)}
            </strong>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--cor-texto-mutado)',
            }}
          >
            Deseja transferir este saldo para {mesAtualLabel}?
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onAceitar}
          style={{
            background: 'var(--cor-primaria, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Figtree', sans-serif",
          }}
        >
          ✓ Transferir
        </button>
        <button
          onClick={onRecusar}
          style={{
            background: 'transparent',
            border: '1px solid var(--cor-borda)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            color: 'var(--cor-texto-secundario)',
            fontFamily: "'Figtree', sans-serif",
          }}
        >
          ✕ Não
        </button>
      </div>
    </div>
  );
}

export default CarryForwardBanner;
