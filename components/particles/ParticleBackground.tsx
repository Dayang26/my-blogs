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

    // 动态导入 Three.js 渲染器，避免阻塞首屏
    import('./renderer').then(({ initRenderer }) => {
      if (!canvasRef.current || !containerRef.current) return
      ctx = initRenderer(canvas, container)
    })

    return () => {
      ctx?.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  )
}
