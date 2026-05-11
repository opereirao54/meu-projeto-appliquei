'use client';

import React, { useMemo } from 'react';
import type { TransactionSummary } from '../../types/transactions';
import { formatarMoeda, MESES_CURTOS } from '../../lib/formatters';
import { obterSaldoCarregadoParaMes } from '../../lib/calculations/carry-forward';
import type { CarryForwardMap } from '../../types/transactions';

interface DRERow {
  receita: number;
  resgate: number;
  invFixo: number;
  invVar: number;
  sonho: number;
  despesas: number;
  saldoAcumulado: number;
  saldoCarregado: number;
}

interface DRETableProps {
  /** Mês base da visão (0-11) */
  mesBase: number;
  /** Ano base da visão */
  anoBase: number;
  /** Número de meses a mostrar (default: 6) */
  qtdMeses?: number;
  /** Offset de meses para trás (default: -3) */
  offsetMeses?: number;
  /** Função para calcular resumo de um mês */
  calcResumo: (mes: number, ano: number) => TransactionSummary;
  /** Mapa de carry-forward */
  carryForward: CarryForwardMap;
  /** Meta verde (resultado bom) */
  metaVerde?: number;
  /** Meta vermelha (resultado ruim) */
  metaVermelha?: number;
  className?: string;
}

/**
 * Tabela DRE — Demonstrativo de Resultado mensal.
 * 
 * Reproduz exatamente a tabela DRE do legacy:
 *   - Receita Total
 *   - Resgates (Venda de Ativos)
 *   - Investimento (Renda Fixa / Variável)
 *   - Sonhos
 *   - Despesas Consumidas
 *   - Saldo trazido do mês anterior (opt-in)
 *   - Resultado do mês (com highlight positivo/negativo)
 * 
 * @ref legacy/Appliquei_v13.html:7903-7979
 */
export function DRETable({
  mesBase,
  anoBase,
  qtdMeses = 6,
  offsetMeses = -3,
  calcResumo,
  carryForward,
  metaVerde = 3000,
  metaVermelha = 1000,
  className = '',
}: DRETableProps) {
  const { meses, dados, indiceMesAtual } = useMemo(() => {
    let inicioMes = mesBase + offsetMeses;
    let inicioAno = anoBase;
    while (inicioMes < 0) { inicioMes += 12; inicioAno--; }
    while (inicioMes > 11) { inicioMes -= 12; inicioAno++; }
    const indiceMesAtual = -offsetMeses;

    const meses: string[] = [];
    const dados: DRERow[] = [];

    for (let i = 0; i < qtdMeses; i++) {
      let m = inicioMes + i;
      let a = inicioAno;
      while (m > 11) { m -= 12; a++; }

      const r = calcResumo(m, a);
      const despesas = r.despFixa + r.despVar + r.cartao;
      const saldoCarregadoMes = obterSaldoCarregadoParaMes(carryForward, m, a);
      const resultadoMes = r.receita + r.resgate - despesas - (r.invFixo + r.invVar) - r.sonho + saldoCarregadoMes;

      dados.push({
        receita: r.receita,
        resgate: r.resgate,
        invFixo: r.invFixo,
        invVar: r.invVar,
        sonho: r.sonho,
        despesas,
        saldoAcumulado: resultadoMes,
        saldoCarregado: saldoCarregadoMes,
      });

      meses.push(`${MESES_CURTOS[m]}/${String(a).slice(-2)}`);
    }

    return { meses, dados, indiceMesAtual };
  }, [mesBase, anoBase, qtdMeses, offsetMeses, calcResumo, carryForward]);

  const algumCarregado = dados.some((d) => Math.abs(d.saldoCarregado || 0) > 0.005);

  const linhas: Array<{
    label: string;
    values: (d: DRERow) => string;
    color: (d: DRERow) => string;
    isTotal?: boolean;
    titleAttr?: string;
  }> = [
    {
      label: 'Receita Total',
      values: (d) => formatarMoeda(d.receita),
      color: () => 'var(--cor-primaria)',
    },
    {
      label: 'Resgates (Venda de Ativos)',
      values: (d) => formatarMoeda(d.resgate),
      color: () => 'var(--cor-primaria)',
    },
    {
      label: 'Investimento (Renda Fixa)',
      values: (d) => (d.invFixo > 0 ? `-${formatarMoeda(d.invFixo)}` : 'R$ 0,00'),
      color: () => 'var(--cor-info, #2563eb)',
    },
    {
      label: 'Investimento (Renda Variável)',
      values: (d) => (d.invVar > 0 ? `-${formatarMoeda(d.invVar)}` : 'R$ 0,00'),
      color: () => 'var(--cor-info, #2563eb)',
    },
    {
      label: 'Sonhos (separado p/ metas)',
      values: (d) => (d.sonho > 0 ? `-${formatarMoeda(d.sonho)}` : 'R$ 0,00'),
      color: () => '#7c3aed',
    },
    {
      label: 'Despesas Consumidas',
      values: (d) => (d.despesas > 0 ? `-${formatarMoeda(d.despesas)}` : 'R$ 0,00'),
      color: () => 'var(--cor-erro, #dc2626)',
    },
  ];

  return (
    <div
      className={className}
      style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius, 14px)',
        border: '1px solid var(--cor-borda, #dfe7e0)',
        background: 'var(--cor-branco, #ffffff)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12.5px',
          fontFamily: "'Figtree', sans-serif",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                fontWeight: 700,
                fontSize: '12px',
                color: 'var(--cor-texto-principal)',
                borderBottom: '1px solid var(--cor-borda)',
                minWidth: '190px',
                position: 'sticky',
                left: 0,
                background: 'var(--cor-branco)',
                zIndex: 1,
              }}
            >
              Demonstrativo contábil
            </th>
            {meses.map((lbl, i) => (
              <th
                key={lbl}
                style={{
                  textAlign: 'right',
                  padding: '12px 16px',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: 'var(--cor-texto-principal)',
                  borderBottom: '1px solid var(--cor-borda)',
                  minWidth: '120px',
                  background: i === indiceMesAtual ? 'var(--cor-bg-info, #eff6ff)' : undefined,
                }}
              >
                {lbl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.label}>
              <td
                style={{
                  fontWeight: 600,
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--cor-borda)',
                  position: 'sticky',
                  left: 0,
                  background: 'var(--cor-branco)',
                  zIndex: 1,
                  color: 'var(--cor-texto-principal)',
                }}
              >
                {linha.label}
              </td>
              {dados.map((d, i) => (
                <td
                  key={i}
                  style={{
                    textAlign: 'right',
                    padding: '10px 16px',
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '12px',
                    color: linha.color(d),
                    borderBottom: '1px solid var(--cor-borda)',
                    background: i === indiceMesAtual ? '#eff6ff' : undefined,
                  }}
                >
                  {linha.values(d)}
                </td>
              ))}
            </tr>
          ))}

          {/* Carry-forward row */}
          {algumCarregado && (
            <tr>
              <td
                style={{
                  fontWeight: 600,
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--cor-borda)',
                  position: 'sticky',
                  left: 0,
                  background: 'var(--cor-branco)',
                  zIndex: 1,
                  color: 'var(--cor-texto-principal)',
                }}
                title="Saldo trazido do mês anterior por opção do usuário"
              >
                Saldo trazido do mês anterior
              </td>
              {dados.map((d, i) => {
                const v = d.saldoCarregado || 0;
                const cor = v >= 0 ? '#7c3aed' : 'var(--cor-erro)';
                return (
                  <td
                    key={i}
                    style={{
                      textAlign: 'right',
                      padding: '10px 16px',
                      fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '12px',
                      color: cor,
                      borderBottom: '1px solid var(--cor-borda)',
                      background: i === indiceMesAtual ? '#eff6ff' : undefined,
                    }}
                  >
                    {Math.abs(v) > 0.005 ? formatarMoeda(v) : '—'}
                  </td>
                );
              })}
            </tr>
          )}

          {/* Result row */}
          <tr>
            <td
              style={{
                fontWeight: 700,
                padding: '12px 16px',
                position: 'sticky',
                left: 0,
                background: 'var(--cor-bg-primaria, #ecfdf5)',
                zIndex: 1,
                color: 'var(--cor-texto-principal)',
              }}
              title="Resultado do mês — sem cumular automaticamente entre meses."
            >
              Resultado do mês
            </td>
            {dados.map((d, i) => {
              let corSaldo = 'var(--cor-texto-principal)';
              let fontW = 600;
              let badge: React.ReactNode = null;

              if (d.saldoAcumulado < 0) {
                corSaldo = 'var(--cor-erro)';
                fontW = 800;
                badge = (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '9px',
                      background: 'var(--cor-erro)',
                      color: '#fff',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      fontWeight: 700,
                    }}
                  >
                    NEGATIVO
                  </span>
                );
              } else if (d.saldoAcumulado < metaVermelha) {
                corSaldo = 'var(--cor-erro)';
                fontW = 700;
              } else if (d.saldoAcumulado >= metaVerde) {
                corSaldo = 'var(--cor-primaria)';
                fontW = 700;
              }

              return (
                <td
                  key={i}
                  style={{
                    textAlign: 'right',
                    padding: '12px 16px',
                    fontWeight: fontW,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '13px',
                    color: corSaldo,
                    background:
                      i === indiceMesAtual
                        ? '#d1fae5'
                        : 'var(--cor-bg-primaria, #ecfdf5)',
                  }}
                >
                  {formatarMoeda(d.saldoAcumulado)}
                  {badge}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DRETable;
