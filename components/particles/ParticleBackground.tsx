'use client'

import { useRef, useEffect } from 'react'
import type { RendererContext } from './renderer'

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let ctx: RendererContext | null = null
    let disposed = false

    const syncViewportWidth = () => {
      container.style.width = `${document.documentElement.clientWidth}px`
    }

    syncViewportWidth()
    window.addEventListener('resize', syncViewportWidth)

    import('./renderer').then(({ initRenderer }) => {
      if (disposed || !canvasRef.current || !containerRef.current) return
      ctx = initRenderer(canvas, container)
    })

    return () => {
      disposed = true
      window.removeEventListener('resize', syncViewportWidth)
      ctx?.dispose()
    }
  }, [])

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
