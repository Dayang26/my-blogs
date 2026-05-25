# Phase 4 · 打磨与部署

> 细节优化、SEO 完善、文档更新、部署验证。

## 前置依赖

Phase 3 已完成（所有页面重构完毕）

---

## 任务清单

### 4.1 SEO 优化

每个页面完善 `<title>` 和 `<meta description>`：

| 页面 | title | description |
|------|-------|-------------|
| 首页 `/` | `SnowLine — Aaron Hu 的个人博客` | `关于前端开发、技术探索与个人成长的博客` |
| 博客列表 `/blog` | `文章 — SnowLine` | `浏览所有技术文章` |
| 文章详情 `/blog/[slug]` | `{文章标题} — SnowLine` | `{文章摘要}` |

其他 SEO 要点：
- 确保每页单一 `<h1>`
- 语义化 HTML：`<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`
- 所有交互元素有唯一 `id`
- `<html lang="zh-CN">`

### 4.2 性能优化

- 确认字体加载无 FOUT（next/font 预加载，`display: swap`）
- `images.unoptimized: true` 保留（静态导出约束）
- Tailwind CSS purge 正确移除无用样式
- 检查 JS bundle 大小（移除 3D 依赖后应显著减小）

### 4.3 Cloudflare Pages 部署验证

```bash
# 完整构建
pnpm build

# 本地预览构建产物
pnpm exec serve out
```

验证项：
- `out/` 目录结构完整
- 所有路由可访问（`/`, `/blog`, `/blog/[slug]`）
- 静态资源加载正常（字体、CSS、JS）
- searchIndex.json 可访问

### 4.4 文档更新

#### [MODIFY] README.md

更新：
- 项目名称：`SnowLine`
- 项目描述
- 技术栈（移除 Three.js/MediaPipe 相关）
- 目录结构（移除已删除的目录）
- 注意事项（移除双语要求）

#### [MODIFY] docs/architecture.md

更新：
- 项目概述（移除"手势追踪"描述）
- 技术栈
- 目录结构
- 页面路由表（移除 `/logs`, `/hand-3d`, `/labs`, `/shop`）
- 移除"国际化"章节
- 移除"3D 手势追踪"章节

#### [MODIFY] CLAUDE.md

- 保持现有编码规范不变
- 确认"永远使用中文回复"规则仍然有效

---

## 最终验证清单

### 自动化

```bash
pnpm exec tsc --noEmit     # 类型检查
pnpm lint                   # Lint 检查
pnpm build                  # 静态构建
```

### 浏览器验证

逐页检查：
1. **首页**：Hero 排版、文章卡片、动效、响应式
2. **博客列表**：搜索、标签筛选、排序、加载更多、空结果提示
3. **文章详情**：MDX 渲染（h2/h3/code/blockquote/link）、前后导航、相关文章、Giscus 评论
4. **全局**：Header sticky、Footer 贴底、页面切换流畅
5. **响应式**：320px / 768px / 1024px / 1440px 宽度

### 视觉品质检查

- [ ] 色彩一致性（所有页面使用同一套设计令牌）
- [ ] 排版层次清晰（标题/正文/辅助文字对比度分明）
- [ ] 留白充足（内容不拥挤，呼吸感强）
- [ ] 动效克制（仅在必要处使用，无过度动画）
- [ ] 分割线一致（粗细、颜色统一）
