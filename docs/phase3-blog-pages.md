# Phase 3 · 博客列表页与文章详情页

> 核心阅读体验的重构。这是用户停留时间最长的两个页面。

## 前置依赖

Phase 2 已完成（全局布局、设计系统、首页就绪）

---

## 任务清单

### 3.1 博客列表页

#### [MODIFY] components/blog/BlogIndexClient.tsx — 完全重写

**页面布局**：

```
文章                                   （页面标题）

┌─────────────────────────┐  排序: 最新 ▾
│  搜索文章...             │
└─────────────────────────┘

全部  系统架构  性能优化  设计  ...      （标签筛选）

──────────────────────────────────────

2026.01.15
文章标题在这里                          （列表式布局）
文章摘要文字...
系统架构 · 5 分钟

──────────────────────────────────────

2025.12.20
另一篇文章标题
...

         加载更多
```

**设计要点**：
- 移除所有语言切换相关代码
- **列表式布局**取代卡片网格（包豪斯线性美学）
- 每条文章间用 1px 分割线分隔
- 搜索框：无边框，底部 1px 线，placeholder 灰色
- 标签筛选：文字按钮式
  - 默认：`var(--text-secondary)`
  - 选中：`var(--accent)` + 下划线
  - 间距：gap 16px
- 排序下拉：极简风格（见 custom-select 重构）
- 页面标题："文章"，Space Grotesk, 32px, 700, letter-spacing 0.1em
- 搜索逻辑中移除 `lang` 过滤（只有中文）
- "加载更多"按钮：居中，文字按钮，`var(--accent)`

**文章条目设计**：
- 日期：Inter, 12px, `var(--text-muted)`
- 标题：Space Grotesk, 18px, 600, `var(--text-primary)`，悬浮变 `var(--accent)`
- 摘要：Inter, 14px, `var(--text-secondary)`, line-clamp-2
- 底部信息：标签 + 阅读时长，12px, `var(--text-muted)`
- 整条可点击（Link 包裹）
- padding：上下 24px

#### [MODIFY] components/ui/custom-select.tsx

适配新设计风格：
- 触发器：无边框，底部 1px 线，Inter 14px
- 下拉面板：`var(--surface)` 背景，1px `var(--border)` 边框，轻微阴影
- 选中项：`var(--accent)` 文字色
- 移除所有 `pixel-chip` / `pixel-*` 样式引用

---

### 3.2 文章详情页

#### [MODIFY] components/blog/BlogPostClient.tsx — 完全重写

**页面布局**：

```
← 返回文章列表

系统架构 · 2026.01.15 · 5 分钟             （元信息）

文 章 标 题                                （大标题）

文章摘要，一段简短的介绍文字

──────────────────────────────────────

## 正文标题
                                           （MDX 内容）
正文内容，排版宽松，行高 1.75，
阅读舒适。最大宽度 720px 居中。

──────────────────────────────────────

← 上一篇: xxx        下一篇: xxx →         （前后导航）

──────────────────────────────────────

相关文章
┌──────────┐  ┌──────────┐  ┌──────────┐
└──────────┘  └──────────┘  └──────────┘

──────────────────────────────────────

评论                                       （Giscus）
```

**设计要点**：
- **单栏居中**布局，最大宽度 720px（移除侧边栏）
- 移除语言切换
- **返回链接**：`← 返回文章列表`，Inter, 14px, `var(--text-secondary)`，悬浮变 `var(--accent)`
- **元信息**：标签 · 日期 · 阅读时长，Inter, 13px, `var(--text-muted)`
- **标题**：Space Grotesk, 36-40px, 700, letter-spacing 0.08em
- **摘要**：Inter, 16px, `var(--text-secondary)`, 行高 1.6
- **MDX 内容**：使用 globals.css 中定义的 `.mdx-content` 排版
- **前后导航**：水平排列，flex justify-between
  - "上一篇" 左对齐，"下一篇" 右对齐
  - 文章标题：14px, `var(--text-primary)`，悬浮变 `var(--accent)`
- **相关文章**：3列网格，简化卡片（日期+标题，悬浮变色）
- **评论区**：标题 "评论"，Giscus 使用 `light` 主题

#### [MODIFY] app/blog/[slug]/page.tsx

- Metadata 模板：`{文章标题} — SnowLine`

---

### 3.3 MDX 排版与子组件

#### MDX 排版样式（在 globals.css 中，Phase 1 已部分定义）

确认以下排版规则完整：
- **h2**: Space Grotesk, 24px, 700, margin-top 48px, letter-spacing 0.08em
- **h3**: Space Grotesk, 20px, 600, margin-top 36px
- **p**: Inter, 16px, 行高 1.75, margin-top 16px, `var(--text-primary)`
- **ul/ol**: margin-left 24px, 间距 8px
- **code（行内）**: JetBrains Mono, `var(--code-bg)` 背景, 1px `var(--border)` 边框, padding 2px 6px
- **pre（代码块）**: JetBrains Mono, `var(--code-bg)` 背景, 1px `var(--border)` 边框, padding 20px, overflow-x auto
- **blockquote**: 左侧 3px solid `var(--accent)`, padding-left 16px, `var(--text-secondary)`
- **a（链接）**: `var(--accent)`, 无下划线, 悬浮出现下划线

#### [MODIFY] components/mdx/giscus.tsx

- 确保 `theme` 参数传入 `'light'`（配合 giscus-config 变更）

#### [MODIFY] components/mdx/video.tsx

- 边框从 `border-slate-600` 改为 `border-[var(--border)]`
- 背景从 `bg-slate-900` 改为 `bg-[var(--code-bg)]`
- 错误提示适配浅色主题

---

## 验证

浏览器检查：
1. `/blog` 列表页：搜索、标签筛选、排序、加载更多功能正常
2. `/blog/[slug]` 详情页：MDX 渲染、前后导航、相关文章、Giscus 评论
3. 响应式测试（移动端/平板/桌面）
4. 所有链接跳转正确
