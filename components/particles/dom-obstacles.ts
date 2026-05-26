import { PerspectiveCamera, Vector3 } from 'three'

export type AABB = {
  left: number
  right: number
  top: number
  bottom: number
}

export class DomObstacles {
  public rects: AABB[] = []
  constructor(private camera: PerspectiveCamera, private container: HTMLElement) {
    // 移除事件监听，改在 renderer 的 tick 中每帧更新，以保证应对所有字体加载和动画
  }

  update() {
    const els = document.querySelectorAll('[data-obstacle="true"]')
    const containerRect = this.container.getBoundingClientRect()
    
    if (containerRect.width === 0 || containerRect.height === 0) return

    this.rects = []

    els.forEach(el => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const ls = parseFloat(style.letterSpacing)
      const lsOffset = isNaN(ls) ? 0 : ls

      // 0px Padding，完全使用字体原本的边界，确保字母间物理缝隙最大化
      // 关键修复：getBoundingClientRect 会包含 letter-spacing 的宽度，导致盒子在右侧相连。我们需要减去它！
      const p = 0
      const left = rect.left - p
      const right = rect.right + p - lsOffset
      const top = rect.top - p
      const bottom = rect.bottom + p
      
      // 转换为 NDC 坐标 (-1 到 1) 相对于 Canvas 容器
      const nx1 = ((left - containerRect.left) / containerRect.width) * 2 - 1
      const nx2 = ((right - containerRect.left) / containerRect.width) * 2 - 1
      const ny1 = -((top - containerRect.top) / containerRect.height) * 2 + 1
      const ny2 = -((bottom - containerRect.top) / containerRect.height) * 2 + 1

      // 投影左上角 (nx1, ny1)
      const vec1 = new Vector3(nx1, ny1, 0.5)
      vec1.unproject(this.camera)
      vec1.sub(this.camera.position).normalize()
      const dist1 = -this.camera.position.z / vec1.z
      const posTopLeft = this.camera.position.clone().add(vec1.multiplyScalar(dist1))

      // 投影右下角 (nx2, ny2)
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
    // 已经移到 tick 里每帧处理，无需手动清理事件
  }
}
