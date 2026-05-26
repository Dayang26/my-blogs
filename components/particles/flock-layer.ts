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
  uniform float uTime;
  uniform vec2 uWaveDir;
  uniform float uWaveIntensity;
  attribute float aSize;
  attribute float aRandom;
  attribute float aAngle;
  varying float vRandom;
  varying float vAngle;
  varying float vCapsule;
  varying float vDepth;
  varying float vPosAngle;
  varying float vPosRadius;

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
    vPosAngle = atan(position.y, position.x);
    vPosRadius = length(position.xy);

    // 计算方向性呼吸波浪 (补上 2 * PI 的频率系数)
    vec2 posDir = normalize(position.xy + vec2(0.001));
    float dotProd = dot(posDir, uWaveDir);
    float distMeasure = mix(vPosRadius, (dotProd * 0.5 + 0.5) * vPosRadius, uWaveIntensity);

    float wavePhase = distMeasure * 1.2 * 6.2831853 - uTime * 0.4 * 6.2831853 + vRandom * 0.5;
    float wave = sin(wavePhase);
    
    // 恢复放大系数，使颗粒有明显的膨胀感
    float sizeMultiplier = mix(1.0, 1.0 + (wave * 0.5 + 0.5) * 1.5 * uWaveIntensity, uIdleProgress);

    // 将最终生成的精灵区域(Point Sprite)放大 2 倍，为旋转的胶囊体提供足够的画布空间，防止裁剪
    gl_PointSize = mix(1.0, aSize * 0.32 * perspectiveScale * sizeMultiplier, visualDepth) * uPixelRatio * 2.0;
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
  varying float vAngle;
  varying float vCapsule;
  varying float vDepth;
  varying float vPosAngle;
  varying float vPosRadius;

  float capsuleSdf(vec2 p, float halfLen, float radius) {
    p.x -= clamp(p.x, -halfLen, halfLen);
    return length(p) - radius;
  }

  vec3 getAntigravityColor(float angle, float radius, float phase) {
    // 基础冷色调 (蓝紫色)
    vec3 coolColor = mix(vec3(0.0, 0.35, 1.0), vec3(0.45, 0.1, 0.95), sin(phase * 4.0 + radius * 0.5) * 0.5 + 0.5);
    
    // 暖色调 (红橙色)
    vec3 warmColor = mix(vec3(1.0, 0.1, 0.35), vec3(1.0, 0.45, 0.1), sin(phase * 5.0) * 0.5 + 0.5);
    
    // 计算当前角度与目标角度的差值
    float diff = abs(angle - uTargetAngle);
    if (diff > 3.1415926) diff = 6.2831853 - diff;
    
    // 基础扩散范围：随着 uWaveIntensity 扩大
    float spread = 1.2 + uWaveIntensity * 0.8; 
    
    // 计算当前片元的“热度”
    float hotness = 1.0 - clamp(diff / spread, 0.0, 1.0);
    hotness *= uWaveIntensity; // 应用生命周期强度
    
    // 添加一点有机噪点
    hotness = clamp(hotness + sin(phase * 6.0) * 0.1 * uWaveIntensity, 0.0, 1.0);

    return mix(coolColor, warmColor, hotness);
  }

  void main() {
    vec2 p = vec2(gl_PointCoord.x - 0.5, 0.5 - gl_PointCoord.y);
    float c = cos(vAngle);
    float s = sin(vAngle);
    p = mat2(c, -s, s, c) * p;

    // 方向性波动
    vec2 posDir = normalize(vec2(cos(vPosAngle), sin(vPosAngle)));
    // 取消片元着色器中过度的拉伸（过大会超出 point sprite 的 0.5 边界导致被裁剪成方形）
    // 粒子的整体变长变大会由顶点着色器中的 gl_PointSize (sizeMultiplier) 负责
    float stretch = mix(1.0, 0.6 + vPosRadius * 0.4, uIdleProgress);
    // 内部几何尺寸缩小一倍 (因为画布 gl_PointSize 已放大 2 倍，故视觉物理尺寸保持不变，但再也不会超出画布)
    float halfLen = mix(0.0, 0.4 * stretch, vCapsule) * 0.5;
    float thickness = mix(0.31, 0.205, vCapsule) * 0.5;
    
    float d = capsuleSdf(p, halfLen, thickness);
    if (d > 0.0) discard;

    float randomPhase = vRandom + vDepth * 0.18 + uTime * uSpectrumSpeed;
    // 简化传入参数，时间相关的全局周期在外部计算传入
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
  phase: number
  angle: number
  domeX: number
  domeY: number
  domeR: number
  radiusJitter: number
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

function getSlot(i: number, spacing: number): { x: number; y: number } {
  const r = spacing * Math.sqrt(i + 1)
  const theta = (i + 1) * GOLDEN_ANGLE
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}

function getDomeSlot(i: number, count: number): { x: number; y: number; r: number } {
  const r = Math.sqrt(i / count) // 0 到 1 的半径比例
  const theta = i * GOLDEN_ANGLE

  return {
    x: Math.cos(theta),
    y: Math.sin(theta),
    r,
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
      const domeSlot = getDomeSlot(i, count)
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
        domeX: domeSlot.x,
        domeY: domeSlot.y,
        domeR: domeSlot.r,
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
        uWaveDir: { value: [1.0, 0.0] },
        uWaveIntensity: { value: 0 },
        uTargetAngle: { value: 0 },
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
    
    // 全局波向脉冲（结合颜色 sweep 同步）
    const cycleDuration = 6.0;
    const cycle = Math.floor(this.elapsed / cycleDuration);
    const tCycle = this.elapsed / cycleDuration - cycle;
    const fract = (n: number) => n - Math.floor(n);
    const targetAngle = (fract(Math.sin(cycle + 123.45) * 43758.5453123) * 2.0 - 1.0) * Math.PI;
    
    const waveDirX = Math.cos(targetAngle);
    const waveDirY = Math.sin(targetAngle);
    
    let waveIntensity = 0.0;
    if (tCycle < 0.2) {
      const t = tCycle / 0.2;
      waveIntensity = t * t * (3 - 2 * t);
    } else if (tCycle < 0.5) {
      waveIntensity = 1.0;
    } else if (tCycle < 0.8) {
      const t = (tCycle - 0.5) / 0.3;
      waveIntensity = 1.0 - t * t * (3 - 2 * t);
    }

    this.material.uniforms.uWaveDir!.value = [waveDirX, waveDirY];
    this.material.uniforms.uWaveIntensity!.value = waveIntensity;
    this.material.uniforms.uTargetAngle!.value = targetAngle;
    
    // 在 25% (0.25) 到 40% (0.40) 之间为当前周期生成一个随机的呼吸缩放比例
    const randomBreatheAmplitude = 0.25 + fract(Math.sin(cycle + 456.78) * 43758.5453123) * 0.15;
    
    // 全局整体面积扩张与收缩
    const globalBreatheMultiplier = 1.0 + waveIntensity * Math.sin(this.elapsed * idleBreatheSpeed * Math.PI * 2) * randomBreatheAmplitude

    // anchor 从 NDC (-1~1) 转到世界坐标（大约 *4）
    const ax = anchorX * 4.0
    const ay = anchorY * 4.0
    const activeMaxSpeed = maxSpeed * mix(1, 0.45, idleProgress) // idle时最大速度降到 45%
    const activeMaxForce = maxForce * mix(1, 0.5, idleProgress)  // idle时最大受力降到 50%，使移动更加柔和
    const activeSeekWeight = mix(seekWeight, idleDomeSeekWeight, idleProgress)
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
      
      const baseRadius = idleDomeRadius[0] + (idleDomeRadius[1] - idleDomeRadius[0]) * bird.domeR
      
      // 融合纯径向与方向性距离测度，让呼吸呈方向性涌动
      const dotProduct = bird.domeX * waveDirX + bird.domeY * waveDirY;
      const distanceMeasure = mix(bird.domeR, dotProduct * 0.5 + 0.5, waveIntensity);
      
      const wavePhase = distanceMeasure * idleBreatheFrequency * Math.PI * 2 - this.elapsed * idleBreatheSpeed * Math.PI * 2 + bird.phase * 0.3
      const wave = Math.sin(wavePhase)
      
      // 缩减个体波动位移：0.3基础抖动，仅在脉冲时增强
      const currentAmplitude = idleBreatheAmplitude * mix(0.2, 0.7, waveIntensity);
      const radius = (baseRadius * bird.radiusJitter + wave * currentAmplitude) * mix(1.0, globalBreatheMultiplier, idleProgress)
      const currentAngle = Math.atan2(bird.domeY, bird.domeX) + domeRotation
      const domeX = Math.cos(currentAngle) * radius
      const domeY = Math.sin(currentAngle) * radius
      
      const idleSlotX = ax + domeX
      const idleSlotY = ay + domeY
      const targetX = mix(slotX, idleSlotX, idleProgress)
      const targetY = mix(slotY, idleSlotY, idleProgress)

      const sdx = targetX - bird.x
      const sdy = targetY - bird.y
      const sDist = Math.sqrt(sdx * sdx + sdy * sdy)

      if (sDist > 0.001) {
        // arrival: 接近时减速
        let desiredSpeed = activeMaxSpeed * mix(1, 0.78, idleProgress)
        if (sDist < arrivalRadius) {
          desiredSpeed *= sDist / arrivalRadius
        }
        const desiredVx = (sdx / sDist) * desiredSpeed
        const desiredVy = (sdy / sDist) * desiredSpeed
        let steerX = desiredVx - bird.vx
        let steerY = desiredVy - bird.vy
        ;[steerX, steerY] = clampVec(steerX, steerY, activeMaxForce)
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
          sepX = (sepX / sepLen) * activeMaxSpeed - bird.vx
          sepY = (sepY / sepLen) * activeMaxSpeed - bird.vy
          ;[sepX, sepY] = clampVec(sepX, sepY, activeMaxForce)
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
          let steerX = (alignVx / aLen) * activeMaxSpeed - bird.vx
          let steerY = (alignVy / aLen) * activeMaxSpeed - bird.vy
          ;[steerX, steerY] = clampVec(steerX, steerY, activeMaxForce)
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
          
          fx += (nx * 0.4 + tx * side * 0.9) * strength * activeMaxForce * activeObstacleWeight
          fy += (ny * 0.4 + ty * side * 0.9) * strength * activeMaxForce * activeObstacleWeight
        }
      }

      // 积分
      bird.vx += fx * dt
      bird.vy += fy * dt
      ;[bird.vx, bird.vy] = clampVec(bird.vx, bird.vy, activeMaxSpeed)

      bird.x += bird.vx * dt
      bird.y += bird.vy * dt
      const zWave = Math.sin((this.elapsed * idleCycleSpeed + bird.phase) * Math.PI * 2) * 0.5 + 0.5
      const movingTargetZ = idleZRange[0] + (idleZRange[1] - idleZRange[0]) * zWave
      
      const depthRatio = Math.pow(bird.domeR, 1.5) // non-linear bowl shape
      
      // 同步缩减Z轴的浮动位移（复用之前计算好的 wave）
      const idleTargetZ = idleDomeDepth * depthRatio + wave * idleBreatheZAmplitude * mix(0.2, 0.6, waveIntensity)
      
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
