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
    opacity: number
    spectrumSpeed: number
    idleStartDelay: number
    idleRampDuration: number
    idleCycleSpeed: number
    idleZRange: [number, number]
    idleSphereRadius: [number, number]
    idleSphereDepth: number
    idleSphereWaveAmplitude: number
    idleSphereWaveSpeed: number
    idleSphereRotationSpeed: number
    idleSphereSeekWeight: number
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
      sizeRange: [20, 40],
      maxSpeed: 7.0,
      maxForce: 18.0,
      opacity: 0.9,
      spectrumSpeed: 0.08,
      idleStartDelay: 0.35,
      idleRampDuration: 1.1,
      idleCycleSpeed: 0.16,
      idleZRange: [-1.7, 1.45],
      idleSphereRadius: [4.7, 2.75],
      idleSphereDepth: 1.55,
      idleSphereWaveAmplitude: 0.24,
      idleSphereWaveSpeed: 0.34,
      idleSphereRotationSpeed: 0.035,
      idleSphereSeekWeight: 3.0,
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
