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
  AdditiveBlending,
  Scene,
} from 'three'
import type { ParticleConfig } from './config'
import type { AABB } from './dom-obstacles'

const vertexShader = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aRandom;
  varying float vRandom;

  void main() {
    vRandom = aRandom;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * 24.0 * uPixelRatio;
    gl_PointSize *= 1.0 / -mvPosition.z;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vRandom;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // 更紧凑的光晕
    float alpha = smoothstep(0.5, 0.02, d);
    // 中心辉光
    alpha += smoothstep(0.15, 0.0, d) * 0.4;
    alpha *= uOpacity;

    vec3 color = mix(uColorA, uColorB, vRandom);
    gl_FragColor = vec4(color, alpha);
  }
`

type Bird = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

function getSlot(i: number, spacing: number): { x: number; y: number } {
  const r = spacing * Math.sqrt(i + 1)
  const theta = (i + 1) * GOLDEN_ANGLE
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}

function clampVec(vx: number, vy: number, max: number): [number, number] {
  const len = Math.sqrt(vx * vx + vy * vy)
  if (len > max && len > 0) {
    const s = max / len
    return [vx * s, vy * s]
  }
  return [vx, vy]
}

export class FlockLayer {
  private points: Points
  private material: ShaderMaterial
  private geometry: BufferGeometry
  private birds: Bird[] = []
  private posAttr: BufferAttribute
  private config: ParticleConfig['flock']

  constructor(scene: Scene, config: ParticleConfig) {
    this.config = config.flock
    const { count, sizeRange, colorCyan, colorMagenta, opacity } = this.config

    // 初始化鸟群
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // 初始位置集中在中心附近
      const slot = getSlot(i, this.config.slotSpacing)
      const x = slot.x + (Math.random() - 0.5) * 0.5
      const y = slot.y + (Math.random() - 0.5) * 0.5
      const z = (Math.random() - 0.5) * 0.5

      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      randoms[i] = Math.random()
      sizes[i] = sizeRange[0] / 20 + Math.random() * ((sizeRange[1] - sizeRange[0]) / 20)

      this.birds.push({ x, y, z, vx: 0, vy: 0 })
    }

    this.geometry = new BufferGeometry()
    this.posAttr = new BufferAttribute(positions, 3)
    this.geometry.setAttribute('position', this.posAttr)
    this.geometry.setAttribute('aRandom', new BufferAttribute(randoms, 1))
    this.geometry.setAttribute('aSize', new BufferAttribute(sizes, 1))

    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uOpacity: { value: opacity },
        uColorA: { value: colorCyan },
        uColorB: { value: colorMagenta },
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
    obstacles: AABB[]
  ) {
    const {
      maxSpeed, maxForce,
      seekWeight, separationWeight, separationRadius,
      alignmentWeight, alignmentRadius, arrivalRadius,
      obstacleWeight, slotSpacing,
    } = this.config

    const cosA = Math.cos(anchorAngle)
    const sinA = Math.sin(anchorAngle)

    // anchor 从 NDC (-1~1) 转到世界坐标（大约 *4）
    const ax = anchorX * 4.0
    const ay = anchorY * 4.0

    for (let i = 0; i < this.birds.length; i++) {
      const bird = this.birds[i]!
      let fx = 0
      let fy = 0

      // 1. Seek 槽位（含 arrival 减速）
      const localSlot = getSlot(i, slotSpacing)
      // 旋转队形，朝 anchor 运动方向展开
      const slotX = ax + localSlot.x * cosA - localSlot.y * sinA
      const slotY = ay + localSlot.x * sinA + localSlot.y * cosA

      const sdx = slotX - bird.x
      const sdy = slotY - bird.y
      const sDist = Math.sqrt(sdx * sdx + sdy * sdy)

      if (sDist > 0.001) {
        // arrival: 接近时减速
        let desiredSpeed = maxSpeed
        if (sDist < arrivalRadius) {
          desiredSpeed = maxSpeed * (sDist / arrivalRadius)
        }
        const desiredVx = (sdx / sDist) * desiredSpeed
        const desiredVy = (sdy / sDist) * desiredSpeed
        let steerX = desiredVx - bird.vx
        let steerY = desiredVy - bird.vy
        ;[steerX, steerY] = clampVec(steerX, steerY, maxForce)
        fx += steerX * seekWeight
        fy += steerY * seekWeight
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
        fx += sepX * separationWeight
        fy += sepY * separationWeight
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
          fx += steerX * alignmentWeight
          fy += steerY * alignmentWeight
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
        let dist = Math.sqrt(dx * dx + dy * dy)
        
        let nx = 0
        let ny = 0
        let strength = 0
        
        const margin = 0.5 // 矩形外围的影响范围(世界坐标体系下)
        
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
          
          strength = 2.0 // 极强的排斥力
        } else if (dist < margin) {
          nx = dx / dist
          ny = dy / dist
          strength = 1.0 - (dist / margin)
        }
        
        if (strength > 0) {
          const tx = -ny
          const ty = nx
          const side = Math.sign(bird.vx * tx + bird.vy * ty) || 1
          
          fx += (nx * 0.4 + tx * side * 0.9) * strength * maxForce * obstacleWeight
          fy += (ny * 0.4 + ty * side * 0.9) * strength * maxForce * obstacleWeight
        }
      }

      // 积分
      bird.vx += fx * dt
      bird.vy += fy * dt
      ;[bird.vx, bird.vy] = clampVec(bird.vx, bird.vy, maxSpeed)

      bird.x += bird.vx * dt
      bird.y += bird.vy * dt
      // z 轴微弱抖动
      bird.z += Math.sin(bird.x * 2.0 + bird.y * 3.0) * 0.002

      // 写入 buffer
      this.posAttr.array[i * 3 + 0] = bird.x
      this.posAttr.array[i * 3 + 1] = bird.y
      this.posAttr.array[i * 3 + 2] = bird.z
    }

    this.posAttr.needsUpdate = true
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
