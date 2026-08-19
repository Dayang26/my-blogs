/**
 * Three.js 场景初始化、渲染循环、层级整合
 */

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from 'three'
import { getConfig } from './config'
import { Pointer } from './pointer'
import { FlockLayer } from './flock-layer'
import { DomObstacles } from './dom-obstacles'

export type RendererContext = {
  dispose: () => void
}

export function initRenderer(
  canvas: HTMLCanvasElement,
  container: HTMLElement
): RendererContext | null {
  const config = getConfig()
  if (!config) return null

  const width = container.clientWidth
  const height = container.clientHeight

  // Scene
  const scene = new Scene()

  // Camera
  const camera = new PerspectiveCamera(
    config.camera.fov,
    width / height,
    0.1,
    100
  )
  camera.position.z = config.camera.z
  camera.updateMatrixWorld()

  // Renderer
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
  })
  const pixelRatio = Math.min(window.devicePixelRatio, 1.5)
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio)

  // Layers
  const pointer = new Pointer(container)
  const flockLayer = new FlockLayer(scene, config, pixelRatio)
  const domObstacles = new DomObstacles(camera, container)

  // Resize
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  const onResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      domObstacles.markDirty()
      domObstacles.update()
    }, 100)
  }
  window.addEventListener('resize', onResize)

  // Visibility & Viewport Intersection
  let isDocVisible = !document.hidden
  let isInViewport = true

  const checkPaused = () => !isDocVisible || !isInViewport

  const onVisibility = () => {
    isDocVisible = !document.hidden
  }
  document.addEventListener('visibilitychange', onVisibility)

  const intersectionObserver = new IntersectionObserver((entries) => {
    if (entries[0]) {
      isInViewport = entries[0].isIntersecting
    }
  }, { threshold: 0.05 })

  intersectionObserver.observe(container)

  // Animation loop
  let animId = 0
  let last = performance.now()
  let disposed = false

  function tick(now: number) {
    if (disposed) return

    animId = requestAnimationFrame(tick)

    if (checkPaused()) {
      last = now
      return
    }

    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now

    // 更新输入
    pointer.update(dt)

    // 事件驱动更新 DOM 障碍物真实位置（内部有 dirty guard）
    domObstacles.update()

    // 更新各层
    flockLayer.update(
      dt,
      pointer.anchorX,
      pointer.anchorY,
      pointer.angle,
      pointer.idleTime,
      domObstacles.rects,
      camera
    )

    // 渲染
    renderer.render(scene, camera)
  }

  animId = requestAnimationFrame(tick)

  return {
    dispose() {
      disposed = true
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      intersectionObserver.disconnect()
      if (resizeTimeout) clearTimeout(resizeTimeout)

      pointer.dispose()
      flockLayer.dispose()
      domObstacles.dispose()

      renderer.dispose()
    },
  }
}
