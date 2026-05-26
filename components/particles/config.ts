/**
 * 粒子系统集中配置
 * 保留了 Flock 层和 Camera 层，移除了纯背景粒子和随机障碍物
 */

export type ParticleConfig = {
  enabled: boolean
  flock: {
    count: number
    sizeRange: [number, number]
    maxSpeed: number
    maxForce: number
    colorCyan: [number, number, number]
    colorMagenta: [number, number, number]
    opacity: number
    slotSpacing: number
    seekWeight: number
    separationWeight: number
    separationRadius: number
    alignmentWeight: number
    alignmentRadius: number
    arrivalRadius: number
    obstacleWeight: number
  }
  camera: {
    fov: number
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
      sizeRange: [10, 22],
      maxSpeed: 4.0,
      maxForce: 12.0,
      colorCyan: [0.3, 0.7, 1.0],
      colorMagenta: [0.9, 0.3, 0.8],
      opacity: 0.7,
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
