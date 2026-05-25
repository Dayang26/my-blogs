# 个人博客

这是一个关于前端开发、技术探索与个人成长的博客。

## ✨ 主要功能

-   **博客系统**: 支持中英文双语，内容通过 MDX 格式管理。

## 🛠️ 技术栈

-   **前端框架**: Next.js 16 (App Router) with static export
-   **核心库**: React 19, TypeScript
-   **样式**: Tailwind CSS 4
-   **内容管理**: Velite (用于博客文章)
-   **包管理**: pnpm

## 🚀 快速开始

1.  **安装依赖**:
    ```bash
    pnpm install
    ```
2.  **启动开发服务器**:
    ```bash
    pnpm dev
    ```
    这将并行启动 Velite 内容服务器和 Next.js 开发服务器。
3.  **访问**:
    -   开发环境: `http://localhost:3000`

## 📚 目录结构

```
my-blogs/
├── app/                    # Next.js App Router 页面
│   ├── blog/               # 博客列表和文章详情
│   ├── logs/               # 日志页 (重定向到 /blog)
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/             # React 组件
├── content/posts/          # 博客文章 MDX 源文件
├── hooks/                  # 自定义 React Hooks
├── lib/                    # 工具函数和配置
├── types/                  # TypeScript 类型定义
└── public/                 # 静态资源
```

## ⚠️ 注意事项

-   博客文章需要同时提供 `zh.mdx` 和 `en.mdx` 文件以支持双语
-   `/logs` 和 `/hand-3d` 分别为重定向页面

## 📖 更多文档

-   **项目架构**: 详细的项目结构与模块设计
    -   [docs/architecture.md](docs/architecture.md)
