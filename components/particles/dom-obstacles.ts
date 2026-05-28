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
  private frameCount = 0

  constructor(private camera: PerspectiveCamera, private container: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.dirty = true
    })
    this.resizeObserver.observe(container)

    document.fonts?.ready.then(() => { this.dirty = true })

    this.update()
  }

  markDirty() {
    this.dirty = true
  }

  update() {
    this.frameCount++
    if (!this.dirty && this.frameCount % 12 !== 0) return
    this.dirty = false

    const els = document.querySelectorAll('[data-obstacle="true"]')
    const containerRect = this.container.getBoundingClientRect()

    if (containerRect.width === 0 || containerRect.height === 0) return

    this.rects = []

    els.forEach(el => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const ls = parseFloat(style.letterSpacing)
      const lsOffset = isNaN(ls) ? 0 : ls

      const p = 0
      const left = rect.left - p
      const right = rect.right + p - lsOffset
      const top = rect.top - p
      const bottom = rect.bottom + p

      const nx1 = ((left - containerRect.left) / containerRect.width) * 2 - 1
      const nx2 = ((right - containerRect.left) / containerRect.width) * 2 - 1
      const ny1 = -((top - containerRect.top) / containerRect.height) * 2 + 1
      const ny2 = -((bottom - containerRect.top) / containerRect.height) * 2 + 1

      const vec1 = new Vector3(nx1, ny1, 0.5)
      vec1.unproject(this.camera)
      vec1.sub(this.camera.position).normalize()
      const dist1 = -this.camera.position.z / vec1.z
      const posTopLeft = this.camera.position.clone().add(vec1.multiplyScalar(dist1))

      const vec2 = new Vector3(nx2, ny2, 0.5)
      vec2.unproject(this.camera)
      vec2.sub(this.camera.position).normalize()
      const dist2 = -this.camera.position.z / vec2.z
      const posBottomRight = this.camera.position.clone().add(vec2.multiplyScalar(dist2))

      this.rects.push({
        left: posTopLeft.x,
        right: posBottomRight.x,
        top: posTopLeft.y,
        bottom: posBottomRight.y
      })
    })
  }

  dispose() {
    this.resizeObserver.disconnect()
  }
}
