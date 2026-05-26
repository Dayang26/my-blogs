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

  /** 鼠标静止时长（秒） */
  idleTime = 0

  private onMove: (e: MouseEvent) => void
  private onLeave: () => void
  private movedThisFrame = false
  private lastClientX: number | null = null
  private lastClientY: number | null = null

  constructor(private container: HTMLElement) {
    this.onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      this.rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      this.active = true

      if (
        this.lastClientX === null ||
        this.lastClientY === null ||
        Math.hypot(e.clientX - this.lastClientX, e.clientY - this.lastClientY) > 0.5
      ) {
        this.idleTime = 0
        this.movedThisFrame = true
        this.lastClientX = e.clientX
        this.lastClientY = e.clientY
      }
    }

    this.onLeave = () => {
      this.active = false
      this.idleTime = 0
      this.rawX = 0
      this.rawY = 0
      this.lastClientX = null
      this.lastClientY = null
    }

    container.addEventListener('mousemove', this.onMove)
    container.addEventListener('mouseleave', this.onLeave)
  }

  update(dt: number) {
    if (!this.active) {
      // 鼠标离开后以画布中心作为默认 idle 锚点
      const dx = -this.anchorX
      const dy = -this.anchorY

      this.vx += dx * 3.0 * dt
      this.vy += dy * 3.0 * dt

      const damping = Math.pow(0.05, dt)
      this.vx *= damping
      this.vy *= damping

      this.anchorX += this.vx
      this.anchorY += this.vy

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
      if (speed > 0.001) {
        this.angle = Math.atan2(this.vy, this.vx)
      }

      this.idleTime += dt
      this.movedThisFrame = false
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

    if (this.movedThisFrame) {
      this.movedThisFrame = false
    } else {
      this.idleTime += dt
    }
  }

  dispose() {
    this.container.removeEventListener('mousemove', this.onMove)
    this.container.removeEventListener('mouseleave', this.onLeave)
  }
}
