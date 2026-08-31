'use client'

import { useRef, useEffect } from 'react'
import { initRenderer, type RendererContext } from './renderer'
import type { ParticleMode } from './config'

export function ParticleBackground({ mode = 'flock' }: { mode?: ParticleMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<RendererContext | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const syncViewportWidth = () => {
      container.style.width = `${document.documentElement.clientWidth}px`
    }

    syncViewportWidth()
    window.addEventListener('resize', syncViewportWidth)

    // 仅初始化一次；mode 变更由下方 effect 处理，避免重建 WebGL context
    ctxRef.current = initRenderer(canvas, container)

    return () => {
      window.removeEventListener('resize', syncViewportWidth)
      ctxRef.current?.dispose()
      ctxRef.current = null
    }
  }, [])

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.setMode(mode)
    }
  }, [mode])

  return (
    <div
      ref={containerRef}
      className="absolute top-0 h-full overflow-hidden"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  )
}
