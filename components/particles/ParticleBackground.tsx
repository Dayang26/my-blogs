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

    let disposed = false

    const syncViewportWidth = () => {
      container.style.width = `${document.documentElement.clientWidth}px`
    }

    syncViewportWidth()
    window.addEventListener('resize', syncViewportWidth)

    if (!disposed) {
      const ctx = initRenderer(canvas, container)
      ctxRef.current = ctx
      if (ctx) {
        ctx.setMode(mode)
      }
    }

    const handleCustomMode = (e: CustomEvent<{ mode: ParticleMode }>) => {
      if (e.detail?.mode && ctxRef.current) {
        ctxRef.current.setMode(e.detail.mode)
      }
    }

    window.addEventListener('change-particle-mode' as string, handleCustomMode as EventListener)

    return () => {
      disposed = true
      window.removeEventListener('resize', syncViewportWidth)
      window.removeEventListener('change-particle-mode' as string, handleCustomMode as EventListener)
      ctxRef.current?.dispose()
      ctxRef.current = null
    }
  }, [mode])

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
