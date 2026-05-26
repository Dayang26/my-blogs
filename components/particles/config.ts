/**
 * 粒子系统集中配置
 * 保留了 Flock 层和 Camera 层，移除了纯背景粒子和随机障碍物
 */

export type ParticleConfig = {
  /** 是否启用粒子系统 */
  enabled: boolean
  /** 鸟群/粒子簇（Flock）行为及渲染配置 */
  flock: {
    /** 粒子总数 */
    count: number
    /** 粒子尺寸范围 [最小值, 最大值] */
    sizeRange: [number, number]
    /** 粒子运动的最大速度 */
    maxSpeed: number
    /** 粒子受力的最大限制（影响转向灵活性） */
    maxForce: number
    /** 粒子的基础透明度 */
    opacity: number
    /** 颜色渐变速度 */
    spectrumSpeed: number
    /** 进入空闲状态（idle）的延迟时间（秒） */
    idleStartDelay: number
    /** 进入空闲状态的过渡动画持续时间（秒） */
    idleRampDuration: number
    /** 空闲状态下的循环动画速度 */
    idleCycleSpeed: number
    /** 空闲状态下 Z 轴的运动范围 [最小深度, 最大深度] */
    idleZRange: [number, number]
    /** 非空闲状态下粒子的最小可视深度，避免退化成点 */
    minVisualDepth: number
    /** 空闲状态下粒子的最小可视深度，保持胶囊方向可读 */
    idleMinVisualDepth: number
    /** 空闲状态下形成的穹顶二维半径范围 [内半径, 外半径] */
    idleDomeRadius: [number, number]
    /** 穹顶的三维深度凹陷（倒扣在屏幕深处） */
    idleDomeDepth: number
    /** 水母呼吸动画的径向扩散振幅 */
    idleBreatheAmplitude: number
    /** 水母呼吸动画的波频率（基于距离） */
    idleBreatheFrequency: number
    /** 水母呼吸动画的时间速度 */
    idleBreatheSpeed: number
    /** 水母呼吸动画在 Z 轴（深度方向）的起伏振幅 */
    idleBreatheZAmplitude: number
    /** 穹顶整体的缓慢旋转速度 */
    idleDomeRotationSpeed: number
    /** 空闲状态下的寻的权重 */
    idleDomeSeekWeight: number
    /** 粒子排列形成文字或图形时的槽位间距 */
    slotSpacing: number
    /** 寻找目标点（Seek）行为的权重 */
    seekWeight: number
    /** 粒子间相互排斥（Separation）行为的权重，避免粒子过度聚集 */
    separationWeight: number
    /** 粒子间相互排斥的生效半径 */
    separationRadius: number
    /** 粒子与周围粒子对齐运动方向（Alignment）的权重 */
    alignmentWeight: number
    /** 对齐行为的生效半径 */
    alignmentRadius: number
    /** 到达目标点时开始减速的半径距离 */
    arrivalRadius: number
    /** 遇到障碍物时的避障权重（使粒子避开障碍，如鼠标或特定区域） */
    obstacleWeight: number
  }
  /** 摄像机配置 */
  camera: {
    /** 摄像机视野角度 (Field of View) */
    fov: number
    /** 摄像机在 Z 轴上的位置深度 */
    z: number
  }
}

export function getConfig(): ParticleConfig | null {
  if (typeof window === 'undefined') return null

  const isMobile = window.innerWidth < 768
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReducedMotion || isMobile) return null

  return {
    enabled: true,
    flock: {
      count: 300,
      sizeRange: [20, 40],
      maxSpeed: 7.0,
      maxForce: 18.0,
      opacity: 0.9,
      spectrumSpeed: 0.08,
      idleStartDelay: 0.35,
      idleRampDuration: 1.1,
      idleCycleSpeed: 0.16,
      idleZRange: [-1.7, 1.45],
      minVisualDepth: 0.38,
      idleMinVisualDepth: 0.74,
      idleDomeRadius: [0.5, 6.0],
      idleDomeDepth: -2.0,
      idleBreatheAmplitude: 0.3,
      idleBreatheFrequency: 1.2,
      idleBreatheSpeed: 0.4,
      idleBreatheZAmplitude: 0.6,
      idleDomeRotationSpeed: -0.015,
      idleDomeSeekWeight: 3.0,
      slotSpacing: 0.18,
      seekWeight: 1.0,
      separationWeight: 1.8,
      separationRadius: 0.3,
      alignmentWeight: 0.3,
      alignmentRadius: 0.8,
      arrivalRadius: 1.5,
      obstacleWeight: 3.5, // 提高避障权重，使穿梭更清晰
    },
    camera: {
      fov: 45,
      z: 6,
    },
  }
}
