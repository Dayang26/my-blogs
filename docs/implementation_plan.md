# SnowLine 博客系统 · 新包豪斯风格重构

## 概述

将现有 "HandTrack 3D" 博客从暗色科技/像素风格，重构为 **新包豪斯（Neo-Bauhaus）** 设计语言——极简网格、大量留白、精致排版、克制用色。同时精简功能：去除双语支持（仅保留中文）、去除 3D 演示代码，聚焦纯粹的博客阅读体验。

---

## 设计理念

### 🎨 色彩体系

| 角色 | 色值 | 说明 |
|------|------|------|
| **背景色** | `#F5F1EB` | 暖白，模拟未漂白纸张质感，区别于纯白 |
| **表面色** | `#FEFCF9` | 卡片/面板的纯净底色 |
| **主文字** | `#1A1A1A` | 近黑，高对比阅读 |
| **次文字** | `#6B6B6B` | 辅助信息、时间、标签 |
| **淡文字** | `#A3A3A3` | 极低对比提示文字 |
| **主题色** | `#B44A2D` | 赤陶/铁锈红——包豪斯经典暖色，点缀使用 |
| **主题色悬浮** | `#9A3D24` | 主题色的深一度 |
| **分割线** | `#E8E3DC` | 温暖的灰棕色分隔线 |
| **代码背景** | `#F0ECE6` | 与页面底色微妙区分 |

### 📐 排版系统

- **标题字体**: `Space Grotesk`（几何无衬线，包豪斯气质）
- **正文字体**: `Inter`（现代、高可读性）
- **代码字体**: `JetBrains Mono`
- **标题风格**: 大字号、Letter-spacing 宽松、少量使用 uppercase
- **行高**: 正文 1.75（宽松阅读），标题 1.2

### 📏 网格与空间

- **布局网格**: 12 列 CSS Grid，最大宽度 1200px
- **间距基准**: 8px 为基础单位（8/16/24/32/48/64/96）
- **留白原则**: 内容区域上下留白至少 96px，模块间至少 48px

### ✨ 动效原则

- **克制**: 仅在页面加载和交互反馈时使用
- **形式**: 淡入 + 微位移（translateY 8px），duration 0.5s
- **悬浮**: 色彩变化为主（非放大/位移），transition 0.2s

---

## 技术决策

| 项目 | 决策 | 原因 |
|------|------|------|
| CSS 框架 | **保留 Tailwind CSS v4** | 已有配置，配合 CSS 变量实现设计令牌 |
| 内容管理 | **保留 Velite + MDX** | 成熟方案，改动最小 |
| 渲染模式 | **Static Export** | Cloudflare Pages 要求 |
| 字体加载 | **next/font/google** | 已有方案，零 FOUT |
| 3D 依赖 | **移除** | Three.js / MediaPipe / Rapier |
| 双语支持 | **移除** | 仅保留中文 |

---

## 分阶段计划

---

## Phase 1 · 基础设施清理与设计系统

> 清除旧代码，建立新的设计根基。

### [MODIFY] [globals.css](file:///Users/aaronhu/PycharmProjects/my-blogs/app/globals.css)

**完全重写**。移除所有 `pixel-*` 样式类、`scanlines` 动画、暗色主题变量。建立新的设计令牌体系：

```css
/* 新包豪斯设计令牌 */
:root {
  --bg: #F5F1EB;
  --surface: #FEFCF9;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-muted: #A3A3A3;
  --accent: #B44A2D;
  --accent-hover: #9A3D24;
  --border: #E8E3DC;
  --code-bg: #F0ECE6;
}
```

定义全局排版规则、通用动画、MDX 内容排版。

### [MODIFY] [layout.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/app/layout.tsx)

- 字体改为 `Space Grotesk`（标题）+ `Inter`（正文）+ `JetBrains Mono`（代码）
- Metadata 更新：`title: "SnowLine"`, `description` 更新
- `html lang` 改为 `zh-CN`

### [MODIFY] [blog.ts (types)](file:///Users/aaronhu/PycharmProjects/my-blogs/types/blog.ts)

- 移除 `Lang` 类型和 `LANGS` 常量
- `i18n` 字段简化：只保留中文字段，或将 i18n 拍平为直接的 `title/excerpt/readMinutes/code`

> [!IMPORTANT]
> types 的变更会级联影响 velite.config、blog.ts、所有组件。这是破坏性变更的源头，需要在 Phase 1 中一次性处理完毕。

### [MODIFY] [velite.config.mts](file:///Users/aaronhu/PycharmProjects/my-blogs/velite.config.mts)

- `postI18n` collection 的 pattern 从 `posts/**/{zh,en}.mdx` 改为 `posts/**/zh.mdx`（或保持兼容，只在输出时取 zh）
- 生成的 `compositePosts` 结构调整为不含 i18n 嵌套（直接 `title/excerpt/readMinutes/code`）
- `searchIndex` 只生成中文条目

### [MODIFY] [blog.ts (lib)](file:///Users/aaronhu/PycharmProjects/my-blogs/lib/blog.ts)

- 配合类型变更调整数据获取函数

### [MODIFY] [blog-shared.ts](file:///Users/aaronhu/PycharmProjects/my-blogs/lib/blog-shared.ts)

- 移除 `getI18n`（不再需要多语言选择）
- `tagLabels` 简化为只保留中文标签
- 移除 `getLanguageLabel`

### [DELETE] [useBlogLanguage.ts](file:///Users/aaronhu/PycharmProjects/my-blogs/hooks/useBlogLanguage.ts)

不再需要语言切换 hook。

### [MODIFY] [package.json](file:///Users/aaronhu/PycharmProjects/my-blogs/package.json)

移除 3D 相关依赖：
- `@mediapipe/camera_utils`
- `@mediapipe/hands`
- `@react-three/drei`
- `@react-three/fiber`
- `@react-three/rapier`
- `three`
- `@types/three`

### [DELETE] 3D 相关页面与组件

- `app/logs/` 目录（重定向页，不再需要）
- `components/home/` 目录（如有 3D 相关内容）
- `lib/config/` 目录（`capitals.ts` — 评估是否仍需要）
- `data/capitals.ts`

### [MODIFY] [next.config.ts](file:///Users/aaronhu/PycharmProjects/my-blogs/next.config.ts)

- 移除 `/labs` 相关的 headers 配置
- 保持 `output: 'export'`

### [MODIFY] [giscus-config.ts](file:///Users/aaronhu/PycharmProjects/my-blogs/lib/giscus-config.ts)

- `theme` 从 `dark_dimmed` 改为 `light`（配合浅色主题）
- 移除 `commentsUiText` 的英文条目

---

## Phase 2 · 全局布局与首页

> 构建全局页面骨架和品牌首页。

### [NEW] [header.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/layout/header.tsx)

全局顶部导航：
- 左侧：**SnowLine** logo（纯文字，Space Grotesk，字母间距加宽）
- 右侧：`博客` 导航链接
- 底部 1px 分割线
- 简约、大量呼吸空间

### [NEW] [footer.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/layout/footer.tsx)

全局底部：
- 左侧：`© 2026 SnowLine`
- 中间：`Personality begins where comparison ends.`（signature quote）
- 右侧：`Aaron Hu · flyhsyy@gmail.com`
- 上方 1px 分割线

### [MODIFY] [layout.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/app/layout.tsx)

引入 Header + Footer 包裹 `{children}`，形成全局布局框架。

### [MODIFY] [page.tsx (首页)](file:///Users/aaronhu/PycharmProjects/my-blogs/app/page.tsx) + [MODIFY] [home-client.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/app/home-client.tsx)

**首页设计**（新包豪斯风格）：

```
┌─────────────────────────────────────────────┐
│  SnowLine                           博客     │  ← Header
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│          S n o w L i n e                    │  ← 大标题，几何排版
│                                             │
│    Personality begins where                 │
│         comparison ends.                    │  ← 签名语句
│                                             │
│          Aaron Hu                           │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  最新文章                                    │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 文章卡片  │  │ 文章卡片  │  │ 文章卡片  │  │  ← 网格卡片
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 文章卡片  │  │ 文章卡片  │  │ 文章卡片  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│         查看全部文章 →                        │
│                                             │
├─────────────────────────────────────────────┤
│  © 2026   ·   Quote   ·   Contact          │  ← Footer
└─────────────────────────────────────────────┘
```

**文章卡片设计**：
- 无边框，底部 1px 分割线
- 日期（小号、淡色） + 标题（粗体） + 摘要（灰色，2行截断） + 标签（赤陶色小标签）
- 悬浮时标题变为主题色

---

## Phase 3 · 博客列表页与文章详情页

> 核心阅读体验的重构。

### [MODIFY] [BlogIndexClient.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/blog/BlogIndexClient.tsx)

**博客列表页重构**：

```
┌─────────────────────────────────────────────┐
│  SnowLine                           博客     │
├─────────────────────────────────────────────┤
│                                             │
│  文章                                        │  ← 页面标题
│                                             │
│  ┌─────────────────────────┐  排序: 最新 ▾   │
│  │ 🔍 搜索文章...           │                │
│  └─────────────────────────┘                │
│                                             │
│  全部  系统架构  性能优化  设计  ...           │  ← 标签筛选
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  2026.01.15                                 │
│  文章标题在这里                               │  ← 列表式布局
│  文章摘要文字...                              │
│  系统架构 · 5 分钟                            │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  2025.12.20                                 │
│  另一篇文章标题                               │
│  ...                                        │
│                                             │
│         加载更多                              │
│                                             │
└─────────────────────────────────────────────┘
```

- 移除所有语言切换相关代码
- 列表布局取代卡片网格（更符合包豪斯的线性美学）
- 搜索框改为无边框底线式设计
- 标签筛选改为文字按钮式（选中状态：主题色 + 下划线）
- 排序下拉框重新设计

### [MODIFY] [custom-select.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/ui/custom-select.tsx)

适配新设计风格：去除 pixel-chip 样式，改为极简下拉。

### [MODIFY] [BlogPostClient.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/blog/BlogPostClient.tsx)

**文章详情页重构**：

```
┌─────────────────────────────────────────────┐
│  SnowLine                           博客     │
├─────────────────────────────────────────────┤
│                                             │
│  ← 返回文章列表                               │
│                                             │
│  系统架构 · 2026.01.15 · 5 分钟              │  ← 元信息
│                                             │
│  文 章 标 题                                 │  ← 大标题
│                                             │
│  文章摘要，一段简短的介绍文字                   │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  ## 正文标题                                 │
│                                             │
│  正文内容，排版宽松，行高 1.75，              │  ← MDX 内容
│  阅读舒适。最大宽度 720px 居中。              │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  ← 上一篇: xxx        下一篇: xxx →          │  ← 前后导航
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  相关文章                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  评论                                        │  ← Giscus
│                                             │
└─────────────────────────────────────────────┘
```

- 移除侧边栏布局，改为单栏居中（最大宽度 720px）
- 移除语言切换
- MDX 排版完全适配新设计系统
- 前后文章导航简化为水平排列
- Giscus 主题改为 light

### [MODIFY] MDX 排版样式（在 globals.css 中）

- 标题：Space Grotesk，上方大间距分隔
- 段落：Inter，1.75 行高
- 代码块：JetBrains Mono，暖灰底色，1px 边框
- 引用块：左侧 3px 赤陶色竖线
- 链接：赤陶色，无下划线，悬浮出现下划线

### [MODIFY] [giscus.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/mdx/giscus.tsx)

适配浅色主题（`theme: 'light'`）。

### [MODIFY] [video.tsx](file:///Users/aaronhu/PycharmProjects/my-blogs/components/mdx/video.tsx)

去除暗色边框样式，适配浅色主题。

---

## Phase 4 · 打磨与部署

> 细节优化、SEO 完善、部署验证。

### SEO 优化

- 每个页面完善 `<title>` 和 `<meta description>`
- 首页：`SnowLine — Aaron Hu 的个人博客`
- 博客列表：`文章 — SnowLine`
- 文章详情：`{文章标题} — SnowLine`
- 确保语义化 HTML 结构（`<main>`, `<article>`, `<nav>`, `<aside>`）

### 性能优化

- 确认字体加载无 FOUT（next/font 预加载）
- 图片使用 `unoptimized: true`（静态导出约束）
- 检查 Tailwind purge 是否正确移除无用 CSS

### Cloudflare Pages 部署

- 验证 `pnpm build` 静态输出正常
- 确认 `out/` 目录结构可直接部署
- 测试所有路由可访问

### 文档更新

- [MODIFY] [README.md](file:///Users/aaronhu/PycharmProjects/my-blogs/README.md)：更新项目名称、描述、目录结构
- [MODIFY] [architecture.md](file:///Users/aaronhu/PycharmProjects/my-blogs/docs/architecture.md)：更新架构文档
- [MODIFY] [CLAUDE.md](file:///Users/aaronhu/PycharmProjects/my-blogs/CLAUDE.md)：更新项目规范

---

## 验证计划

### 自动化验证

```bash
# 1. 类型检查
pnpm exec tsc --noEmit

# 2. Lint 检查
pnpm lint

# 3. 静态构建（确保 Cloudflare Pages 兼容）
pnpm build

# 4. 本地预览构建产物
pnpm exec serve out
```

### 浏览器验证

每个 Phase 完成后：
1. `pnpm dev` 启动开发服务器
2. 逐页检查视觉效果（首页 → 博客列表 → 文章详情）
3. 验证搜索、标签筛选、分页功能
4. 验证 Giscus 评论加载
5. 响应式测试（移动端 / 平板 / 桌面）

---

## 文件影响总览

### 新增文件
| 文件 | 说明 |
|------|------|
| `components/layout/header.tsx` | 全局顶部导航 |
| `components/layout/footer.tsx` | 全局底部 |

### 修改文件
| 文件 | 说明 |
|------|------|
| `app/globals.css` | 完全重写设计系统 |
| `app/layout.tsx` | 字体/Metadata/全局布局 |
| `app/page.tsx` | 首页 |
| `app/home-client.tsx` | 首页客户端组件（重写） |
| `app/blog/[slug]/page.tsx` | 文章页 metadata 调整 |
| `components/blog/BlogIndexClient.tsx` | 博客列表（重写） |
| `components/blog/BlogPostClient.tsx` | 文章详情（重写） |
| `components/ui/custom-select.tsx` | 适配新风格 |
| `components/mdx/giscus.tsx` | 适配浅色主题 |
| `components/mdx/video.tsx` | 适配浅色主题 |
| `types/blog.ts` | 简化类型（去 i18n 嵌套） |
| `velite.config.mts` | 简化生成逻辑 |
| `lib/blog.ts` | 适配类型变更 |
| `lib/blog-shared.ts` | 去除多语言函数 |
| `lib/giscus-config.ts` | 浅色主题 |
| `next.config.ts` | 清理无用 headers |
| `package.json` | 移除 3D 依赖 |
| `README.md` | 更新文档 |
| `docs/architecture.md` | 更新架构文档 |

### 删除文件
| 文件 | 说明 |
|------|------|
| `hooks/useBlogLanguage.ts` | 语言切换 hook |
| `app/logs/` | 重定向页 |
| `components/home/` | 旧首页组件（如有） |
| `data/capitals.ts` | 3D 演示数据 |

---

## Open Questions

> [!IMPORTANT]
> **关于现有博客文章**：当前每篇文章需要同时提供 `zh.mdx` 和 `en.mdx`。简化为单语后，`en.mdx` 文件是保留还是删除？建议保留文件但不再读取，避免数据丢失。

> [!IMPORTANT]
> **关于 `components/home/` 目录**：该目录当前为空。确认是否有其他需要清理的 3D 相关文件？（例如 `app/` 下是否有 `labs/`、`hand-3d/`、`shop/` 等目录？如果这些目录已在 `out/` 或源码中不存在则无需处理。）
