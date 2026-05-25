# Phase 2 · 全局布局与首页

> 构建全局页面骨架和品牌首页。视觉设计正式落地。

## 前置依赖

Phase 1 已完成（设计令牌、数据模型、字体配置就绪）

---

## 任务清单

### 2.1 全局布局组件

#### [NEW] components/layout/header.tsx

- 左侧：`SnowLine` 纯文字 logo（Space Grotesk, 700, letter-spacing 0.15em, 链接到 `/`）
- 右侧：`博客` 导航链接（Inter, 500, 链接到 `/blog`）
- 底部 1px 分割线 `var(--border)`
- sticky 定位，背景 `var(--bg)` 带轻微透明
- 内边距：上下 24px，max-width 1200px 居中

#### [NEW] components/layout/footer.tsx

- 上方 1px 分割线
- 单行 flex 居中：`© {year} SnowLine` · 签名语句（斜体） · `Aaron Hu · flyhsyy@gmail.com`
- 字体：Inter, 12px, `var(--text-muted)`
- 响应式：移动端堆叠多行居中

#### [MODIFY] app/layout.tsx

引入 Header + Footer 包裹 `{children}`，`<main>` flex-1 确保 footer 贴底。

---

### 2.2 首页重构

#### [MODIFY] app/page.tsx + app/home-client.tsx（完全重写）

**Hero 区域**：
- 上下留白 96px+，垂直居中
- 装饰线（120px, 1px, 居中）在标题上下
- "SnowLine" 大标题：Space Grotesk, 48-64px, 700, letter-spacing 0.2-0.3em
- 签名语句：Inter, 16px, italic, `var(--text-secondary)`
- 作者名：Inter, 14px, 500, `var(--text-muted)`

**文章卡片区域**：
- Section 标题："最新文章"（Space Grotesk, 20px, 600）
- 3列/2列/1列响应式网格，gap 32px
- 卡片：无边框，底部 1px 分割线
  - 日期（12px, muted） → 标题（16px, 600, 悬浮变 accent） → 摘要（14px, secondary, 2行截断） → 标签（12px, accent）
- "查看全部文章 →" 居中链接

**动效**：fade-in + 依次延迟（标题→签名→作者→卡片各50ms）

---

## 验证

浏览器检查首页视觉、Header sticky、Footer 贴底、响应式布局、文章卡片渲染和链接跳转。
