'use client';

import React, { useEffect } from 'react';
import type { ParticleMode } from './config';

type ModeItem = {
  id: ParticleMode;
  label: string;
  keyNum: string;
  title: string;
};

const MODES: ModeItem[] = [
  { id: 'flock', label: 'Flock', keyNum: '1', title: 'Flock 仿生鸟群 (按 1)' },
  { id: 'vortex', label: 'Vortex', keyNum: '2', title: 'Vortex 引力黑洞 (按 2)' },
  { id: 'morph', label: 'Morph', keyNum: '3', title: 'Morph 矩阵字阵 (按 3)' },
  { id: 'fireworks', label: 'Dust', keyNum: '4', title: 'Dust 太空星尘 (按 4)' },
];

type ParticleModeControlProps = {
  currentMode: ParticleMode;
  onModeChange: (mode: ParticleMode) => void;
};

export function ParticleModeControl({ currentMode, onModeChange }: ParticleModeControlProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === '1') onModeChange('flock');
      else if (e.key === '2') onModeChange('vortex');
      else if (e.key === '3') onModeChange('morph');
      else if (e.key === '4') onModeChange('fireworks');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onModeChange]);

  return (
    <div 
      className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/75 p-0.5 backdrop-blur-md shadow-sm opacity-65 hover:opacity-100 transition-opacity duration-200 select-none"
      role="tablist"
      aria-label="Particle mode switch"
    >
      {MODES.map((item) => {
        const isActive = currentMode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(item.id)}
            title={item.title}
            className={`relative flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wider uppercase transition-all duration-200 ${
              isActive
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {isActive && (
              <span className="h-1 w-1 rounded-full bg-white/90 animate-pulse" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
