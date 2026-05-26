/**
 * 鼠标/触摸输入平滑处理
 * 使用弹性阻尼模型让 anchor 带惯性地跟随鼠标
 */

export class Pointer {
  /** 原始鼠标位置（NDC 坐标 -1~1） */
  rawX = 0
  rawY = 0

  /** 平滑 anchor 位置 */
  anchorX = 0
  anchorY = 0

  /** anchor 速度 */
  private vx = 0
  private vy = 0

  /** anchor 运动方向角（弧度） */
  angle = 0

  /** 是否有鼠标活动 */
  active = false

  private onMove: (e: MouseEvent) => void
  private onLeave: () => void

  constructor(private container: HTMLElement) {
    this.onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      this.rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      this.active = true
    }

    this.onLeave = () => {
      this.active = false
    }

    container.addEventListener('mousemove', this.onMove)
    container.addEventListener('mouseleave', this.onLeave)
  }

  update(dt: number) {
    if (!this.active) {
      // 鼠标离开后 anchor 缓慢回到中心
      this.vx *= Math.pow(0.01, dt)
      this.vy *= Math.pow(0.01, dt)
      this.anchorX += this.vx * dt
      this.anchorY += this.vy * dt
      return
    }

    const dx = this.rawX - this.anchorX
    const dy = this.rawY - this.anchorY

    // 弹性加速
    this.vx += dx * 3.0 * dt
    this.vy += dy * 3.0 * dt

    // 阻尼衰减
    const damping = Math.pow(0.05, dt)
    this.vx *= damping
    this.vy *= damping

    this.anchorX += this.vx
    this.anchorY += this.vy

    // 计算运动方向
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 0.001) {
      this.angle = Math.atan2(this.vy, this.vx)
    }
  }

  dispose() {
    this.container.removeEventListener('mousemove', this.onMove)
    this.container.removeEventListener('mouseleave', this.onLeave)
  }
}
