'use client';

import React, { useEffect, useRef, useState } from 'react';
import { calcProgressRingSVG } from '../../lib/calculations/dreams';

interface ProgressRingProps {
  /** Percentual de conclusão (0 a 100+) */
  percent: number;
  /** Raio do anel em px (default: 58) */
  radius?: number;
  /** Largura do traço em px (default: 10) */
  strokeWidth?: number;
  /** Tamanho total do SVG (default: 140) */
  size?: number;
  /** Mostrar texto central */
  showLabel?: boolean;
  /** Label personalizado (default: "{pct}%") */
  label?: string;
  /** Sublabel (default: "concluído") */
  sublabel?: string;
  /** Animar ao entrar na viewport */
  animate?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Progress Ring SVG — componente visual de anel de progresso.
 * 
 * Reproduz exatamente o visual do legacy renderSonhoRing():
 *   - Raio 58, circunferência 2πr ≈ 364.42
 *   - Cores: ≥100% → #10b981, ≥60% → #059669, ≥30% → #d97706, <30% → #ef4444
 *   - Offset = circumference - (pct/100) × circumference
 * 
 * @ref legacy/Appliquei_v13.html:9080-9099
 */
export function ProgressRing({
  percent,
  radius = 58,
  strokeWidth = 10,
  size = 140,
  showLabel = true,
  label,
  sublabel = 'concluído',
  animate = true,
  className = '',
}: ProgressRingProps) {
  const { circumference, offset, color } = calcProgressRingSVG(percent, radius);
  const [animatedOffset, setAnimatedOffset] = useState(animate ? circumference : offset);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!animate) {
      setAnimatedOffset(offset);
      return;
    }

    // Trigger animation on mount
    const timer = requestAnimationFrame(() => {
      setAnimatedOffset(offset);
    });

    return () => cancelAnimationFrame(timer);
  }, [offset, animate, circumference]);

  const displayPercent = Math.min(percent, 100).toFixed(0);
  const displayLabel = label || `${displayPercent}%`;

  return (
    <div
      className={`progress-ring-wrap ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--cor-borda, #dfe7e0)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Progress circle */}
        <circle
          ref={ringRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          style={{
            transition: animate ? 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        />
      </svg>

      {showLabel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              color: 'var(--cor-texto-principal, #101e13)',
              lineHeight: 1,
            }}
          >
            {displayLabel}
          </span>
          {sublabel && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--cor-texto-mutado, #7a9480)',
                marginTop: '2px',
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressRing;
