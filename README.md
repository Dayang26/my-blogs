# SnowLine

这是一个关于前端开发、技术探索与个人成长的博客，采用了极其纯粹的包豪斯极简风格（线性、留白、重排版）进行构建。

## ✨ 主要特点

- **极致极简**: 移除了一切繁杂的视觉元素，专注内容的阅读体验。
- **现代化架构**: 基于 Next.js (App Router) 进行全站静态生成（SSG）。
- **Markdown 支持**: 通过 MDX 高效管理文章，支持自定义组件（如代码块、Giscus 评论）。

## 🛠️ 技术栈

- **前端框架**: Next.js 16 (App Router) with static export
- **核心库**: React 19, TypeScript
- **样式**: Tailwind CSS 4
- **内容管理**: Velite (用于博客文章)
- **包管理**: pnpm

## 🚀 快速开始

1. **安装依赖**:
   ```bash
   pnpm install
   ```
2. **启动开发服务器**:
   ```bash
   pnpm dev
   ```
   这将并行启动 Velite 内容服务器和 Next.js 开发服务器。
3. **访问**:
   - 开发环境: `http://localhost:3000`

## 📚 目录结构

```
my-blogs/
├── app/                    # Next.js App Router 页面
│   ├── blog/               # 博客列表和文章详情
│   ├── layout.tsx          # 根布局与全局导航 (Header/Footer)
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式与设计令牌
├── components/             # React 组件
│   ├── blog/               # 博客专用页面级组件
│   ├── layout/             # 布局相关 (Header/Footer)
│   ├── mdx/                # MDX 渲染用到的自定义组件
│   └── ui/                 # 基础 UI 组件
├── content/posts/          # 博客文章 MDX 源文件
├── lib/                    # 工具函数和配置
├── types/                  # TypeScript 类型定义
└── public/                 # 静态资源
```

## 📖 更多文档

- **项目架构**: 详细的项目结构与模块设计
  - [docs/architecture.md](docs/architecture.md)
