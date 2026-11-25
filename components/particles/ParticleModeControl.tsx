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
  enabled: boolean;
  currentMode: ParticleMode;
  onToggle: () => void;
  onModeChange: (mode: ParticleMode) => void;
};

export function ParticleModeControl({
  enabled,
  currentMode,
  onToggle,
  onModeChange,
}: ParticleModeControlProps) {
  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled, onModeChange]);

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="glass-button inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium text-[var(--text-secondary)] select-none"
        title="开启背景流体粒子动效"
      >
        <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-50 blur-[2px]" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        </span>
        <span>开启粒子流光</span>
      </button>
    );
  }

  return (
    <div
      className="glass-pill inline-flex items-center rounded-full p-1 select-none animate-fade-in"
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
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10.5px] font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow-[0_4px_12px_-2px_var(--accent-glow),inset_0_1px_0_rgba(255,255,255,0.4)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isActive && (
              <span className="h-1 w-1 rounded-full bg-current opacity-90" aria-hidden="true" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="mx-1 h-3.5 w-px bg-[var(--border)]" aria-hidden="true" />

      <button
        type="button"
        onClick={onToggle}
        title="关闭粒子特效"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-90"
        aria-label="关闭粒子动效"
      >
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
