import { PerspectiveCamera, Vector3 } from 'three'

export type AABB = {
  left: number
  right: number
  top: number
  bottom: number
}

export class DomObstacles {
  public rects: AABB[] = []
  private dirty = true
  private resizeObserver: ResizeObserver
  private timers: ReturnType<typeof setTimeout>[] = []

  // 复用计算向量以避免运行时内存分配与 GC 抖动
  private static v1 = new Vector3()
  private static v2 = new Vector3()
  private static camPos = new Vector3()

  constructor(private camera: PerspectiveCamera, private container: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.dirty = true
    })
    this.resizeObserver.observe(container)

    document.fonts?.ready.then(() => {
      this.dirty = true
    })

    // 在页面初次加载的动画与字体排版稳定期触发检查
    const warmupDelays = [100, 300, 800]
    warmupDelays.forEach((delay) => {
      const t = setTimeout(() => {
        this.dirty = true
      }, delay)
      this.timers.push(t)
    })

    this.update()
  }

  markDirty() {
    this.dirty = true
  }

  update() {
    if (!this.dirty) return
    this.dirty = false

    const els = document.querySelectorAll('[data-obstacle="true"]')
    const containerRect = this.container.getBoundingClientRect()

    if (containerRect.width === 0 || containerRect.height === 0) return

    this.rects = []
    const cameraPos = DomObstacles.camPos.copy(this.camera.position)

    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const ls = parseFloat(style.letterSpacing)
      const lsOffset = isNaN(ls) ? 0 : ls

      const left = rect.left
      const right = rect.right - lsOffset
      const top = rect.top
      const bottom = rect.bottom

      const nx1 = ((left - containerRect.left) / containerRect.width) * 2 - 1
      const nx2 = ((right - containerRect.left) / containerRect.width) * 2 - 1
      const ny1 = -((top - containerRect.top) / containerRect.height) * 2 + 1
      const ny2 = -((bottom - containerRect.top) / containerRect.height) * 2 + 1

      const vec1 = DomObstacles.v1.set(nx1, ny1, 0.5)
      vec1.unproject(this.camera)
      vec1.sub(cameraPos).normalize()
      const dist1 = -cameraPos.z / vec1.z
      const x1 = cameraPos.x + vec1.x * dist1
      const y1 = cameraPos.y + vec1.y * dist1

      const vec2 = DomObstacles.v2.set(nx2, ny2, 0.5)
      vec2.unproject(this.camera)
      vec2.sub(cameraPos).normalize()
      const dist2 = -cameraPos.z / vec2.z
      const x2 = cameraPos.x + vec2.x * dist2
      const y2 = cameraPos.y + vec2.y * dist2

      this.rects.push({
        left: Math.min(x1, x2),
        right: Math.max(x1, x2),
        top: Math.max(y1, y2),
        bottom: Math.min(y1, y2),
      })
    })
  }

  dispose() {
    this.resizeObserver.disconnect()
    this.timers.forEach((t) => clearTimeout(t))
    this.timers = []
  }
}

