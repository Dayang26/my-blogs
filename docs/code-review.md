# 全面代码审查报告

> 审查日期: 2026-05-25
> 项目: my-blogs (Next.js 16 + Three.js + MediaPipe 手势追踪博客)

---

## 目录

- [1. 架构问题](#1-架构问题)
- [2. Bug 与逻辑错误](#2-bug-与逻辑错误)
- [3. 类型安全问题](#3-类型安全问题)
- [4. 性能问题](#4-性能问题)
- [5. 代码异味与可维护性](#5-代码异味与可维护性)
- [6. 安全问题](#6-安全问题)
- [7. 无障碍问题](#7-无障碍问题)
- [8. 样式与一致性](#8-样式与一致性)
- [9. 改进建议汇总](#9-改进建议汇总)

---

## 1. 架构问题

### 1.1 `/hand-3d` 不必要的软重定向

**文件:** `app/hand-3d/page.tsx`

```tsx
useEffect(() => {
  window.location.href = '/labs/hand-tracking';
}, []);
```

**问题:** 该页面的唯一作用是使用 `useEffect` + `window.location.href` 将用户从 `/hand-3d` 重定向到 `/labs/hand-tracking`。这种方式:
- 对 SEO 不友好（搜索引擎不会跟随 JS 重定向）
- 导致页面闪烁（先渲染空白页，再跳转）
- 用户能看到 "Redirecting..." 的文字

**建议:** 在 `next.config.ts` 中使用 `redirects()` 配置 301 永久重定向:

```ts
async redirects() {
  return [
    {
      source: '/hand-3d',
      destination: '/labs/hand-tracking',
      permanent: true,
    },
  ];
}
```

然后移除 `app/hand-3d/page.tsx` 整个文件。

---

### 1.2 `/logs` 路由没有独立用途

**文件:** `app/logs/page.tsx`

```tsx
export default function LogsPage() {
  redirect('/blog');
}
```

**问题:** 整个路由只做了个重定向到 `/blog`，没有独立页面。增加了一个不必要的路由入口，且每次访问都会触发服务端重定向。

**建议:** 
- 如果 `logs` 作为博客别名，在 `next.config.ts` 中配置 `redirects`
- 或移除该路由，将日志功能合并到博客中

---

### 1.3 3D 坐标映射与 Canvas 尺寸未联动

**文件:** 
- `components/hand-3d/InteractiveScene.tsx:41`
- `lib/hand-tracking/coordinate-mapper.ts:62-65`

```ts
export const DEFAULT_MAPPER_CONFIG: CoordinateMapperConfig = {
  sceneWidth: 4,    // 硬编码
  sceneHeight: 3,   // 硬编码
  sceneDepth: 2,    // 硬编码
  mirrorX: true,
};
```

**问题:** 坐标映射的 `sceneWidth/Height/Depth` 是硬编码值，与场景的 Canvas 尺寸、相机参数没有联动。当 Canvas 尺寸变化（如响应式布局）时，手部追踪的 3D 映射会不准确。

**建议:** 
- 从 Canvas 的宽高比和相机 `fov` 推导映射范围
- 或通过 `useThree` 的 `size` 动态计算映射参数

---

### 1.4 Giscus script 管理方式

**文件:** `components/mdx/giscus.tsx:26-52`

```tsx
useEffect(() => {
  const existingScript = document.querySelector('script[src="https://giscus.app/client.js"]');
  if (existingScript) {
    existingScript.remove(); // 粗暴移除
  }
  // ... 重新创建 script
}, [repo, repoId, category, categoryId, mapping, term, theme, lang]);
```

**问题:** 每次依赖变化时都移除并重新创建 `<script>`，会导致:
- Giscus widget 完全刷新，丢失用户已展开的评论
- 不必要的网络请求
- 页面闪烁

**建议:** 
- 如果只是 `lang` 或 `theme` 变化，使用 `window.giscus` API 更新配置
- 或采用 iframe 消息机制与 Giscus 通信
- 参考 Giscus 官方文档中的动态更新方案

---

## 2. Bug 与逻辑错误

### 2.1 `useFrame` 闭包陷阱 — 抓取逻辑可能失效 `[P0]`

**文件:** `components/hand-3d/InteractiveScene.tsx:93-121`

```tsx
useFrame(() => {
  const isPinching = handState.gesture.type === 'PINCH' && handState.gesture.pinchStrength > 0.7;
  // ...
  if (isPinching && pinchCenter) {
    if (!wasGrabbingRef.current) {
      // 开始抓取
      const nearestId = findNearestObject(pinchCenter, 0.25);
      if (nearestId) {
        // ...
        setGrabbedObjectId(nearestId);  // ← React state
      }
    } else if (grabbedObjectId) {       // ← 闭包中捕获的 state 可能过期
      const objRef = objectRefs.current.get(grabbedObjectId);
      // ...
    }
  }
});
```

**问题:** `useFrame` 回调在组件 mount 时只捕获一次闭包。`grabbedObjectId` 是 React state，当 `setGrabbedObjectId` 更新后，`useFrame` 回调内读取的 `grabbedObjectId` 仍然是旧值。这导致:
- 开始抓取后，持续抓取阶段的 `grabbedObjectId` 为 null，物体不会被移动
- 释放阶段无法获取正确的物体引用

**建议:** 
1. 使用 `useRef` 同步 `grabbedObjectId`:
```tsx
const grabbedObjectIdRef = useRef<string | null>(null);
// 在 setGrabbedObjectId 的同时更新 ref
const setGrabbedObjectIdSync = (id: string | null) => {
  setGrabbedObjectId(id);
  grabbedObjectIdRef.current = id;
};
// useFrame 中读取 grabbedObjectIdRef.current
```
2. 或将抓取逻辑抽离为独立 hook，使用 ref 管理状态

---

### 2.2 `findNearestObject` 使用的位置可能滞后

**文件:** `components/hand-3d/InteractiveScene.tsx:81-89`

```tsx
const findNearestObject = useCallback((position: THREE.Vector3, maxDistance = 0.2) => {
  objectPositions.current.forEach((objPos, id) => {
    const distance = position.distanceTo(objPos);
    // ...
  });
}, []);
```

**问题:** `objectPositions` 由 `onPositionUpdate`（在子组件的 `useFrame` 中执行）更新。由于 `InteractiveScene` 的 `useFrame` 和子组件的 `useFrame` 执行顺序不确定，检测抓取时使用的位置可能与物理引擎的真实位置有偏差。

**建议:**
- 从 `GrabbableObjectRef.getRigidBody()` 直接读取物理引擎的实时位置
- 或增加位置更新时间戳，只使用最新的位置数据

---

### 2.3 `setBodyType` 使用魔法数字

**文件:** `components/hand-3d/GrabbableObjects.tsx:72, 74, 119, 121`

```tsx
rigidBodyRef.current.setBodyType(2, true); // KinematicPositionBased
rigidBodyRef.current.setBodyType(0, true); // Dynamic
```

**问题:** `2` 和 `0` 是魔法数字，分别对应 `RigidBodyType.KinematicPositionBased` 和 `RigidBodyType.Dynamic`。代码没有引用枚举，可读性差且容易出错（比如传反了值）。

**建议:** 使用 `@react-three/rapier` 导出的 `RigidBodyType` 枚举:
```tsx
import { RigidBodyType } from '@react-three/rapier';
rigidBodyRef.current.setBodyType(RigidBodyType.KinematicPositionBased, true);
rigidBodyRef.current.setBodyType(RigidBodyType.Dynamic, true);
```

---

### 2.4 摄像头 `play()` 失败未被捕获

**文件:** `hooks/useCamera.ts:57-65`

```tsx
await new Promise<void>((resolve, reject) => {
  videoRef.current!.onloadedmetadata = () => {
    videoRef.current?.play();  // play() 返回 Promise，但没有 await 或 catch
    resolve();
  };
  videoRef.current!.onerror = () => {
    reject(new Error('视频加载失败'));
  };
});
```

**问题:**
- `video.play()` 返回 Promise，在浏览器自动播放策略下可能被拒绝（reject），但此处没有 `.catch()`
- `onerror` 和 `onloadedmetadata` 同时设置，如果视频既加载元数据又触发 error，行为不确定

**建议:**
```tsx
await new Promise<void>((resolve, reject) => {
  videoRef.current!.onloadedmetadata = async () => {
    try {
      await videoRef.current?.play();
      resolve();
    } catch (e) {
      reject(e);
    }
  };
  videoRef.current!.onerror = () => reject(new Error('视频加载失败'));
});
```

---

## 3. 类型安全问题

### 3.1 不必要的类型断言

**文件:**
- `components/hand-3d/InteractiveScene.tsx:52-53`
- 多处 `as NormalizedLandmarkList`

```tsx
const renderHandPositions = useMemo(() => {
  if (!handState.landmarks) return { /* ... */ };
  return mapHandPositions(handState.landmarks as NormalizedLandmarkList, mapper);
}, [handState.landmarks, mapper]);
```

**问题:** `handState.landmarks` 的类型已经是 `NormalizedLandmarkList | null`，在非空检查后无需再做类型断言。说明类型定义可能存在不一致，或调用方参数类型不匹配。

**建议:** 追踪类型链，确保 `HandState.landmarks` 的类型在源头就是正确的，移除多余的 `as` 断言。

---

### 3.2 `HAND_CONNECTIONS` 下标安全

**文件:** `components/hand-3d/DebugOverlay.tsx:63`

```tsx
HAND_CONNECTIONS.forEach(([start, end]) => {
  const p1 = landmarks[start as LandmarkIndex];  // start 是 number
  const p2 = landmarks[end as LandmarkIndex];
});
```

**问题:** `start` 和 `end` 是 `number` 类型，虽然断言为 `LandmarkIndex`，但无法保证运行时安全。`noUncheckedIndexedAccess` 能检测到潜在的 `undefined`，但这种断言规避了类型系统的保护。

**建议:** 将 `HAND_CONNECTIONS` 定义为 `[LandmarkIndex, LandmarkIndex][]` 类型:

```tsx
const HAND_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  [LandmarkIndex.WRIST, LandmarkIndex.THUMB_CMC],
  // ...
];
```

---

### 3.3 `any` 类型的使用

**文件:**
- `components/labs/EarthBackground.tsx:40, 144` — `shader: any`
- `components/labs/EarthBackground.tsx:110` — `initRot as any`
- `components/mdx-content.tsx:18` — `fn({ ...runtime })` 返回值类型

**问题:** 着色器的 `onBeforeCompile` 回调参数类型不精确，使用了 `any`。同样 `initRot` 的 `as any` 断言跳过了类型检查。

**建议:** 对于 Three.js 着色器，可定义 `Shader` 接口的子集。或至少使用 `@types/three` 中提供的类型，而不是完全回避类型检查。

---

### 3.4 非空断言 (`!`)

**文件:** `lib/blog.ts:22, 31`

```tsx
const mergedPosts: PostEntity[] = metaPosts
  .filter((post) => post.slug)
  .map((post) => ({
    ...post,
    i18n: i18nBySlug.get(post.slug!) ?? {},  // !
  }));
```

**问题:** 虽然有 `.filter((post) => post.slug)` 前置过滤，但 TypeScript 无法通过控制流分析推断 `slug` 一定存在，因此使用了 `post.slug!`。虽然运行时安全，但不够优雅。

**建议:** 使用类型谓词:
```tsx
.filter((post): post is PostMeta & { slug: string } => !!post.slug)
```

---

## 4. 性能问题

### 4.1 `useFrame` 中每帧创建新对象

**文件:** `components/hand-3d/InteractiveScene.tsx:94-114`

```tsx
useFrame(() => {
  const positions = handState.landmarks
    ? mapHandPositions(handState.landmarks as NormalizedLandmarkList, mapper)
    : null;
  // ...
});
```

**问题:** `mapHandPositions` 每次调用创建 4 个新的 `THREE.Vector3` 对象（`indexTip`, `thumbTip`, `palm`, `pinchCenter`）。如果 FPS 为 30，每秒产生 120 个 Vector3 对象，增加 GC 压力。

**建议:** 
- 预先创建可复用的 Vector3 对象池
- 在 `coordinate-mapper.ts` 中提供原地更新（in-place update）方法
- 或只在 `handState.landmarks` 引用变化时才重新计算（用 ref 比较）

---

### 4.2 Landmark 平滑每帧创建新数组

**文件:** `hooks/useHandTracking.ts:198-210`

```tsx
function smoothLandmarks(current, previous, smoothing) {
  if (!previous || smoothing <= 0) {
    return current.map((point) => ({ ...point })); // 全量复制
  }
  return current.map((point, index) => {
    const prev = previous[index] ?? point;
    return {
      x: prev.x + (point.x - prev.x) * t,
      y: prev.y + (point.y - prev.y) * t,
      z: prev.z + (point.z - prev.z) * t,
    };
  });
}
```

**问题:** 每帧创建包含 21 个新对象的数组，每个对象都有 3 个属性。高频 GC 可能导致微卡顿（jank）。

**建议:**
- 维护一个 pre-allocated 的数组池，原地修改
- 或使用类似 `Object.assign` 复用对象（但需要注意不可变性的权衡）

---

### 4.3 DebugOverlay 全量 Canvas 重绘

**文件:** `components/hand-3d/DebugOverlay.tsx:28-97`

**问题:** 每次 `handState` 变化（每帧）都 `clearRect` 全尺寸 canvas 并重绘所有内容。在 640×480 分辨率下虽然不算严重，但可以优化。

**建议:**
- 使用离屏 Canvas 缓存静态元素（骨架连接线）
- 或使用 requestAnimationFrame 节流绘制频率

---

### 4.4 首都坐标数据在组件闭包内

**文件:** `components/labs/EarthBackground.tsx:57-68`

```tsx
const CAPITALS = [
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  // ...
];
```

**问题:** 这个常量数组在 `EarthBackground.tsx` 的组件外定义，但仍在模块顶层。每次引入该模块都会保留该数组。这不是性能问题（数组很小），但更合适的做法是提取到单独的 `data/` 文件。

**建议:** 提取到 `lib/config/capitals.ts` 或 `data/capitals.ts`。

---

### 4.5 搜索索引无客户端缓存

**文件:** `components/blog/BlogIndexClient.tsx:49-58`

```tsx
useEffect(() => {
  fetch('/searchIndex.json')
    .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
    .then((data: SearchIndexItem[]) => { /* ... */ })
    .catch(() => {});
}, []);
```

**问题:** 每次用户访问博客页面都重新请求 `searchIndex.json`（约 5-15KB），即使内容没有变化。在移动网络下会增加加载时间。

**建议:**
- 使用 `localStorage` + 构建时间戳缓存索引
- 或使用 Service Worker 做缓存策略
- 或在构建时将索引内联到 HTML 中

---

## 5. 代码异味与可维护性

### 5.1 `GrabbableBox` 和 `GrabbableSphere` 大量重复代码

**文件:** `components/hand-3d/GrabbableObjects.tsx`

两个组件共享约 90% 的代码:
- 相同的 `useImperativeHandle` 方法（`getId`, `getPosition`, `setKinematic`, `setPosition`, `applyImpulse`）
- 相同的 `useFrame` 逻辑
- 相同的状态管理（`isGrabbed`, `positionRef`）

不同的只有:
- `colliders` 属性（`cuboid` vs `ball`）
- 物理参数（`restitution`, `friction`）
- 渲染的几何体

**建议:** 创建一个通用的 `GrabbableObject` 组件，通过 props 区分碰撞体类型:

```tsx
type ColliderType = 'cuboid' | 'ball';
interface GrabbableObjectProps {
  id: string;
  collider: ColliderType;
  // ...
}
```

---

### 5.2 `HAND_CONNECTIONS` 重复定义

**文件:**
- `components/hand-3d/DebugOverlay.tsx:12-26`
- `lib/hand-tracking/gesture-detector.ts:30-37`

**问题:** 手部骨架连接结构在两个地方以不同形式定义，如果某个手指的索引需要调整，必须同步修改两处。

**建议:** 统一到 `types/hand-tracking.ts`：
```ts
export const HAND_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  [LandmarkIndex.WRIST, LandmarkIndex.THUMB_CMC],
  // ...
];
```

---

### 5.3 缩进不一致

**文件:** 
- `DebugOverlay.tsx` — 混合 2 空格和 4 空格缩进
- 部分 `InteractiveScene.tsx` 函数体缩进不统一

**建议:** 统一为 2 空格（与 `globals.css` 和 `types/` 保持一致）或 4 空格（与 `components/hand-3d/` 大部分文件保持一致）。配置 ESLint `indent` 规则并启用 `--fix`。

---

### 5.4 `tagLabels` 覆盖不全

**文件:** `lib/blog-shared.ts:9-21`

```ts
export const tagLabels: Record<string, { zh: string; en: string }> = {
  AI: { zh: 'AI', en: 'AI' },
  RAG: { zh: 'RAG', en: 'RAG' },
  Architecture: { zh: '系统架构', en: 'Architecture' },
  Philosophy: { zh: '哲学', en: 'Philosophy' },
  Money: { zh: '搞钱', en: 'Money' },
  Rambles: { zh: '碎碎念', en: 'Rambles' },
};
```

**问题:** 博客中可能使用了更多标签（如 `Performance`, `Tuning`, `Physics`, `WebGL` 等），不在 `tagLabels` 中的标签会回退到英文 key，显示原始字符串。

**建议:** 
- 自动生成 tag labels，或从博客内容中收集标签并补充
- 或在运行时发出警告检测未覆盖标签

---

### 5.5 Giscus 配置硬编码

**文件:** `lib/giscus-config.ts`

```ts
export const giscusConfig = {
  repo: 'Dayang26/my-blogs',
  repoId: 'R_kgDOQ-qeBw',
  // ...
};
```

**问题:** Giscus 的 `repoId` 和 `categoryId` 是硬编码的，不适合多人协作或 CI/CD 多环境部署。

**建议:** 使用环境变量（`process.env.NEXT_PUBLIC_GISCUS_REPO_ID` 等），并在运行时提供缺失配置的降级方案。

---

## 6. 安全问题

### 6.1 `Permissions-Policy` 禁止了摄像头

**文件:** `next.config.ts:42`

```ts
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()',
}
```

**问题:** `camera=()` 对全局路径禁止了摄像头访问，但 `/labs/hand-tracking` 页面需要摄像头权限。虽然浏览器的 `getUserMedia` 请求会覆盖策略，但这个 header 可能在某些浏览器上导致权限请求失败。

**建议:** 在 `next.config.ts` 中为不同路由分别配置安全头:

```ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [ /* 全局头，不含 camera */ ],
    },
    {
      source: '/labs/:path*',
      headers: [
        { key: 'Permissions-Policy', value: 'camera=(self)' },
      ],
    },
  ];
}
```

---

### 6.2 `new Function()` 执行 MDX 编译产物

**文件:** `components/mdx-content.tsx:18`

```tsx
const fn = new Function(code);
const Component = fn({ ...runtime }).default;
```

**风险分析:** `code` 来自 Velite 构建时的 MDX 编译产物，非运行时用户输入。由于:
1. 内容在构建阶段编译
2. 代码来自版本控制的 `content/posts/` 目录
3. 没有用户生成内容（UGC）入口

**结论:** 当前风险可控。但如果将来引入用户评论中的 MDX 渲染，此路径将成为严重安全漏洞。

**建议:** 添加注释标记此风险，并确保在任何用户内容进入此函数前有严格的 sanitization。

---

## 7. 无障碍问题

### 7.1 搜索输入缺少标签

**文件:** `components/blog/BlogIndexClient.tsx:107`

```tsx
<input
  type="search"
  value={query}
  onChange={(e) => { setQuery(e.target.value); resetVisible(); }}
  placeholder={copy.control.search}
  className="pixel-input w-full md:max-w-xs"
/>
```

**问题:** 搜索 `<input>` 没有关联 `<label>` 或 `aria-label`，屏幕阅读器用户无法知道这个输入框的用途。

**建议:**
```tsx
<label htmlFor="blog-search" className="sr-only">{copy.control.search}</label>
<input id="blog-search" type="search" aria-label={copy.control.search} ... />
```

---

### 7.2 交互元素缺少 `focus-visible` 样式

**文件:** `app/globals.css:89-133`

`.pixel-card:hover`、`.pixel-chip:hover`、`.pixel-button:hover` 都有 hover 样式，但没有对应的 `:focus-visible` 样式。键盘导航用户无法感知焦点位置。

**建议:** 在所有交互元素上添加 `:focus-visible`:

```css
.pixel-card:focus-visible {
  outline: 2px solid rgba(103, 232, 249, 0.8);
  outline-offset: 2px;
}
```

---

### 7.3 颜色对比度

**文件:** 多处

`text-slate-400` (#94a3b8) 在深色背景 (#0f172a / #020617) 上的对比度约为 5.5:1，勉强通过 WCAG AA 标准（4.5:1）。`text-slate-500` (#64748b) 则降至约 4.8:1。

更细小的文字（如 `.text-xs` 的 `.text-slate-500`）可能对视觉障碍用户阅读困难。

**建议:** 小字号（12px 以下）使用至少 `text-slate-300` (#cbd5e1)，以确保可读性。

---

## 8. 样式与一致性

### 8.1 `@theme inline` 与 Tailwind v4 的 CSS 变量主题

**文件:** `app/globals.css:8-13`

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

**问题:** `@theme inline` 在 Tailwind CSS v4 中的工作方式是生成 CSS 自定义属性。但这里将 `--color-background` 映射到 `var(--background)`，而 `--background` 又是通过常规 CSS 定义的 `#0b0f1a`。这种双层间接引用的方式可能在某些情况下导致主题变量解析失败。

**建议:** 直接使用 Tailwind 的方式:
```css
@theme {
  --color-background: #0b0f1a;
  --color-foreground: #e2e8f0;
}
```

---

### 8.2 light 主题支持不完整

**文件:** `app/globals.css:15-20`

```css
@media (prefers-color-scheme: light) {
  :root {
    --background: #f8fafc;
    --foreground: #0f172a;
  }
}
```

**问题:** 虽然定义了 light 主题的变量，但大多数组件都使用了直接的深色值（如 `bg-slate-950`、`text-slate-100`），没有使用 CSS 变量。因此 light 主题下页面样式会完全错乱。

**建议:** 
- 要么移除 light 主题支持（声明为只支持 dark mode）
- 要么统一使用 CSS 变量而非硬编码颜色

---

## 9. 改进建议汇总

### P0 — 必须修复 (影响功能正确性)

| # | 问题 | 文件 |
|---|------|------|
| 1 | `useFrame` 闭包陷阱导致抓取逻辑异常 | `components/hand-3d/InteractiveScene.tsx:93-121` |

### P1 — 应尽快修复 (架构/可维护性)

| # | 问题 | 文件 |
|---|------|------|
| 1 | `/hand-3d` 软重定向改为 301 | `app/hand-3d/page.tsx` + `next.config.ts` |
| 2 | `setBodyType` 魔法数字改为枚举 | `components/hand-3d/GrabbableObjects.tsx:72,74,119,121` |
| 3 | 摄像头 `play()` 未捕获 reject | `hooks/useCamera.ts:60` |
| 4 | 合并 `GrabbableBox` / `GrabbableSphere` 重复代码 | `components/hand-3d/GrabbableObjects.tsx` |

### P2 — 建议改善 (性能/类型安全)

| # | 问题 | 文件 |
|---|------|------|
| 1 | 减少 `useFrame` 中对象创建 | `InteractiveScene.tsx`, `coordinate-mapper.ts` |
| 2 | 减少 `smoothLandmarks` 每帧数组分配 | `hooks/useHandTracking.ts:198-210` |
| 3 | 移除多余 `as` 类型断言 | 多处 |
| 4 | `HAND_CONNECTIONS` 统一管理 | `DebugOverlay.tsx`, `gesture-detector.ts` |
| 5 | 搜索索引添加客户端缓存 | `components/blog/BlogIndexClient.tsx:49` |
| 6 | `Permissions-Policy` 按路由配置 | `next.config.ts:42` |

### P3 — 长远优化 (无障碍/代码规范)

| # | 问题 | 文件 |
|---|------|------|
| 1 | 搜索输入添加 `aria-label` | `components/blog/BlogIndexClient.tsx:107` |
| 2 | 交互元素添加 `focus-visible` | `app/globals.css` |
| 3 | 缩进统一 | 多处 |
| 4 | `tagLabels` 覆盖完整 | `lib/blog-shared.ts` |
| 5 | Giscus 配置使用环境变量 | `lib/giscus-config.ts` |
| 6 | 首都数据提取到独立文件 | `components/labs/EarthBackground.tsx` |

---

## 附录: 项目健康度评分

| 维度 | 评分 (1-10) | 备注 |
|------|------------|------|
| 架构设计 | 8/10 | 模块清晰，内容管线优秀；小幅路由冗余 |
| 类型安全 | 7/10 | 严格模式开启，但有少量 `any` 和断言 |
| 性能 | 7/10 | 3D 场景对象分配可优化 |
| 可维护性 | 7/10 | 少量重复代码，缩进不统一 |
| 安全性 | 8/10 | 头配置好，`new Function` 风险受控 |
| 无障碍 | 4/10 | 标签缺失、`focus-visible` 缺失、对比度边缘 |
| 文档 | 9/10 | 架构文档完善 |
| 测试覆盖 | 2/10 | 纯函数无单元测试 |
