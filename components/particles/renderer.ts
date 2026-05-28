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

  // Renderer
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Layers
  const pointer = new Pointer(container)
  const flockLayer = new FlockLayer(scene, config)
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

  // Visibility
  let paused = false
  const onVisibility = () => {
    paused = document.hidden
  }
  document.addEventListener('visibilitychange', onVisibility)

  // Animation loop
  let animId = 0
  let last = performance.now()
  let disposed = false

  function tick(now: number) {
    if (disposed) return

    animId = requestAnimationFrame(tick)

    if (paused) {
      last = now
      return
    }

    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now

    // 更新输入
    pointer.update(dt)

    // 每帧强行更新相机世界矩阵，以保证 domObstacles 中 unproject 计算准确
    camera.updateMatrixWorld()
    // 每帧同步一次 DOM 的真实位置（应对字体加载、动画渲染带来的动态位移）
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
      if (resizeTimeout) clearTimeout(resizeTimeout)

      pointer.dispose()
      flockLayer.dispose()
      domObstacles.dispose()

      renderer.dispose()
    },
  }
}
