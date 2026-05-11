'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { calcularSimulador, buscarIPCAoficial } from '../../lib/calculations/simulator';
import { SimulatorHeroCard } from '../../components/simulador/SimulatorHeroCard';
import { SimulatorComparisonChart } from '../../components/simulador/SimulatorComparisonChart';
import { SimulatorPieCharts } from '../../components/simulador/SimulatorPieCharts';
import { formatarMoeda } from '../../lib/formatters';
import type { SimulatorParams } from '../../types/simulator';

/**
 * Independence Simulator Page — Investindo vs INSS.
 * 
 * Implementa a Phase 6 do Roadmap:
 *   - Inputs interativos (capital, aporte, taxa, inflação)
 *   - IPCA real via Banco Central API
 *   - Hero de impacto financeiro
 *   - Gráfico comparativo e doughnuts de composição
 *   - Tabela detalhada com ponto de inflexão
 * 
 * @ref legacy/Appliquei_v13.html:8338-8494
 */
export default function SimulatorPage() {
  const [params, setParams] = useState<SimulatorParams>({
    idadeAtual: 30,
    idadeIndependencia: 60,
    patrimonioAtual: 10000,
    aporteMensal: 1000,
    rendimentoAnual: 10,
    salarioINSS: 7500,
    inflacaoAnual: 4.5,
    gastosMensais: 5000,
  });

  const [showTable, setShowTable] = useState(false);
  const [loadingIPCA, setLoadingIPCA] = useState(false);
  const [ipcaData, setIpcaData] = useState<{ valor: number; data: string } | null>(null);

  useEffect(() => {
    const fetchIPCA = async () => {
      setLoadingIPCA(true);
      const data = await buscarIPCAoficial();
      if (data) {
        setIpcaData(data);
        setParams(p => ({ ...p, inflacaoAnual: data.valor }));
      }
      setLoadingIPCA(false);
    };
    fetchIPCA();
  }, []);

  const result = useMemo(() => calcularSimulador(params), [params]);
  const anosSim = params.idadeIndependencia - params.idadeAtual;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(p => ({ ...p, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cor-texto-principal)', marginBottom: '4px' }}>
          Simulador de Independência
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cor-texto-mutado)' }}>
          Descubra o impacto de investir por conta própria comparado ao INSS.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', flexWrap: 'wrap' }}>
        {/* Left: Inputs */}
        <div style={{ 
          background: 'var(--cor-branco)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid var(--cor-borda)',
          boxShadow: 'var(--shadow-card)',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Configurações</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InputGroup label="Patrimônio Atual" name="patrimonioAtual" value={params.patrimonioAtual} onChange={handleInputChange} prefix="R$" />
            <InputGroup label="Aporte Mensal" name="aporteMensal" value={params.aporteMensal} onChange={handleInputChange} prefix="R$" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputGroup label="Idade Atual" name="idadeAtual" value={params.idadeAtual} onChange={handleInputChange} />
              <InputGroup label="Independência" name="idadeIndependencia" value={params.idadeIndependencia} onChange={handleInputChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputGroup label="Rentab. a.a." name="rendimentoAnual" value={params.rendimentoAnual} onChange={handleInputChange} suffix="%" />
              <InputGroup 
                label="Inflação a.a." 
                name="inflacaoAnual" 
                value={params.inflacaoAnual} 
                onChange={handleInputChange} 
                suffix="%" 
                help={ipcaData ? `IPCA Oficial: ${ipcaData.valor}% (${ipcaData.data})` : 'Carregando IPCA...'}
              />
            </div>
            <InputGroup label="Gastos Mensais na Aposentadoria" name="gastosMensais" value={params.gastosMensais} onChange={handleInputChange} prefix="R$" />
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SimulatorHeroCard result={result} anos={anosSim} />
          
          <div style={{ 
            background: 'var(--cor-branco)', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid var(--cor-borda)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Evolução Comparativa</h3>
            <SimulatorComparisonChart result={result} height={300} />
          </div>

          <SimulatorPieCharts result={result} />

          {/* Table Toggle */}
          <button 
            onClick={() => setShowTable(!showTable)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--cor-superficie)',
              border: '1px dashed var(--cor-borda)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--cor-texto-secundario)'
            }}
          >
            {showTable ? '↑ Ocultar Tabela Detalhada' : '↓ Ver Tabela Detalhada (Mês a Mês)'}
          </button>

          {showTable && (
            <div style={{ 
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid var(--cor-borda)',
              background: 'var(--cor-branco)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ background: 'var(--cor-superficie)' }}>
                  <tr>
                    <th style={thStyle}>Mês</th>
                    <th style={thStyle}>Investido</th>
                    <th style={thStyle}>Renda Passiva</th>
                    <th style={thStyle}>Patrimônio</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tabela.filter(r => r.mes % 12 === 0 || r.isInflexao).map((row) => (
                    <tr key={row.mes} style={{ 
                      borderBottom: '1px solid var(--cor-borda)',
                      background: row.isInflexao ? 'var(--cor-bg-primaria)' : 'transparent'
                    }}>
                      <td style={tdStyle}>{row.mes} ({Math.floor(row.mes/12)}a)</td>
                      <td style={tdStyle}>{formatarMoeda(row.patrimonioINSS)}</td>
                      <td style={tdStyle}>{formatarMoeda(row.rendaPassiva)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{formatarMoeda(row.patrimonioInvestido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, prefix, suffix, help }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cor-texto-mutado)', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--cor-texto-mutado)' }}>{prefix}</span>}
        <input 
          type="number" 
          name={name}
          value={value} 
          onChange={onChange}
          style={{
            width: '100%',
            padding: `10px ${suffix ? '36px' : '12px'} 10px ${prefix ? '36px' : '12px'}`,
            borderRadius: '8px',
            border: '1px solid var(--cor-borda)',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: "'DM Mono', monospace"
          }}
        />
        {suffix && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--cor-texto-mutado)' }}>{suffix}</span>}
      </div>
      {help && <span style={{ fontSize: '10px', color: 'var(--cor-primaria)' }}>{help}</span>}
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: '10px 16px', textAlign: 'left' };
