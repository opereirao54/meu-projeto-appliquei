'use client';

import React, { useState } from 'react';
import type { Dream } from '../../types/dreams';
import {
  calcSonhoMensal,
  statusSonho,
  calcularProgresso,
  gerarAlertaSonho,
  corProgressRing,
} from '../../lib/calculations/dreams';
import { formatarMoeda } from '../../lib/formatters';
import { ProgressRing } from './ProgressRing';
import { DREAM_EMOJIS } from '../../lib/constants';

interface DreamCardProps {
  dream: Dream;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddContribution?: (id: string) => void;
  onLinkPlan?: (id: string) => void;
  className?: string;
}

/**
 * Dream Card — card expansível com progress ring e detalhes.
 * 
 * Reproduz o visual do legacy renderizarSonhos():
 *   - Collapsed: emoji + nome + badges + barra + pct
 *   - Expanded: progress ring + PMT + timeline + alerta
 * 
 * @ref legacy/Appliquei_v13.html:9101-9199
 */
export function DreamCard({
  dream,
  onEdit,
  onDelete,
  onAddContribution,
  onLinkPlan,
  className = '',
}: DreamCardProps) {
  const [expanded, setExpanded] = useState(false);

  const pct = Math.min(100, (dream.valorAtual / dream.valorTotal) * 100);
  const mensal = calcSonhoMensal(dream.valorTotal, dream.valorAtual, dream.mesesRestantes || dream.prazoMeses);
  const status = statusSonho(dream);
  const progresso = calcularProgresso(dream);
  const alerta = gerarAlertaSonho(dream);
  const emoji = DREAM_EMOJIS[dream.categoria] || '⭐';
  const falta = Math.max(0, dream.valorTotal - dream.valorAtual);
  const conquistado = pct >= 100;
  const barColor = corProgressRing(pct);

  const esforcoLabels: Record<string, string> = {
    baixo: '🌱 Leve',
    medio: '⚡ Moderado',
    alto: '🔥 Intenso',
  };

  let tempoLabel: string;
  if (conquistado) tempoLabel = '🏆 Conquistado';
  else if (status === 'agendado') tempoLabel = '🕒 Agendado';
  else if (status === 'vencido') tempoLabel = '⏰ Prazo encerrado';
  else {
    const mr = dream.mesesRestantes || dream.prazoMeses;
    tempoLabel = mr > 0 ? `⏱ ${mr} ${mr === 1 ? 'mês restante' : 'meses restantes'}` : '⏰ Prazo encerrado';
  }

  const statusBadge = () => {
    const badges: Record<string, { label: string; bg: string; color: string }> = {
      agendado: { label: '🕐 Agendado', bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9' },
      conquistado: { label: '🏆 Conquistado', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
      vencido: { label: '⚠ Vencido', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    };
    const b = badges[status];
    if (!b) return null;
    return (
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '99px',
          background: b.bg,
          color: b.color,
          marginLeft: '6px',
        }}
      >
        {b.label}
      </span>
    );
  };

  return (
    <div
      className={`${className} ${conquistado ? 'dream-conquered' : ''}`}
      style={{
        background: 'var(--cor-branco, #ffffff)',
        border: '1px solid var(--cor-borda, #dfe7e0)',
        borderRadius: 'var(--radius, 14px)',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Collapsed view */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 18px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--cor-superficie, #edf0ed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--cor-texto-principal)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {dream.titulo}
            </span>
            {statusBadge()}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              fontSize: '11px',
              color: 'var(--cor-texto-mutado)',
              fontWeight: 500,
            }}
          >
            <span>{tempoLabel}</span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
                color: 'var(--cor-texto-principal)',
              }}
            >
              🎯 {formatarMoeda(dream.valorTotal)}
            </span>
            {!conquistado && (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  color: 'var(--cor-primaria)',
                }}
              >
                💰 {formatarMoeda(mensal)}/mês
              </span>
            )}
          </div>
        </div>

        {/* Progress bar mini */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div
            style={{
              width: '80px',
              height: '6px',
              borderRadius: '99px',
              background: 'var(--cor-superficie, #edf0ed)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: barColor,
                borderRadius: '99px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              color: barColor,
              minWidth: '35px',
              textAlign: 'right',
            }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--cor-texto-mutado)',
            padding: '4px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </button>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--cor-borda)',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Alert */}
          {alerta && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.5,
                background:
                  alerta.tipo === 'danger'
                    ? 'rgba(239,68,68,0.08)'
                    : alerta.tipo === 'warn'
                    ? 'rgba(245,158,11,0.08)'
                    : 'rgba(16,185,129,0.08)',
                color:
                  alerta.tipo === 'danger'
                    ? '#ef4444'
                    : alerta.tipo === 'warn'
                    ? '#d97706'
                    : '#10b981',
                border: `1px solid ${
                  alerta.tipo === 'danger'
                    ? 'rgba(239,68,68,0.2)'
                    : alerta.tipo === 'warn'
                    ? 'rgba(245,158,11,0.2)'
                    : 'rgba(16,185,129,0.2)'
                }`,
              }}
            >
              {alerta.msg}
            </div>
          )}

          {/* Ring + Details */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {/* Progress Ring */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ProgressRing percent={pct} />
            </div>

            {/* Details grid */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <DetailItem label="Guardado" value={formatarMoeda(dream.valorAtual)} color="var(--cor-primaria)" />
                <DetailItem label="Falta" value={formatarMoeda(falta)} color="var(--cor-texto-principal)" />
                <DetailItem label="Aporte/mês" value={formatarMoeda(mensal)} color="var(--cor-primaria)" />
                <DetailItem
                  label="Tempo estimado"
                  value={`${progresso.tempoEstimado} meses`}
                  color={progresso.noTrack ? 'var(--cor-texto-principal)' : '#ef4444'}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!conquistado && onAddContribution && (
                  <ActionButton
                    onClick={() => onAddContribution(dream.id)}
                    icon="💰"
                    label="Registrar aporte"
                    primary
                  />
                )}
                {!conquistado && !dream.planoVinculado && onLinkPlan && (
                  <ActionButton
                    onClick={() => onLinkPlan(dream.id)}
                    icon="📋"
                    label="Vincular ao Controle"
                  />
                )}
                {onEdit && (
                  <ActionButton onClick={() => onEdit(dream.id)} icon="✏️" label="Editar" />
                )}
                {onDelete && (
                  <ActionButton
                    onClick={() => onDelete(dream.id)}
                    icon="🗑️"
                    label="Excluir"
                    danger
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contributions timeline */}
          {dream.aportes && dream.aportes.length > 0 && (
            <div style={{ marginTop: '18px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--cor-texto-principal)',
                  marginBottom: '8px',
                }}
              >
                Aportes recentes
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {[...dream.aportes]
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .slice(0, 5)
                  .map((aporte) => (
                    <div
                      key={aporte.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px dashed var(--cor-borda)',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: 'var(--cor-texto-mutado)' }}>
                        {new Date(aporte.data).toLocaleDateString('pt-BR')}
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '10px',
                            background: 'var(--cor-superficie)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                          }}
                        >
                          {aporte.tipo === 'manual' ? 'Manual' : aporte.tipo === 'mensal_pago' ? 'Mensal' : 'Migrado'}
                        </span>
                      </span>
                      <strong
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          color: 'var(--cor-primaria)',
                        }}
                      >
                        +{formatarMoeda(aporte.valor)}
                      </strong>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '10px 12px',
        border: '1px solid var(--cor-borda)',
        borderRadius: '9px',
        background: 'var(--cor-superficie, #edf0ed)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          color: 'var(--cor-texto-mutado)',
          marginBottom: '2px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
  danger = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Figtree', sans-serif",
        border: primary ? 'none' : '1px solid var(--cor-borda)',
        background: primary
          ? 'var(--cor-primaria, #059669)'
          : danger
          ? 'transparent'
          : 'transparent',
        color: primary
          ? '#fff'
          : danger
          ? 'var(--cor-erro, #dc2626)'
          : 'var(--cor-texto-secundario)',
        transition: 'all 0.15s',
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

export default DreamCard;
