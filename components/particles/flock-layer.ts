/**
 * 前景层：多物理模式粒子系统（Steering Behaviors & Multi-mode Simulation）
 * 支持四种互动模式：
 * 1. flock (自然鸟群)
 * 2. vortex (引力黑洞涡旋)
 * 3. morph (SNOWLINE 字符矩阵汇聚)
 * 4. fireworks (失重浮空烟花)
 */

import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  NormalBlending,
  Scene,
  PerspectiveCamera,
  Vector2,
} from 'three'
import type { ParticleConfig, ParticleMode } from './config'
import type { AABB } from './dom-obstacles'

const vertexShader = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uIdleProgress;
  uniform float uMinVisualDepth;
  uniform float uIdleMinVisualDepth;
  uniform float uTime;
  uniform vec2 uWaveDir;
  uniform float uWaveIntensity;
  attribute float aSize;
  attribute float aRandom;
  attribute float aAngle;
  varying float vRandom;
  varying vec2 vAngleBasis;
  varying float vCapsule;
  varying float vDepth;
  varying float vPosAngle;
  varying float vPosRadius;

  void main() {
    vRandom = aRandom;
    vAngleBasis = vec2(cos(aAngle), sin(aAngle));
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float perspectiveScale = 6.0 / max(0.25, -mvPosition.z);
    float depth = smoothstep(-1.7, 1.45, position.z);
    float baseDepth = max(depth, uMinVisualDepth);
    float idleDepth = max(baseDepth, uIdleMinVisualDepth);
    float visualDepth = mix(baseDepth, idleDepth, uIdleProgress);

    vDepth = depth;
    vCapsule = visualDepth;
    vPosAngle = atan(position.y, position.x);
    vPosRadius = length(position.xy);

    // 方向性呼吸波浪
    vec2 posDir = normalize(position.xy + vec2(0.001));
    float dotProd = dot(posDir, uWaveDir);
    float distMeasure = mix(vPosRadius, (dotProd * 0.5 + 0.5) * vPosRadius, uWaveIntensity);

    float wavePhase = distMeasure * 1.2 * 6.2831853 - uTime * 0.4 * 6.2831853 + vRandom * 0.5;
    float wave = sin(wavePhase);
    
    float sizeMultiplier = mix(1.0, 1.0 + (wave * 0.5 + 0.5) * 1.5 * uWaveIntensity, uIdleProgress);
    float baseScale = mix(0.45, 0.32, uIdleProgress);

    gl_PointSize = mix(1.0, aSize * baseScale * perspectiveScale * sizeMultiplier, visualDepth) * uPixelRatio * 2.0;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSpectrumSpeed;
  uniform float uIdleProgress;
  uniform vec2 uWaveDir;
  uniform float uWaveIntensity;
  uniform float uTargetAngle;
  varying float vRandom;
  varying vec2 vAngleBasis;
  varying float vCapsule;
  varying float vDepth;
  varying float vPosAngle;
  varying float vPosRadius;

  float capsuleSdf(vec2 p, float halfLen, float radius) {
    p.x -= clamp(p.x, -halfLen, halfLen);
    return length(p) - radius;
  }

  vec3 getAntigravityColor(float angle, float radius, float phase) {
    vec3 coolColor = mix(vec3(0.0, 0.35, 1.0), vec3(0.45, 0.1, 0.95), sin(phase * 4.0 + radius * 0.5) * 0.5 + 0.5);
    vec3 warmColor = mix(vec3(1.0, 0.1, 0.35), vec3(1.0, 0.45, 0.1), sin(phase * 5.0) * 0.5 + 0.5);
    
    float diff = abs(angle - uTargetAngle);
    if (diff > 3.1415926) diff = 6.2831853 - diff;
    
    float spread = 1.2 + uWaveIntensity * 0.8; 
    float hotness = 1.0 - clamp(diff / spread, 0.0, 1.0);
    hotness *= uWaveIntensity;
    hotness = clamp(hotness + sin(phase * 6.0) * 0.1 * uWaveIntensity, 0.0, 1.0);

    return mix(coolColor, warmColor, hotness);
  }

  void main() {
    vec2 p = vec2(gl_PointCoord.x - 0.5, 0.5 - gl_PointCoord.y);
    p = mat2(vAngleBasis.x, -vAngleBasis.y, vAngleBasis.y, vAngleBasis.x) * p;

    float stretch = mix(1.6, 0.6 + vPosRadius * 0.4, uIdleProgress);
    float halfLen = mix(0.0, 0.4 * stretch, vCapsule) * 0.5;
    float thickness = mix(0.31, 0.205, vCapsule) * 0.5;
    
    float d = capsuleSdf(p, halfLen, thickness);
    if (d > 0.0) discard;

    float randomPhase = vRandom + vDepth * 0.18 + uTime * uSpectrumSpeed;
    vec3 color = getAntigravityColor(vPosAngle, vPosRadius, randomPhase);
    gl_FragColor = vec4(color, uOpacity);
  }
`

type Bird = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  phase: number
  slotX: number
  slotY: number
  morphX: number
  morphY: number
  angle: number
  domeX: number
  domeY: number
  domeR: number
  radiusJitter: number
  vortexRadius: number
  vortexAngle: number
  vortexSpeed: number
}

class SpatialHash {
  private cellSize: number
  private cells = new Map<number, number[]>()
  private bucketPool: number[][] = []
  private invCellSize: number

  constructor(cellSize: number) {
    this.cellSize = cellSize
    this.invCellSize = 1 / cellSize
  }

  clear() {
    for (const bucket of this.cells.values()) {
      bucket.length = 0
      this.bucketPool.push(bucket)
    }
    this.cells.clear()
  }

  insert(index: number, x: number, y: number) {
    const key = this.key(x, y)
    let bucket = this.cells.get(key)
    if (!bucket) {
      bucket = this.bucketPool.pop() ?? []
      this.cells.set(key, bucket)
    }
    bucket.push(index)
  }

  get inverseCellSize() {
    return this.invCellSize
  }

  getBucketAtCell(cx: number, cy: number) {
    return this.cells.get(cx * 73856093 ^ cy * 19349663)
  }

  private key(x: number, y: number): number {
    const cx = Math.floor(x * this.invCellSize)
    const cy = Math.floor(y * this.invCellSize)
    return cx * 73856093 ^ cy * 19349663
  }
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

function getSlot(i: number, spacing: number): { x: number; y: number } {
  const r = spacing * Math.sqrt(i + 1)
  const theta = (i + 1) * GOLDEN_ANGLE
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}

function getDomeSlot(i: number, count: number): { x: number; y: number; r: number } {
  const r = Math.sqrt(i / count)
  const theta = i * GOLDEN_ANGLE
  return {
    x: Math.cos(theta),
    y: Math.sin(theta),
    r,
  }
}

/**
 * 离屏 Canvas 生成 SNOWLINE 字符矩阵槽位
 */
function generateTextSlots(text: string, count: number): { x: number; y: number }[] {
  if (typeof document === 'undefined') {
    return Array.from({ length: count }, (_, i) => ({
      x: ((i % 30) - 15) * 0.25,
      y: (Math.floor(i / 30) - 5) * 0.25,
    }))
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  canvas.width = 600
  canvas.height = 150
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '900 64px "Space Grotesk", sans-serif, system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '10px'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const validPixels: { x: number; y: number }[] = []
  const step = 3

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4
      if (imgData.data[idx]! > 140) {
        // 映射到世界坐标：横向约 [-3.4, 3.4]，中心精确对准 h1 标题位置 y = 0.95
        const nx = ((x - canvas.width / 2) / (canvas.width / 2)) * 3.4
        const ny = -((y - canvas.height / 2) / (canvas.height / 2)) * 0.75 + 0.95
        validPixels.push({ x: nx, y: ny })
      }
    }
  }

  const slots: { x: number; y: number }[] = []
  if (validPixels.length === 0) {
    return Array.from({ length: count }, (_, i) => ({
      x: ((i % 30) - 15) * 0.25,
      y: (Math.floor(i / 30) - 5) * 0.25,
    }))
  }

  for (let i = 0; i < count; i++) {
    const p = validPixels[Math.floor((i / count) * validPixels.length)]!
    slots.push({
      x: p.x + (Math.random() - 0.5) * 0.04,
      y: p.y + (Math.random() - 0.5) * 0.04,
    })
  }

  return slots
}

function getClampScale(vx: number, vy: number, max: number) {
  const lengthSquared = vx * vx + vy * vy
  const maxSquared = max * max
  return lengthSquared > maxSquared
    ? max / Math.sqrt(lengthSquared)
    : 1
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
  particleX: number,
  particleY: number,
  particleZ: number,
  anchorX: number,
  anchorY: number,
  aspect: number,
  focalLength: number,
  cameraZ: number,
) {
  const depth = Math.max(0.001, cameraZ - particleZ)
  const particleNdcX = particleX * focalLength / (aspect * depth)
  const particleNdcY = particleY * focalLength / depth
  const dx = (anchorX - particleNdcX) * aspect
  const dy = anchorY - particleNdcY
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
  private spatialHash: SpatialHash
  private waveDir = new Vector2(1, 0)
  private waveCycle = -1
  private waveTargetAngle = 0
  private randomBreatheAmplitude = 0.25
  private mode: ParticleMode = 'flock'

  constructor(scene: Scene, config: ParticleConfig, pixelRatio: number) {
    this.config = config.flock
    const {
      count, sizeRange, opacity, spectrumSpeed,
      minVisualDepth, idleMinVisualDepth, alignmentRadius,
    } = this.config
    this.spatialHash = new SpatialHash(alignmentRadius)

    const textSlots = generateTextSlots('SNOWLINE', count)

    // 初始化鸟群
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    const sizes = new Float32Array(count)
    const angles = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const slot = getSlot(i, this.config.slotSpacing)
      const domeSlot = getDomeSlot(i, count)
      const morph = textSlots[i] || { x: 0, y: 0 }
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

      const vRadius = 0.4 + Math.random() * 2.8
      const vAngle = Math.random() * Math.PI * 2
      const vSpeed = (1.8 + Math.random() * 2.2) * (Math.random() > 0.5 ? 1 : 1)

      this.birds.push({
        x,
        y,
        z,
        vx: 0,
        vy: 0,
        vz: 0,
        phase,
        slotX: slot.x,
        slotY: slot.y,
        morphX: morph.x,
        morphY: morph.y,
        angle,
        domeX: domeSlot.x,
        domeY: domeSlot.y,
        domeR: domeSlot.r,
        radiusJitter: 0.86 + Math.random() * 0.28,
        vortexRadius: vRadius,
        vortexAngle: vAngle,
        vortexSpeed: vSpeed,
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
        uPixelRatio: { value: pixelRatio },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uSpectrumSpeed: { value: spectrumSpeed },
        uIdleProgress: { value: 0 },
        uMinVisualDepth: { value: minVisualDepth },
        uIdleMinVisualDepth: { value: idleMinVisualDepth },
        uWaveDir: { value: this.waveDir },
        uWaveIntensity: { value: 0 },
        uTargetAngle: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    })

    this.points = new Points(this.geometry, this.material)
    scene.add(this.points)
  }

  public setMode(newMode: ParticleMode) {
    if (this.mode === newMode) return
    this.mode = newMode

    // 模式切换初始脉冲
    if (newMode === 'fireworks') {
      for (const bird of this.birds) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4.0 + Math.random() * 8.0
        bird.vx = Math.cos(angle) * speed
        bird.vy = Math.sin(angle) * speed
        bird.vz = (Math.random() - 0.5) * 4.0
      }
    } else if (newMode === 'vortex') {
      for (const bird of this.birds) {
        bird.vx *= 0.3
        bird.vy *= 0.3
      }
    }
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
      obstacleWeight,
      idleStartDelay, idleRampDuration, idleCycleSpeed, idleZRange,
      idleDomeRadius, idleDomeDepth, idleBreatheAmplitude,
      idleBreatheFrequency, idleBreatheSpeed, idleBreatheZAmplitude,
      idleDomeRotationSpeed, idleDomeSeekWeight,
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
    const domeRotation = this.elapsed * idleDomeRotationSpeed * Math.PI * 2
    const domeCos = Math.cos(domeRotation)
    const domeSin = Math.sin(domeRotation)
    
    // 全局波向脉冲
    const cycleDuration = 6.0
    const cycle = Math.floor(this.elapsed / cycleDuration)
    const tCycle = this.elapsed / cycleDuration - cycle
    if (cycle !== this.waveCycle) {
      const fract = (n: number) => n - Math.floor(n)
      this.waveCycle = cycle
      this.waveTargetAngle = (
        fract(Math.sin(cycle + 123.45) * 43758.5453123) * 2.0 - 1.0
      ) * Math.PI
      this.waveDir.set(
        Math.cos(this.waveTargetAngle),
        Math.sin(this.waveTargetAngle)
      )
      this.randomBreatheAmplitude =
        0.25 + fract(Math.sin(cycle + 456.78) * 43758.5453123) * 0.15
    }
    const targetAngle = this.waveTargetAngle
    const waveDirX = this.waveDir.x
    const waveDirY = this.waveDir.y
    
    let waveIntensity = 0.0
    if (tCycle < 0.2) {
      const t = tCycle / 0.2
      waveIntensity = t * t * (3 - 2 * t)
    } else if (tCycle < 0.5) {
      waveIntensity = 1.0
    } else if (tCycle < 0.8) {
      const t = (tCycle - 0.5) / 0.3
      waveIntensity = 1.0 - t * t * (3 - 2 * t)
    }

    this.material.uniforms.uWaveIntensity!.value = waveIntensity
    this.material.uniforms.uTargetAngle!.value = targetAngle
    
    const globalBreatheMultiplier = 1.0 + waveIntensity * Math.sin(this.elapsed * idleBreatheSpeed * Math.PI * 2) * this.randomBreatheAmplitude

    const ax = anchorX * 4.0
    const ay = anchorY * 4.0
    const activeMaxSpeed = maxSpeed * mix(1, 0.45, idleProgress)
    const activeMaxForce = maxForce * mix(1, 0.5, idleProgress)
    const activeSeekWeight = mix(seekWeight, idleDomeSeekWeight, idleProgress)
    const activeSeparationWeight = separationWeight * mix(1, 0.45, idleProgress)
    const activeAlignmentWeight = alignmentWeight * (1 - idleProgress * 0.9)
    const activeObstacleWeight = obstacleWeight * (1 - idleProgress * 0.7)
    const separationRadiusSquared = separationRadius * separationRadius
    const alignmentRadiusSquared = alignmentRadius * alignmentRadius
    const hashInvCellSize = this.spatialHash.inverseCellSize
    const cameraAspect = camera.aspect
    const cameraFocalLength = 1 / Math.tan(camera.fov * Math.PI / 360)
    const cameraZ = camera.position.z

    this.spatialHash.clear()
    for (let i = 0; i < this.birds.length; i++) {
      this.spatialHash.insert(i, this.birds[i]!.x, this.birds[i]!.y)
    }

    // ────────────────────────────
    // 物理力场模拟
    // ────────────────────────────
    for (let i = 0; i < this.birds.length; i++) {
      const bird = this.birds[i]!
      let fx = 0
      let fy = 0

      if (this.mode === 'flock') {
        // ─── 模式 1: Flock (自然鸟群 + 呼吸穹顶) ───
        const slotX = ax + bird.slotX * cosA - bird.slotY * sinA
        const slotY = ay + bird.slotX * sinA + bird.slotY * cosA
        const baseRadius = idleDomeRadius[0] + (idleDomeRadius[1] - idleDomeRadius[0]) * bird.domeR
        const dotProduct = bird.domeX * waveDirX + bird.domeY * waveDirY
        const distanceMeasure = mix(bird.domeR, dotProduct * 0.5 + 0.5, waveIntensity)
        const wavePhase = distanceMeasure * idleBreatheFrequency * Math.PI * 2 - this.elapsed * idleBreatheSpeed * Math.PI * 2 + bird.phase * 0.3
        const wave = Math.sin(wavePhase)
        const currentAmplitude = idleBreatheAmplitude * mix(0.2, 0.7, waveIntensity)
        const radius = (baseRadius * bird.radiusJitter + wave * currentAmplitude) * mix(1.0, globalBreatheMultiplier, idleProgress)
        const domeX = (bird.domeX * domeCos - bird.domeY * domeSin) * radius
        const domeY = (bird.domeX * domeSin + bird.domeY * domeCos) * radius
        const idleSlotX = ax + domeX
        const idleSlotY = ay + domeY
        const targetX = mix(slotX, idleSlotX, idleProgress)
        const targetY = mix(slotY, idleSlotY, idleProgress)

        const sdx = targetX - bird.x
        const sdy = targetY - bird.y
        const sDist = Math.sqrt(sdx * sdx + sdy * sdy)

        if (sDist > 0.001) {
          let desiredSpeed = activeMaxSpeed * mix(1, 0.78, idleProgress)
          if (sDist < arrivalRadius) {
            desiredSpeed *= sDist / arrivalRadius
          }
          const desiredVx = (sdx / sDist) * desiredSpeed
          const desiredVy = (sdy / sDist) * desiredSpeed
          let steerX = desiredVx - bird.vx
          let steerY = desiredVy - bird.vy
          const steerScale = getClampScale(steerX, steerY, activeMaxForce)
          steerX *= steerScale
          steerY *= steerScale
          fx += steerX * activeSeekWeight
          fy += steerY * activeSeekWeight
        }
      } else if (this.mode === 'vortex') {
        // ─── 模式 2: Vortex (引力黑洞涡旋吸积盘) ───
        const dx = ax - bird.x
        const dy = ay - bird.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const safeDist = Math.max(dist, 0.35)

        // 向心引力
        const inwardForce = 8.0 / Math.pow(safeDist, 0.5)
        fx += (dx / safeDist) * inwardForce

        // 切向涡旋力（绕鼠标顺时针/逆时针飞旋）
        const tangentX = -dy / safeDist
        const tangentY = dx / safeDist
        const vortexSpeed = 6.5 + 2.0 / safeDist
        fx += tangentX * vortexSpeed * 1.5
        fy += (dy / safeDist) * inwardForce + tangentY * vortexSpeed * 1.5

        // 鼠标中心微排斥，防止奇点完全重叠
        if (dist < 0.4) {
          const repel = (0.4 - dist) * 20.0
          fx -= (dx / safeDist) * repel
          fy -= (dy / safeDist) * repel
        }
      } else if (this.mode === 'morph') {
        // ─── 模式 3: Morph (SNOWLINE 文字矩阵汇聚) ───
        const targetX = bird.morphX
        const targetY = bird.morphY

        const tdx = targetX - bird.x
        const tdy = targetY - bird.y
        const tDist = Math.sqrt(tdx * tdx + tdy * tdy)

        // 强力弹簧寻的
        const morphSpeed = Math.min(maxSpeed * 1.6, tDist * 7.5)
        if (tDist > 0.001) {
          const desVx = (tdx / tDist) * morphSpeed
          const desVy = (tdy / tDist) * morphSpeed
          fx += (desVx - bird.vx) * 3.5
          fy += (desVy - bird.vy) * 3.5
        }

        // 鼠标交互流沙弹性斥力
        const mdx = bird.x - ax
        const mdy = bird.y - ay
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        const pushRadius = 1.0
        if (mDist < pushRadius && mDist > 0.001) {
          const pushForce = (1.0 - mDist / pushRadius) * 22.0
          fx += (mdx / mDist) * pushForce
          fy += (mdy / mDist) * pushForce
        }
      } else if (this.mode === 'fireworks') {
        // ─── 模式 4: Fireworks (失重漂浮/太空星尘) ───
        // 浮力向上与轻微随机湍流
        fy += 1.2 + Math.sin(this.elapsed * 2.0 + bird.phase * 6.28) * 2.0
        fx += Math.cos(this.elapsed * 1.8 + bird.phase * 6.28) * 1.8

        // 屏幕边界回弹柔和约束
        if (Math.abs(bird.x) > 4.5) fx -= Math.sign(bird.x) * 4.0
        if (bird.y > 3.0) fy -= 5.0
        if (bird.y < -3.0) fy += 5.0

        // 鼠标推开微波
        const mdx = bird.x - ax
        const mdy = bird.y - ay
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mDist < 1.2 && mDist > 0.001) {
          const blast = (1.2 - mDist) * 12.0
          fx += (mdx / mDist) * blast
          fy += (mdy / mDist) * blast
        }
      }

      // ────────────────────────────
      // 粒子间分离与避障（Flock 与 Morph 模式下生效）
      // ────────────────────────────
      if (this.mode === 'flock') {
        let sepX = 0
        let sepY = 0
        let sepCount = 0
        let alignVx = 0
        let alignVy = 0
        let alignCount = 0
        const minCX = Math.floor((bird.x - alignmentRadius) * hashInvCellSize)
        const maxCX = Math.floor((bird.x + alignmentRadius) * hashInvCellSize)
        const minCY = Math.floor((bird.y - alignmentRadius) * hashInvCellSize)
        const maxCY = Math.floor((bird.y + alignmentRadius) * hashInvCellSize)

        for (let cx = minCX; cx <= maxCX; cx++) {
          for (let cy = minCY; cy <= maxCY; cy++) {
            const bucket = this.spatialHash.getBucketAtCell(cx, cy)
            if (!bucket) continue

            for (let k = 0; k < bucket.length; k++) {
              const j = bucket[k]!
              if (i === j) continue

              const other = this.birds[j]!
              const ddx = bird.x - other.x
              const ddy = bird.y - other.y
              const distanceSquared = ddx * ddx + ddy * ddy

              if (distanceSquared < separationRadiusSquared && distanceSquared > 0.000001) {
                const inverseDistance = 1 / Math.sqrt(distanceSquared)
                sepX += ddx * inverseDistance * inverseDistance
                sepY += ddy * inverseDistance * inverseDistance
                sepCount++
              }

              if (distanceSquared < alignmentRadiusSquared) {
                alignVx += other.vx
                alignVy += other.vy
                alignCount++
              }
            }
          }
        }

        if (sepCount > 0) {
          sepX /= sepCount
          sepY /= sepCount
          const sepLen = Math.sqrt(sepX * sepX + sepY * sepY)
          if (sepLen > 0) {
            sepX = (sepX / sepLen) * activeMaxSpeed - bird.vx
            sepY = (sepY / sepLen) * activeMaxSpeed - bird.vy
            const sepScale = getClampScale(sepX, sepY, activeMaxForce)
            sepX *= sepScale
            sepY *= sepScale
          }
          fx += sepX * activeSeparationWeight
          fy += sepY * activeSeparationWeight
        }

        if (alignCount > 0) {
          alignVx /= alignCount
          alignVy /= alignCount
          const aLen = Math.sqrt(alignVx * alignVx + alignVy * alignVy)
          if (aLen > 0) {
            let steerX = (alignVx / aLen) * activeMaxSpeed - bird.vx
            let steerY = (alignVy / aLen) * activeMaxSpeed - bird.vy
            const alignScale = getClampScale(steerX, steerY, activeMaxForce)
            steerX *= alignScale
            steerY *= alignScale
            fx += steerX * activeAlignmentWeight
            fy += steerY * activeAlignmentWeight
          }
        }

        // DOM 障碍物避障
        for (const obs of obstacles) {
          const cx = Math.max(obs.left, Math.min(bird.x, obs.right))
          const cy = Math.max(obs.bottom, Math.min(bird.y, obs.top))
          const dx = bird.x - cx
          const dy = bird.y - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          let nx = 0
          let ny = 0
          let strength = 0
          const margin = 0.08
          
          if (dist < 0.001) {
            const dLeft = Math.abs(bird.x - obs.left)
            const dRight = Math.abs(obs.right - bird.x)
            const dTop = Math.abs(obs.top - bird.y)
            const dBottom = Math.abs(bird.y - obs.bottom)
            const minDist = Math.min(dLeft, dRight, dTop, dBottom)
            
            if (minDist === dLeft) nx = -1
            else if (minDist === dRight) nx = 1
            else if (minDist === dTop) ny = 1
            else ny = -1
            
            strength = 4.0
          } else if (dist < margin) {
            nx = dx / dist
            ny = dy / dist
            strength = 1.0 - (dist / margin)
          }
          
          if (strength > 0) {
            const tx = -ny
            const ty = nx
            const side = Math.sign(bird.vx * tx + bird.vy * ty) || 1
            
            fx += (nx * 0.4 + tx * side * 0.9) * strength * activeMaxForce * activeObstacleWeight
            fy += (ny * 0.4 + ty * side * 0.9) * strength * activeMaxForce * activeObstacleWeight
          }
        }
      }

      // ────────────────────────────
      // 物理积分与速度更新
      // ────────────────────────────
      const damping = this.mode === 'fireworks' ? 0.96 : (this.mode === 'morph' ? 0.88 : 0.98)
      bird.vx = (bird.vx + fx * dt) * damping
      bird.vy = (bird.vy + fy * dt) * damping

      const currentMaxSpeed = this.mode === 'vortex' ? 12.0 : (this.mode === 'fireworks' ? 10.0 : activeMaxSpeed)
      const velocityScale = getClampScale(bird.vx, bird.vy, currentMaxSpeed)
      bird.vx *= velocityScale
      bird.vy *= velocityScale

      bird.x += bird.vx * dt
      bird.y += bird.vy * dt

      // ────────────────────────────
      // Z 轴深度模拟
      // ────────────────────────────
      let targetZ = 0
      if (this.mode === 'flock') {
        const zWave = Math.sin((this.elapsed * idleCycleSpeed + bird.phase) * Math.PI * 2) * 0.5 + 0.5
        const movingTargetZ = idleZRange[0] + (idleZRange[1] - idleZRange[0]) * zWave
        const depthRatio = Math.pow(bird.domeR, 1.5)
        const wave = Math.sin(bird.domeR * idleBreatheFrequency * Math.PI * 2 - this.elapsed * idleBreatheSpeed * Math.PI * 2 + bird.phase * 0.3)
        const idleTargetZ = idleDomeDepth * depthRatio + wave * idleBreatheZAmplitude * mix(0.2, 0.6, waveIntensity)
        targetZ = mix(movingTargetZ, idleTargetZ, idleProgress)
      } else if (this.mode === 'vortex') {
        // 吸积盘扁平三维波浪
        targetZ = Math.sin(this.elapsed * 3.0 + bird.vortexRadius * 2.0) * 0.4
      } else if (this.mode === 'morph') {
        targetZ = 0.1
      } else if (this.mode === 'fireworks') {
        targetZ = Math.sin(this.elapsed + bird.phase * 6.28) * 0.8
      }

      bird.z += (targetZ - bird.z) * Math.min(dt * (0.18 + idleProgress * 1.32), 1)

      // 胶囊转向角
      const speed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy)
      if (speed > 0.01) {
        bird.angle = Math.atan2(bird.vy, bird.vx)
      }
      if (this.mode === 'flock' && idleProgress > 0.01) {
        const centerFacingAngle = getCenterFacingCapsuleAngle(
          bird.x,
          bird.y,
          bird.z,
          anchorX,
          anchorY,
          cameraAspect,
          cameraFocalLength,
          cameraZ,
        )
        bird.angle = idleProgress > 0.92
          ? centerFacingAngle
          : lerpAngle(
              bird.angle,
              centerFacingAngle,
              Math.min(dt * idleProgress * 12, 1)
            )
      }

      // 写入顶点 attribute buffer
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
