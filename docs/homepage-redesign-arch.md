# 主页重构：架构设计方案

> 目标：移除像素风背景图/篝火/角色精灵，改为正常博客主页
> ✅ 已完成

## 实现进度

### ✅ Step 1: 架构文档
- [x] 文档模板完成
- [x] 标记状态变更

### ✅ Step 2: `app/page.tsx` — Server Component
- [x] 移除精灵动画、背景图、SpriteConfig 类型
- [x] 改为纯 Server Component
- [x] 引入 `getBlogIndexData()` / `getPostStats()` 获取数据
- [x] 取最新 6 篇文章 + 统计数据，传给 `HomeClient`

### ✅ Step 3: `app/home-client.tsx` — Client Component
- [x] Header：站点名 + 导航链接 (Blog/Labs/Shop) + 语言切换器
- [x] Hero：标语 + 博客统计卡片 (文章数/标签数/系列数)
- [x] 最新文章网格 (3列, 6篇, 复用 `pixel-card` 样式)
- [x] 快速入口 (Labs + Shop)
- [x] Footer (版权 + 导航)

### ✅ Step 4: `app/globals.css` — 样式清理
- [x] 移除 `.pixelated` 类
- [x] 移除 `.sprite` 类
- [x] 移除 `@keyframes sprite-x` 动画

### ✅ Step 5: 修复 Velite 内容管线
> 发现 pre-existing bug：Velite 0.3.1 的 `.transform()` 输出字段（slug, lang 代码）不会被序列化到 JSON 文件，导致 `post.slug === undefined`，`generateStaticParams()` 返回空数组，静态导出失败。
- [x] `velite.config.mts`：在 `prepare` 函数中直接读取文件系统发现 slugs，读取 `meta.json` 获取元数据，从 `data.postI18n` 的 `lang` 字段（含完整文件路径）提取 slug，构建 `compositePosts.json`
- [x] `types/blog.ts`：从 Velite 类型解耦，改用手动定义的 `CompositePost` 接口
- [x] `lib/blog.ts`：改为导入 `.velite/compositePosts.json` 替代 `.velite` 模块

### ✅ Step 6: 验证
- [x] `grep` 确认无残留引用
- [x] `eslint` — 新代码 0 error, 0 warning
- [x] `tsc --noEmit` — 0 error
- [x] `next build` — ✓ Compiled successfully, 20 pages generated

---

## 构建产出

```
Route (app)
┌ ○ /                        ← 新主页 (纯色背景 + 博客文章)
├ ○ /_not-found
├ ○ /blog
├ ● /blog/[slug]             ← 10 篇文章 (SSG)
├ ○ /hand-3d
├ ○ /labs
├ ○ /labs/hand-tracking
├ ○ /logs
└ ○ /shop
```

---

## 1. 变更概要

| 项目 | 当前 (旧) | 目标 (新) |
|------|----------|----------|
| 背景 | `/img_new.png` 全屏图片 + `pixel-grid` + `scanlines` | 纯色深色背景 + 无线条装饰 |
| 装饰元素 | 篝火精灵 (`fire_new.png`)、角色精灵 (`rw.png`) | 移除 |
| 导航 | 右侧纵向按钮 (Lab/Blog/Shop) | 顶部水平导航栏 |
| 内容 | 无内容，仅导航入口 | 最新博客文章列表、博客统计 |
| 页面布局 | 单列，内容居右 | 多区域：Header → Hero → 文章网格 → 快速入口 → Footer |

---

## 2. 组件树

```
app/page.tsx (Server Component)
├── 获取数据: getBlogIndexData()
├── 渲染静态结构
└── app/home-client.tsx (Client Component)
    ├── Header
    │   ├── 站点名称 + 标语
    │   ├── 导航链接 (Blog / Labs / Shop)
    │   └── 语言切换器 (zh/en)
    ├── Hero Section
    │   ├── 欢迎语 (双语)
    │   └── 博客统计 (文章数 / 标签数 / 系列数)
    ├── 最新文章网格 (4-6 篇)
    │   └── PostCard × N
    │       ├── 日期
    │       ├── 标签
    │       ├── 标题
    │       └── 摘要
    ├── 快速入口 (特色链接: Labs, Shop)
    └── Footer
        ├── 版权信息
        └── 链接
```

---

## 3. 数据流

### 3.1 数据获取 (服务端)

```
lib/blog.ts:getBlogIndexData()
  → .velite/posts (meta)
  → .velite/postI18n (zh/en MDX)
  → merged PostEntity[]
  → filtered PostListItem[]
  → { posts, featured, series, changelog, labNotes, tags }
```

### 3.2 Props 传递

```
page.tsx (Server)
  posts: PostListItem[]       // 所有已发布文章
  featured: PostListItem[]    // 精选文章
  stats: { total, tags, series }

  ↓ props 传递

home-client.tsx (Client, 'use client')
  useBlogLanguage() → { lang, setLang }
  getI18n(post, lang) → { title, excerpt, readMinutes }
```

### 3.3 i18n 策略

沿用现有 `useBlogLanguage` hook + `getI18n` 工具函数：
- 默认语言从 `localStorage` 读取，fallback 到 `zh`
- 文章内容按 `lang` 过滤显示
- 界面文案通过 `uiText[lang]` 对象映射

---

## 4. 路由关系

```
/ (Homepage)
├── /blog → 博客列表 (已有 BlogIndexClient)
├── /blog/[slug] → 文章详情 (已有)
├── /labs → 实验室主页 (已有)
├── /labs/hand-tracking → 手势追踪演示 (已有)
└── /shop → 商店页面 (已有)
```

主页承担 **导航枢纽 + 内容展示** 双重角色。

---

## 5. 样式策略

### 5.1 保留的样式

从 `globals.css` 和 `BlogIndexClient` 复用的工具类：
- `.pixel-card` — 文章卡片边框/阴影
- `.pixel-chip` — 标签/导航芯片
- `.pixel-button` — CTA 按钮
- `.pixel-panel` — 面板容器
- `.animate-rise` — 入场动画

### 5.2 移除的样式

- 全局背景图引用 (`/img_new.png`)
- `.sprite` 类及 `sprite-x` 动画
- `.pixelated` 图片渲染类（如果主页不再使用任何像素图）

### 5.3 不保留的部分

- 不使用 `pixel-grid` 和 `scanlines` 背景装饰
- 保持深色主题 (`bg-slate-950`)，更干净

---

## 6. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `app/page.tsx` | **重写** | 移除精灵逻辑/背景图，改为 Server Component 引入博客数据 |
| `app/home-client.tsx` | **重写** | 改为博客主页布局：Header + Hero + 文章网格 + Footer |
| `app/globals.css` | **清理** | 移除 `.sprite` / `@keyframes sprite-x` / `.pixelated`（如不再使用） |

---

## 7. 视觉布局 (文字描述)

```
┌──────────────────────────────────────────┐
│  [HandTrack 3D]  [Blog] [Labs] [Shop]  EN│  ← Header
├──────────────────────────────────────────┤
│  探索 · 构建 · 分享                       │  ← Hero
│  一个关于手势追踪、3D 交互与前端开发的博客   │
│  ● 12 篇文章  ● 8 个标签  ● 3 个系列      │  ← Stats
├──────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Post 1  │ │ Post 2  │ │ Post 3  │    │  ← Recent Posts
│  │ date    │ │ date    │ │ date    │    │     (3-column grid)
│  │ title   │ │ title   │ │ title   │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Post 4  │ │ Post 5  │ │ Post 6  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
├──────────────────────────────────────────┤
│  [🧪 进入实验室]  [🏪 浏览商店]          │  ← Quick Links
├──────────────────────────────────────────┤
│  © 2026 HandTrack Hub  [Home] [Blog]    │  ← Footer
└──────────────────────────────────────────┘
```

---

## 8. 验收标准

- [x] 背景图为纯色，无 `/img_new.png`、无篝火、无角色精灵
- [x] 主页显示最近 6 篇博客文章（标题+日期+摘要）
- [x] 显示博客统计（总文章数、标签数、系列数）
- [x] 顶部导航可跳转到各主要页面
- [x] 语言切换正常 (zh/en)
- [x] 保留像素风格 UI 组件（卡片、按钮）
- [x] `eslint` 通过（0 error）
- [ ] `pnpm build` — 需 Velite 内容构建完成后验证（`.velite` 目录未生成）
