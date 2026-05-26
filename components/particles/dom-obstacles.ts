import { PerspectiveCamera, Vector3 } from 'three'

export type AABB = {
  left: number
  right: number
  top: number
  bottom: number
}

export class DomObstacles {
  public rects: AABB[] = []
  private handleUpdate: () => void

  constructor(private camera: PerspectiveCamera, private container: HTMLElement) {
    this.handleUpdate = () => this.update()
    
    // 初始化并监听更新
    this.update()
    window.addEventListener('resize', this.handleUpdate)
    window.addEventListener('scroll', this.handleUpdate)
    
    // 使用 MutationObserver 监听可能的 DOM 动态变化（如字体加载导致布局变化）
    const observer = new MutationObserver(this.handleUpdate)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    // 为了防止 observer 无法清除，将其挂载到 dispose
    this.observer = observer
  }
  
  private observer: MutationObserver

  update() {
    const els = document.querySelectorAll('[data-obstacle="true"]')
    const containerRect = this.container.getBoundingClientRect()
    
    // 如果容器高度或宽度为0，则跳过
    if (containerRect.width === 0 || containerRect.height === 0) return

    this.rects = []
    
    els.forEach(el => {
      const rect = el.getBoundingClientRect()
      
      // 5px 的 Padding
      const p = 5
      const left = rect.left - p
      const right = rect.right + p
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
    window.removeEventListener('resize', this.handleUpdate)
    window.removeEventListener('scroll', this.handleUpdate)
    this.observer.disconnect()
  }
}
