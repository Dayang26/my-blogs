# 项目架构文档

## 概述

这是一个个人技术博客项目，支持中英文双语内容管理，包含手势追踪 3D 演示和实验性功能。

## 技术栈

- **前端框架**: Next.js 16 (App Router) + 静态导出
- **核心库**: React 19, TypeScript
- **样式**: Tailwind CSS 4
- **3D 图形**: Three.js, @react-three/fiber, @react-three/rapier
- **手势追踪**: MediaPipe Hands
- **内容管理**: Velite
- **包管理**: pnpm

## 目录结构

```
my-blogs/
├── app/                      # Next.js App Router 页面
│   ├── blog/                 # 博客相关页面
│   │   ├── page.tsx          # 博客列表页
│   │   └── [slug]/           # 博客文章详情页
│   ├── logs/                 # 日志页 (重定向到 /blog)
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页
│   ├── home-client.tsx       # 首页客户端组件
│   └── globals.css           # 全局样式
├── components/               # React 组件
│   ├── blog/                 # 博客相关组件
│   ├── home/                 # 首页相关组件
│   ├── ui/                   # UI 组件
│   └── mdx/                  # MDX 渲染组件
├── content/posts/            # 博客文章 MDX 源文件
├── data/                     # 静态数据
├── docs/                     # 项目文档
├── hooks/                    # 自定义 React Hooks
│   └── useBlogLanguage.ts    # 博客语言切换
├── lib/                      # 工具函数和配置
│   ├── blog.ts               # 博客数据获取
│   ├── blog-shared.ts        # 博客共享配置
│   └── giscus-config.ts      # 评论配置
├── types/                    # TypeScript 类型定义
└── public/                   # 静态资源
```

## 核心模块

### 博客系统

- **内容存储**: `content/posts/` 目录下每篇文章包含 `meta.json` 和双语 MDX 文件 (`zh.mdx`, `en.mdx`)
- **内容构建**: Velite 自动从 MDX 生成搜索索引和类型定义
- **数据获取**: `lib/blog.ts` 中的函数负责聚合和过滤博客数据

### 3D 手势追踪

- **核心逻辑**: `lib/hand-tracking/` 包含 MediaPipe 集成、坐标映射和手势检测
- **3D 场景**: `components/hand-3d/` 包含 3D 场景、物理世界和可交互物体

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 - 博客统计和最新文章 |
| `/blog` | 博客列表 - 带搜索功能 |
| `/blog/[slug]` | 博客文章详情页 |
| `/logs` | 重定向到 `/blog` |
| `/hand-3d` | 重定向到 `/labs/hand-tracking` |
| `/labs` | 实验室首页 |
| `/labs/hand-tracking` | 手势追踪 3D 演示 |
| `/shop` | 商店页面 (占位) |

## 国际化

博客支持中英文双语：
- 界面语言通过 `useBlogLanguage` hook 管理
- 文章内容按语言过滤显示
- 语言设置保存在 `localStorage`

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (并行启动 Velite + Next.js)
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

## 注意事项

- 博客文章需同时提供 `zh.mdx` 和 `en.mdx` 文件以支持双语
- 手势追踪演示需要浏览器摄像头权限
- 生产构建使用静态导出，无服务端功能