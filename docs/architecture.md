# 项目架构文档

## 概述

这是一个专注前端开发、技术探索与个人成长的技术博客。项目经过重构，移除了多语言和实验性的 3D 依赖，确立了极致的包豪斯极简视觉风格，通过内容与设计的极简带来沉浸式阅读体验。

## 技术栈

- **前端框架**: Next.js 16 (App Router) + 静态导出 (Static Export)
- **核心库**: React 19, TypeScript
- **样式**: Tailwind CSS 4
- **内容管理**: Velite
- **包管理**: pnpm

## 目录结构

```
my-blogs/
├── app/                      # Next.js App Router 页面
│   ├── blog/                 # 博客相关页面
│   │   ├── page.tsx          # 博客列表页
│   │   └── [slug]/           # 博客文章详情页
│   ├── layout.tsx            # 根布局与全局导航 (Header/Footer)
│   ├── page.tsx              # 首页
│   ├── home-client.tsx       # 首页客户端组件
│   └── globals.css           # 全局样式与设计令牌
├── components/               # React 组件
│   ├── blog/                 # 博客相关组件
│   ├── layout/               # 布局相关 (Header/Footer)
│   ├── ui/                   # UI 基础组件
│   └── mdx/                  # MDX 渲染组件
├── content/posts/            # 博客文章 MDX 源文件 (单语言 zh.mdx)
├── data/                     # 静态数据
├── docs/                     # 项目文档
├── hooks/                    # 自定义 React Hooks
├── lib/                      # 工具函数和配置
│   ├── blog.ts               # 博客数据获取
│   ├── blog-shared.ts        # 博客共享配置
│   └── giscus-config.ts      # 评论配置
├── types/                    # TypeScript 类型定义
└── public/                   # 静态资源
```

## 核心模块

### 博客系统

- **内容存储**: `content/posts/` 目录下每篇文章包含专属目录，统一使用单语 `zh.mdx` 文件管理。
- **内容构建**: Velite 自动从 MDX 生成搜索索引、页面数据和类型定义。
- **数据获取**: `lib/blog.ts` 中的函数负责聚合和过滤博客数据供前端消费。
- **MDX 渲染**: 使用定制化的 `.mdx-content` 样式表，严格遵循排版层级和包豪斯设计规则。

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 - 品牌展示、简介和最新文章列表 |
| `/blog` | 博客列表 - 线性排版，支持标签筛选与排序功能 |
| `/blog/[slug]` | 博客文章详情页 - 单栏沉浸式排版 |

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (并行启动 Velite + Next.js)
pnpm dev

# 构建生产版本
pnpm build

# 代码检查与类型检查
pnpm lint
pnpm exec tsc --noEmit
```

## 注意事项

- 生产构建使用静态导出 (`output: export`)，无服务端 (SSR) 功能。
- 全站仅保留中文语言内容支持。