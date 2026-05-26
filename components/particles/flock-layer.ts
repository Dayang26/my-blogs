/**
 * 前景层：鸟群粒子（Steering Behaviors）
 * CPU 端计算 steering forces，每帧更新 BufferAttribute
 * 支持鼠标跟随、队形槽位、障碍物分流绕行
 */

import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  NormalBlending,
  Scene,
  PerspectiveCamera,
  Vector3,
} from 'three'
import type { ParticleConfig } from './config'
import type { AABB } from './dom-obstacles'

const vertexShader = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uIdleProgress;
  uniform float uMinVisualDepth;
  uniform float uIdleMinVisualDepth;
  attribute float aSize;
  attribute float aRandom;
  attribute float aAngle;
  varying float vRandom;
  varying float vAngle;
  varying float vCapsule;
  varying float vDepth;

  void main() {
    vRandom = aRandom;
    vAngle = aAngle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float perspectiveScale = 6.0 / max(0.25, -mvPosition.z);
    float depth = smoothstep(-1.7, 1.45, position.z);
    float baseDepth = max(depth, uMinVisualDepth);
    float idleDepth = max(baseDepth, uIdleMinVisualDepth);
    float visualDepth = mix(baseDepth, idleDepth, uIdleProgress);

    vDepth = depth;
    vCapsule = visualDepth;
    gl_PointSize = mix(1.0, aSize * 0.32 * perspectiveScale, visualDepth) * uPixelRatio;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSpectrumSpeed;
  varying float vRandom;
  varying float vAngle;
  varying float vCapsule;
  varying float vDepth;

  float capsuleSdf(vec2 p, float halfLen, float radius) {
    p.x -= clamp(p.x, -halfLen, halfLen);
    return length(p) - radius;
  }

  vec3 spectrum(float t) {
    t = fract(t);

    if (t < 0.12) {
      return mix(vec3(0.42, 0.0, 0.0), vec3(1.0, 0.02, 0.0), t / 0.12);
    } else if (t < 0.26) {
      return mix(vec3(1.0, 0.02, 0.0), vec3(1.0, 0.72, 0.0), (t - 0.12) / 0.14);
    } else if (t < 0.42) {
      return mix(vec3(1.0, 0.72, 0.0), vec3(0.05, 0.9, 0.1), (t - 0.26) / 0.16);
    } else if (t < 0.58) {
      return mix(vec3(0.05, 0.9, 0.1), vec3(0.0, 0.72, 1.0), (t - 0.42) / 0.16);
    } else if (t < 0.76) {
      return mix(vec3(0.0, 0.72, 1.0), vec3(0.18, 0.08, 1.0), (t - 0.58) / 0.18);
    }

    return mix(vec3(0.18, 0.08, 1.0), vec3(0.62, 0.0, 0.95), (t - 0.76) / 0.24);
  }

  void main() {
    vec2 p = vec2(gl_PointCoord.x - 0.5, 0.5 - gl_PointCoord.y);
    float c = cos(vAngle);
    float s = sin(vAngle);
    p = mat2(c, -s, s, c) * p;

    float halfLen = mix(0.0, 0.4, vCapsule);
    float radius = mix(0.31, 0.205, vCapsule);
    float d = capsuleSdf(p, halfLen, radius);
    if (d > 0.0) discard;

    float t = vRandom + vDepth * 0.18 + uTime * uSpectrumSpeed;
    vec3 color = spectrum(t);
    gl_FragColor = vec4(color, uOpacity);
  }
`

type Bird = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  phase: number
  angle: number
  sphereX: number
  sphereY: number
  sphereZ: number
  radiusJitter: number
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

function getSlot(i: number, spacing: number): { x: number; y: number } {
  const r = spacing * Math.sqrt(i + 1)
  const theta = (i + 1) * GOLDEN_ANGLE
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}

function getSphereSlot(i: number, count: number): { x: number; y: number; z: number } {
  const y = 1 - (2 * (i + 0.5)) / count
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = (i + 0.5) * GOLDEN_ANGLE

  return {
    x: Math.cos(theta) * r,
    y,
    z: Math.sin(theta) * r,
  }
}

function clampVec(vx: number, vy: number, max: number): [number, number] {
  const len = Math.sqrt(vx * vx + vy * vy)
  if (len > max && len > 0) {
    const s = max / len
    return [vx * s, vy * s]
  }
  return [vx, vy]
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep01(t: number) {
  return t * t * (3 - 2 * t)
}

function lerpAngle(a: number, b: number, t: number) {
  let delta = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (delta < -Math.PI) delta += Math.PI * 2
  return a + delta * t
}

function getCenterFacingCapsuleAngle(
  particleNdcX: number,
  particleNdcY: number,
  anchorX: number,
  anchorY: number,
  aspect: number
) {
  const dx = (anchorX - particleNdcX) * aspect
  const dy = anchorY - particleNdcY

  // The fragment shader normalizes gl_PointCoord into screen space (x right,
  // y up), so aAngle is the capsule long-axis direction in that same space.
  return Math.atan2(dy, dx)
}

export class FlockLayer {
  private points: Points
  private material: ShaderMaterial
  private geometry: BufferGeometry
  private birds: Bird[] = []
  private posAttr: BufferAttribute
  private angleAttr: BufferAttribute
  private config: ParticleConfig['flock']
  private elapsed = 0
  private visualIdleProgress = 0
  private projectionScratch = new Vector3()

  constructor(scene: Scene, config: ParticleConfig) {
    this.config = config.flock
    const {
      count, sizeRange, opacity, spectrumSpeed,
      minVisualDepth, idleMinVisualDepth,
    } = this.config

    // 初始化鸟群
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    const sizes = new Float32Array(count)
    const angles = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 初始位置集中在中心附近
      const slot = getSlot(i, this.config.slotSpacing)
      const sphereSlot = getSphereSlot(i, count)
      const x = slot.x + (Math.random() - 0.5) * 0.5
      const y = slot.y + (Math.random() - 0.5) * 0.5
      const z = (Math.random() - 0.5) * 0.5
      const angle = Math.random() * Math.PI * 2
      const phase = Math.random()

      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      randoms[i] = Math.random()
      sizes[i] = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0])
      angles[i] = angle

      this.birds.push({
        x,
        y,
        z,
        vx: 0,
        vy: 0,
        phase,
        angle,
        sphereX: sphereSlot.x,
        sphereY: sphereSlot.y,
        sphereZ: sphereSlot.z,
        radiusJitter: 0.86 + Math.random() * 0.28,
      })
    }

    this.geometry = new BufferGeometry()
    this.posAttr = new BufferAttribute(positions, 3)
    this.angleAttr = new BufferAttribute(angles, 1)
    this.geometry.setAttribute('position', this.posAttr)
    this.geometry.setAttribute('aRandom', new BufferAttribute(randoms, 1))
    this.geometry.setAttribute('aSize', new BufferAttribute(sizes, 1))
    this.geometry.setAttribute('aAngle', this.angleAttr)

    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uSpectrumSpeed: { value: spectrumSpeed },
        uIdleProgress: { value: 0 },
        uMinVisualDepth: { value: minVisualDepth },
        uIdleMinVisualDepth: { value: idleMinVisualDepth },
      },
      vertexShader,
      fragmentShader,
    })

    this.points = new Points(this.geometry, this.material)
    scene.add(this.points)
  }

  update(
    dt: number,
    anchorX: number,
    anchorY: number,
    anchorAngle: number,
    idleTime: number,
    obstacles: AABB[],
    camera: PerspectiveCamera
  ) {
    this.elapsed += dt

    const {
      maxSpeed, maxForce,
      seekWeight, separationWeight, separationRadius,
      alignmentWeight, alignmentRadius, arrivalRadius,
      obstacleWeight, slotSpacing,
      idleStartDelay, idleRampDuration, idleCycleSpeed, idleZRange,
      idleSphereRadius, idleSphereDepth, idleSphereWaveAmplitude,
      idleSphereWaveSpeed, idleSphereRotationSpeed, idleSphereSeekWeight,
    } = this.config
    const targetIdleProgress = Math.min(
      Math.max((idleTime - idleStartDelay) / idleRampDuration, 0),
      1
    )
    if (targetIdleProgress >= this.visualIdleProgress) {
      this.visualIdleProgress = targetIdleProgress
    } else {
      this.visualIdleProgress = Math.max(0, this.visualIdleProgress - dt / 0.35)
    }
    const idleProgress = smoothstep01(this.visualIdleProgress)

    const cosA = Math.cos(anchorAngle)
    const sinA = Math.sin(anchorAngle)
    const sphereRotation = this.elapsed * idleSphereRotationSpeed * Math.PI * 2
    const cosSphere = Math.cos(sphereRotation)
    const sinSphere = Math.sin(sphereRotation)

    // anchor 从 NDC (-1~1) 转到世界坐标（大约 *4）
    const ax = anchorX * 4.0
    const ay = anchorY * 4.0
    const activeSeekWeight = mix(seekWeight, idleSphereSeekWeight, idleProgress)
    const activeSeparationWeight = separationWeight * mix(1, 0.45, idleProgress)
    const activeAlignmentWeight = alignmentWeight * (1 - idleProgress * 0.9)
    const activeObstacleWeight = obstacleWeight * (1 - idleProgress * 0.7)

    for (let i = 0; i < this.birds.length; i++) {
      const bird = this.birds[i]!
      let fx = 0
      let fy = 0

      // 1. Seek 槽位（含 arrival 减速）
      const localSlot = getSlot(i, slotSpacing)
      // 旋转队形，朝 anchor 运动方向展开
      const slotX = ax + localSlot.x * cosA - localSlot.y * sinA
      const slotY = ay + localSlot.x * sinA + localSlot.y * cosA
      const sphereX = bird.sphereX * cosSphere - bird.sphereZ * sinSphere
      const sphereZ = bird.sphereX * sinSphere + bird.sphereZ * cosSphere
      const sphereWave = Math.sin(
        (this.elapsed * idleSphereWaveSpeed + bird.phase) * Math.PI * 2
      )
      const spherePulse = idleSphereWaveAmplitude * sphereWave
      const sphereRadiusX = idleSphereRadius[0] * bird.radiusJitter + spherePulse
      const sphereRadiusY = idleSphereRadius[1] * bird.radiusJitter + spherePulse * 0.58
      const idleSlotX = ax + sphereX * sphereRadiusX
      const idleSlotY = ay + bird.sphereY * sphereRadiusY
      const targetX = mix(slotX, idleSlotX, idleProgress)
      const targetY = mix(slotY, idleSlotY, idleProgress)

      const sdx = targetX - bird.x
      const sdy = targetY - bird.y
      const sDist = Math.sqrt(sdx * sdx + sdy * sdy)

      if (sDist > 0.001) {
        // arrival: 接近时减速
        let desiredSpeed = maxSpeed * mix(1, 0.78, idleProgress)
        if (sDist < arrivalRadius) {
          desiredSpeed *= sDist / arrivalRadius
        }
        const desiredVx = (sdx / sDist) * desiredSpeed
        const desiredVy = (sdy / sDist) * desiredSpeed
        let steerX = desiredVx - bird.vx
        let steerY = desiredVy - bird.vy
        ;[steerX, steerY] = clampVec(steerX, steerY, maxForce)
        fx += steerX * activeSeekWeight
        fy += steerY * activeSeekWeight
      }

      // 2. Separation
      let sepX = 0
      let sepY = 0
      let sepCount = 0
      for (let j = 0; j < this.birds.length; j++) {
        if (i === j) continue
        const other = this.birds[j]!
        const ddx = bird.x - other.x
        const ddy = bird.y - other.y
        const dd = Math.sqrt(ddx * ddx + ddy * ddy)
        if (dd < separationRadius && dd > 0.001) {
          sepX += ddx / dd / dd
          sepY += ddy / dd / dd
          sepCount++
        }
      }
      if (sepCount > 0) {
        sepX /= sepCount
        sepY /= sepCount
        const sepLen = Math.sqrt(sepX * sepX + sepY * sepY)
        if (sepLen > 0) {
          sepX = (sepX / sepLen) * maxSpeed - bird.vx
          sepY = (sepY / sepLen) * maxSpeed - bird.vy
          ;[sepX, sepY] = clampVec(sepX, sepY, maxForce)
        }
        fx += sepX * activeSeparationWeight
        fy += sepY * activeSeparationWeight
      }

      // 3. Alignment
      let alignVx = 0
      let alignVy = 0
      let alignCount = 0
      for (let j = 0; j < this.birds.length; j++) {
        if (i === j) continue
        const other = this.birds[j]!
        const ddx = bird.x - other.x
        const ddy = bird.y - other.y
        const dd = Math.sqrt(ddx * ddx + ddy * ddy)
        if (dd < alignmentRadius) {
          alignVx += other.vx
          alignVy += other.vy
          alignCount++
        }
      }
      if (alignCount > 0) {
        alignVx /= alignCount
        alignVy /= alignCount
        const aLen = Math.sqrt(alignVx * alignVx + alignVy * alignVy)
        if (aLen > 0) {
          let steerX = (alignVx / aLen) * maxSpeed - bird.vx
          let steerY = (alignVy / aLen) * maxSpeed - bird.vy
          ;[steerX, steerY] = clampVec(steerX, steerY, maxForce)
          fx += steerX * activeAlignmentWeight
          fy += steerY * activeAlignmentWeight
        }
      }

      // 4. Obstacle avoidance (AABB 切线分流)
      for (const obs of obstacles) {
        // Find closest point on the AABB to the bird
        const cx = Math.max(obs.left, Math.min(bird.x, obs.right))
        // 注意：WebGL中顶部 y 为正，底部 y 为负。所以 top > bottom
        const cy = Math.max(obs.bottom, Math.min(bird.y, obs.top))
        
        const dx = bird.x - cx
        const dy = bird.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        let nx = 0
        let ny = 0
        let strength = 0
        
        const margin = 0.08 // 大幅降低力场影响范围，避免字母间的力场重叠成一堵墙
        
        if (dist < 0.001) {
          // 鸟在障碍物内部，强力排斥出最近边缘
          const dLeft = Math.abs(bird.x - obs.left)
          const dRight = Math.abs(obs.right - bird.x)
          const dTop = Math.abs(obs.top - bird.y)
          const dBottom = Math.abs(bird.y - obs.bottom)
          const minDist = Math.min(dLeft, dRight, dTop, dBottom)
          
          if (minDist === dLeft) nx = -1
          else if (minDist === dRight) nx = 1
          else if (minDist === dTop) ny = 1
          else ny = -1
          
          strength = 4.0 // 极强的排斥力，防止高帧率穿模
        } else if (dist < margin) {
          nx = dx / dist
          ny = dy / dist
          strength = 1.0 - (dist / margin)
        }
        
        if (strength > 0) {
          const tx = -ny
          const ty = nx
          const side = Math.sign(bird.vx * tx + bird.vy * ty) || 1
          
          fx += (nx * 0.4 + tx * side * 0.9) * strength * maxForce * activeObstacleWeight
          fy += (ny * 0.4 + ty * side * 0.9) * strength * maxForce * activeObstacleWeight
        }
      }

      // 积分
      bird.vx += fx * dt
      bird.vy += fy * dt
      ;[bird.vx, bird.vy] = clampVec(bird.vx, bird.vy, maxSpeed)

      bird.x += bird.vx * dt
      bird.y += bird.vy * dt
      const zWave = Math.sin((this.elapsed * idleCycleSpeed + bird.phase) * Math.PI * 2) * 0.5 + 0.5
      const movingTargetZ = idleZRange[0] + (idleZRange[1] - idleZRange[0]) * zWave
      const idleTargetZ = sphereZ * idleSphereDepth + sphereWave * idleSphereWaveAmplitude
      const targetZ = mix(movingTargetZ, idleTargetZ, idleProgress)
      bird.z += (targetZ - bird.z) * Math.min(dt * (0.18 + idleProgress * 1.32), 1)

      const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy)
      if (speed > 0.01) {
        bird.angle = Math.atan2(bird.vy, bird.vx)
      }
      if (idleProgress > 0.01) {
        const projected = this.projectionScratch.set(bird.x, bird.y, bird.z).project(camera)
        const centerFacingAngle = getCenterFacingCapsuleAngle(
          projected.x,
          projected.y,
          anchorX,
          anchorY,
          camera.aspect
        )
        bird.angle = idleProgress > 0.92
          ? centerFacingAngle
          : lerpAngle(
              bird.angle,
              centerFacingAngle,
              Math.min(dt * idleProgress * 12, 1)
            )
      }

      // 写入 buffer
      this.posAttr.array[i * 3 + 0] = bird.x
      this.posAttr.array[i * 3 + 1] = bird.y
      this.posAttr.array[i * 3 + 2] = bird.z
      this.angleAttr.array[i] = bird.angle
    }

    this.posAttr.needsUpdate = true
    this.angleAttr.needsUpdate = true
    this.material.uniforms.uTime!.value = this.elapsed
    this.material.uniforms.uIdleProgress!.value = idleProgress
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
