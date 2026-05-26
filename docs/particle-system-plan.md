# 首页粒子系统实现计划

## 目标

在首页 Hero 区域添加一个双层粒子动效背景：

1. **背景层**：缓慢漂浮的环境粒子（类 antigravity.google 氛围），鼠标经过时轻微扰动
2. **前景层**：一群粒子主动跟随鼠标移动，遇到随机生成的障碍物时自动分流绕行（类水流绕石头）

---

## 需求规格

| 维度 | 规格 |
|------|------|
| 作用范围 | 仅首页 Hero 区域（`<section>` 内部） |
| 粒子总数 | 50-200 个（桌面端），移动端降级或禁用 |
| 粒子形态 | 圆形/不规则形状，带半透明光晕边缘 |
| 粒子配色 | 蓝紫色系（与暖色背景形成对比张力） |
| 障碍物 | 随机生成的抽象几何形状（圆形/矩形），半透明，缓慢消失并在新位置重生 |
| 避障行为 | 分流绕行（水流绕石头的流场效果） |
| 交互 | 前景粒子群跟随鼠标；背景粒子被鼠标轻微扰动 |
| 兼容性 | 桌面端视觉优先，移动端降级/禁用 |
| 技术选型 | Three.js (WebGL) |

---

## 技术分析

### 为什么用 Three.js？

尽管 50-200 个粒子用 Canvas 2D 完全可行，但选择 Three.js 的理由是：

1. **GPU Shader 渲染**：粒子光晕、Additive Blending、柔边都在 GPU 完成，视觉质量远超 Canvas 2D
2. **浅 3D 空间感**：粒子可以有 z 深度，产生远近大小变化和透视效果
3. **统一的渲染管线**：背景粒子、前景粒子群、障碍物可以在同一个 WebGL context 中渲染
4. **Shader 驱动的避障**：流场扰动可以在 vertex shader 中高效计算

### Three.js 包体积控制

Three.js 完整包约 600KB gzip。我们可以通过 tree-shaking 和按需导入来减小体积：

```ts
// ✅ 按需导入，而非 import * as THREE from 'three'
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three'
import { BufferGeometry, BufferAttribute } from 'three'
import { Points, ShaderMaterial } from 'three'
import { AdditiveBlending, Vector2 } from 'three'
```

但注意：Three.js 的 tree-shaking 效果有限，实际节省约 20-30%。预估最终粒子组件的 JS bundle 增量约 **150-200KB gzip**。

> [!IMPORTANT]
> Three.js 会显著增加首屏 JS 体积。需要使用 `next/dynamic` 动态导入，确保粒子组件不阻塞首屏渲染。

### 与项目的兼容性

- **静态导出 (`output: export`)**：Three.js 纯客户端运行，不依赖 Node.js 服务器，完全兼容
- **Tailwind CSS v4**：粒子在 `<canvas>` 中渲染，与 CSS 系统互不干扰
- **React 19**：Three.js 通过 `useRef` + `useEffect` 挂载到 DOM，标准模式
- **`prefers-reduced-motion`**：需要尊重已有的减弱动效媒体查询

---

## 架构设计

### 文件结构

```
components/
  particles/
    ParticleBackground.tsx    # React 组件外壳（动态加载入口）
    renderer.ts               # Three.js 场景初始化与渲染循环
    ambient-layer.ts          # 背景层：漂浮粒子
    flock-layer.ts            # 前景层：鸟群粒子（steering behaviors）
    obstacles.ts              # 障碍物管理（生成/消亡/碰撞检测）
    shaders/
      ambient.vert            # 背景粒子 vertex shader
      ambient.frag            # 背景粒子 fragment shader
      flock.vert              # 前景粒子 vertex shader
      flock.frag              # 前景粒子 fragment shader
    pointer.ts                # 鼠标/触摸输入平滑处理
    config.ts                 # 可调参数集中管理
```

### 渲染架构

```
┌─────────────────────────────────────────────┐
│  React Component (ParticleBackground.tsx)    │
│  - useRef<HTMLCanvasElement>                 │
│  - useEffect → init / dispose               │
│  - next/dynamic 懒加载                       │
├─────────────────────────────────────────────┤
│  renderer.ts                                 │
│  - Scene / Camera / WebGLRenderer            │
│  - requestAnimationFrame 主循环              │
│  - 固定时间步进 (dt cap)                      │
├──────────────┬──────────────────────────────┤
│ ambient-layer │  flock-layer                 │
│ Points +      │  Points + CPU steering       │
│ ShaderMaterial│  ShaderMaterial               │
│ GPU-only      │  每帧更新 BufferAttribute     │
│ 运动          │                              │
├──────────────┴──────────────────────────────┤
│  obstacles.ts                                │
│  - 障碍物位置/半径/生命周期                    │
│  - 供 flock-layer 查询（CPU 侧避障力场）       │
│  - 供 ambient-layer 传入 shader uniform       │
├─────────────────────────────────────────────┤
│  pointer.ts                                  │
│  - 鼠标坐标 → 平滑 anchor                    │
│  - 惯性跟随（弹性阻尼模型）                    │
└─────────────────────────────────────────────┘
```

### 两层粒子的分工

| 特性 | 背景层 (Ambient) | 前景层 (Flock) |
|------|-----------------|----------------|
| 数量 | ~80 个 | ~60 个 |
| 运动方式 | GPU shader 噪声驱动 | CPU steering behaviors |
| 鼠标交互 | 轻微扰动（shader uniform） | 主动跟随（anchor + 槽位） |
| 避障 | 无 | 流场绕行 |
| 视觉特征 | 大小不一、低亮度、慢速漂浮 | 大小均匀、较亮、有方向感 |
| z 深度 | 分散在较大范围 | 集中在中间层 |

---

## 分阶段实施

### Phase 1：基础骨架

**目标**：Three.js canvas 挂载到首页 Hero 区域，能渲染一个空场景。

**改动文件**：
- [NEW] `components/particles/config.ts` — 集中参数
- [NEW] `components/particles/renderer.ts` — 场景/相机/渲染器初始化
- [NEW] `components/particles/ParticleBackground.tsx` — React 组件
- [MODIFY] `app/home-client.tsx` — 在 Hero 区域插入粒子组件

**关键实现**：

```tsx
// ParticleBackground.tsx
'use client'
import { useRef, useEffect } from 'react'
import { initRenderer, dispose } from './renderer'

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // 检查 prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const ctx = initRenderer(canvasRef.current)
    return () => dispose(ctx)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
```

```tsx
// home-client.tsx Hero 区域
<section className="relative ...">
  <ParticleBackground />  {/* 绝对定位背景层 */}
  <div className="relative z-10">  {/* 文字内容层 */}
    ...
  </div>
</section>
```

**动态导入**（避免阻塞首屏）：

```tsx
import dynamic from 'next/dynamic'

const ParticleBackground = dynamic(
  () => import('@/components/particles/ParticleBackground').then(m => m.ParticleBackground),
  { ssr: false }
)
```

---

### Phase 2：背景层（Ambient Particles）

**目标**：80 个漂浮粒子，有空间感、光晕、蓝紫色调。

**改动文件**：
- [NEW] `components/particles/ambient-layer.ts`
- [NEW] `components/particles/shaders/ambient.vert`
- [NEW] `components/particles/shaders/ambient.frag`
- [MODIFY] `components/particles/renderer.ts` — 集成 ambient layer

**Vertex Shader 核心逻辑**：

```glsl
uniform float uTime;
uniform vec2 uMouse;
uniform float uPixelRatio;
attribute float aRandom;
attribute float aSize;
varying float vRandom;

void main() {
  vRandom = aRandom;
  vec3 pos = position;

  // 噪声漂浮运动
  pos.x += sin(uTime * 0.35 + position.y * 1.8 + aRandom * 8.0) * 0.18;
  pos.y += cos(uTime * 0.28 + position.x * 1.6 + aRandom * 6.0) * 0.18;
  pos.z += sin(uTime * 0.22 + aRandom * 10.0) * 0.25;

  // 鼠标轻微扰动
  float dist = distance(pos.xy, uMouse * 4.0);
  float force = smoothstep(1.4, 0.0, dist);
  pos.xy += normalize(pos.xy - uMouse * 4.0) * force * 0.15;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // 透视大小衰减
  gl_PointSize = aSize * 20.0 * uPixelRatio;
  gl_PointSize *= 1.0 / -mvPosition.z;
}
```

**Fragment Shader 核心逻辑**：

```glsl
varying float vRandom;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);

  // 柔边圆形
  float alpha = smoothstep(0.5, 0.0, d);
  alpha *= 0.5;

  // 蓝紫色渐变
  vec3 blue = vec3(0.25, 0.45, 1.0);
  vec3 violet = vec3(0.75, 0.35, 1.0);
  vec3 color = mix(blue, violet, vRandom);

  gl_FragColor = vec4(color, alpha);
}
```

---

### Phase 3：鼠标输入平滑

**目标**：实现带惯性的 anchor 跟随，为前景粒子群准备。

**改动文件**：
- [NEW] `components/particles/pointer.ts`

**关键实现**：

```ts
export class Pointer {
  // 原始鼠标位置（NDC 坐标）
  rawX = 0
  rawY = 0

  // 平滑 anchor（带惯性）
  anchorX = 0
  anchorY = 0
  anchorVX = 0
  anchorVY = 0

  update(dt: number) {
    const dx = this.rawX - this.anchorX
    const dy = this.rawY - this.anchorY

    // 弹性阻尼模型
    this.anchorVX += dx * 2.0 * dt
    this.anchorVY += dy * 2.0 * dt
    this.anchorVX *= Math.pow(0.14, dt)  // 阻尼衰减
    this.anchorVY *= Math.pow(0.14, dt)

    this.anchorX += this.anchorVX
    this.anchorY += this.anchorVY
  }
}
```

---

### Phase 4：障碍物系统

**目标**：随机生成 3-5 个半透明几何障碍物，有生命周期（淡入→存在→淡出→重生）。

**改动文件**：
- [NEW] `components/particles/obstacles.ts`

**数据结构**：

```ts
type Obstacle = {
  x: number        // 世界坐标
  y: number
  radius: number   // 影响半径
  shape: 'circle' | 'rect'
  life: number     // 0~1，当前生命值
  maxLife: number   // 总生存时间（秒）
  age: number       // 已存在时间
  opacity: number   // 基于生命周期的透明度
}
```

**生命周期**：

```
淡入 (0.3s) → 存在 (8~15s 随机) → 淡出 (1.5s) → 在新位置重生
```

**渲染方式**：
- 障碍物本身不用 Points 渲染，而是用 Three.js 的 `Mesh`（`CircleGeometry` / `PlaneGeometry`）
- 半透明、低饱和度，不抢视觉焦点
- 可选：给障碍物加微弱的脉动动画

---

### Phase 5：前景粒子群（Flock + Steering）

**目标**：60 个粒子组成一群，跟随鼠标 anchor 移动，遇到障碍物时分流绕行。

**改动文件**：
- [NEW] `components/particles/flock-layer.ts`
- [NEW] `components/particles/shaders/flock.vert`
- [NEW] `components/particles/shaders/flock.frag`
- [MODIFY] `components/particles/renderer.ts` — 集成 flock layer

**运动模型**：

每只粒子 (bird) 维护：

```ts
type Bird = {
  x: number; y: number     // 位置
  vx: number; vy: number   // 速度
  slotIndex: number        // 队形槽位索引
}
```

**每帧计算 5 个力**：

#### 1. Seek（追随槽位）
每只粒子追自己的目标槽位，而非直接追鼠标。槽位用黄金角分布生成在 anchor 周围：

```ts
const goldenAngle = Math.PI * (3 - Math.sqrt(5))
function getSlot(i: number, spacing: number) {
  const r = spacing * Math.sqrt(i + 1)
  const theta = (i + 1) * goldenAngle
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r }
}
```

#### 2. Separation（保持间距）
避免粒子挤在一起。

#### 3. Alignment（方向一致）
让群体有统一的运动方向。

#### 4. Arrival（接近减速）
接近目标槽位时平滑减速，不硬停。

#### 5. Obstacle Avoidance（障碍物避让）
对每个障碍物，计算一个排斥力场：

```ts
function obstacleForce(bird: Bird, obstacle: Obstacle): Vec2 {
  const dx = bird.x - obstacle.x
  const dy = bird.y - obstacle.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const margin = obstacle.radius * 1.5  // 预判距离

  if (dist > margin) return { x: 0, y: 0 }

  // 切线分流力（不是直接弹开，而是绕行）
  const strength = 1.0 - dist / margin
  const nx = dx / dist
  const ny = dy / dist
  // 加切线分量，让粒子从两侧绕过
  const tx = -ny  // 垂直于径向的切线
  const ty = nx
  const side = Math.sign(bird.vx * tx + bird.vy * ty) || 1

  return {
    x: (nx * 0.5 + tx * side * 0.8) * strength * maxForce,
    y: (ny * 0.5 + ty * side * 0.8) * strength * maxForce,
  }
}
```

**力的权重**：

```ts
seekWeight:        1.0
separationWeight:  1.8
alignmentWeight:   0.3
arrivalRadius:     120 // px
obstacleWeight:    2.5  // 避障力最高优先级
```

**为什么不需要 spatial hash？**
- 粒子只有 ~60 个，O(n²) ≈ 3600 次比较/帧
- 障碍物只有 3-5 个
- 完全可控，无需优化邻居查询

---

### Phase 6：障碍物可视化渲染

**目标**：在 Three.js 场景中渲染半透明的障碍物几何体。

**实现**：

```ts
// 圆形障碍物
const geometry = new CircleGeometry(obstacle.radius, 32)
const material = new MeshBasicMaterial({
  color: 0x8B7355,       // 暖棕色，与背景协调
  transparent: true,
  opacity: 0.08,          // 极低不透明度
  depthWrite: false,
})
```

- 障碍物视觉上是极淡的几何轮廓
- 可选：给边缘加 `1px` 描边线（呼应包豪斯线条感）
- 脉动动画：`opacity` 在 0.04 ~ 0.12 之间缓慢呼吸

---

### Phase 7：整合与打磨

**目标**：两层粒子 + 障碍物整合，调参，性能优化。

**改动文件**：
- [MODIFY] `components/particles/renderer.ts` — 整合所有层
- [MODIFY] `app/globals.css` — 可能的样式微调
- [MODIFY] `components/particles/config.ts` — 最终参数调优

**关键细节**：

1. **移动端降级**：

```ts
// config.ts
export function getConfig() {
  const isMobile = window.innerWidth < 768
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReducedMotion) return null  // 完全禁用

  return {
    ambientCount: isMobile ? 0 : 80,
    flockCount: isMobile ? 0 : 60,
    obstacleCount: isMobile ? 0 : 4,
    enabled: !isMobile,  // 移动端完全禁用
  }
}
```

2. **resize 处理**：

```ts
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
})
```

3. **固定时间步进**：

```ts
const MAX_DT = 1 / 30  // 限制最大 dt，防止掉帧时物理爆炸
function tick(now: number) {
  const dt = Math.min((now - last) / 1000, MAX_DT)
  last = now
  update(dt)
  render()
  requestAnimationFrame(tick)
}
```

4. **页面可见性**：

```ts
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 暂停渲染循环
  } else {
    // 恢复渲染循环，重置 last timestamp
  }
})
```

---

## 参数调优指南

### 视觉效果参数

```ts
// 背景粒子
ambient: {
  count: 80,
  sizeRange: [4, 18],         // px (会被透视缩放)
  speedMultiplier: 0.3,       // 运动速度系数（慢速漂浮）
  colors: {
    blue: [0.25, 0.45, 1.0],
    violet: [0.75, 0.35, 1.0],
  },
  mouseInfluence: 0.15,       // 鼠标扰动强度
  opacity: 0.5,
  spread: { x: 10, y: 6, z: 4 },  // 粒子分布范围
}

// 前景粒子群
flock: {
  count: 60,
  sizeRange: [6, 12],
  maxSpeed: 300,              // px/s
  maxForce: 800,              // px/s²
  colors: {
    cyan: [0.3, 0.7, 1.0],
    magenta: [0.9, 0.3, 0.8],
  },
  opacity: 0.7,
  slotSpacing: 15,            // 槽位间距 (px)
}

// 障碍物
obstacles: {
  count: 4,
  radiusRange: [30, 80],      // px
  lifeRange: [8, 15],         // 秒
  fadeInDuration: 0.3,        // 秒
  fadeOutDuration: 1.5,       // 秒
  opacity: 0.08,
  color: 0x8B7355,
}
```

### "水流绕石头"效果调参

- `obstacleWeight` ↑ → 绕行更早、更大弧度
- 切线分量 > 径向分量 → 更明显的分流效果
- `arrivalRadius` ↑ → 粒子群展开更松散
- `separationWeight` ↑ → 粒子间距更大，群体更蓬松

---

## 验证计划

### 自动化验证

1. **构建验证**：`pnpm build` 通过，静态导出正常
2. **ESLint**：`pnpm lint` 无新增错误
3. **包体积检查**：确认 Three.js 被动态导入，不影响首屏关键路径

### 手动验证

1. **桌面端 Chrome**：粒子渲染正常，鼠标交互流畅，避障行为自然
2. **移动端**：粒子效果被禁用，页面正常显示，无性能问题
3. **`prefers-reduced-motion`**：粒子完全不渲染
4. **resize**：窗口大小改变时 canvas 自适应
5. **页面切换**：从首页导航到博客页再返回，粒子正确初始化/销毁
6. **性能**：桌面端 Chrome 60fps，无明显掉帧

### 视觉验证

1. 蓝紫色粒子与暖色背景形成优雅对比
2. 粒子光晕柔和、不刺眼
3. 障碍物极淡、不抢视觉层级
4. 前景粒子群分流绕行动作流畅自然
5. 整体效果与包豪斯极简风格协调（不过度炫技）

---

## 风险与备选方案

### 风险 1：Three.js 包体积过大

**影响**：首屏加载变慢
**缓解**：`next/dynamic` + `ssr: false` 确保懒加载
**备选**：如果体积不可接受，改用 raw WebGL（无框架），代码量增加但零依赖

### 风险 2：避障视觉不自然

**影响**：粒子绕行时抖动或不流畅
**缓解**：
- 提高 `arrivalRadius`，让粒子更早减速
- 降低 `maxForce`，减少急转弯
- 增加速度方向平滑（exponential decay on velocity direction）

### 风险 3：与博客内容层冲突

**影响**：粒子动效干扰文字阅读
**缓解**：
- 粒子 canvas 设置 `pointer-events: none`
- 粒子整体 opacity 可进一步降低
- Hero 区域文字加 `text-shadow` 或微弱的 `backdrop-filter` 提高可读性

---

## 预估工期

| 阶段 | 内容 | 预估时间 |
|------|------|---------|
| Phase 1 | 基础骨架 | 15 分钟 |
| Phase 2 | 背景粒子层 | 30 分钟 |
| Phase 3 | 鼠标输入平滑 | 10 分钟 |
| Phase 4 | 障碍物系统 | 20 分钟 |
| Phase 5 | 前景粒子群（核心） | 45 分钟 |
| Phase 6 | 障碍物渲染 | 15 分钟 |
| Phase 7 | 整合打磨 | 30 分钟 |
| **总计** | | **约 2.5-3 小时** |
