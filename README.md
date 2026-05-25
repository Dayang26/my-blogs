# HandTrack 3D - 个人博客与交互式演示

这是一个集成了个人博客和实时手部追踪 3D 物理交互演示的网站项目。

## ✨ 主要功能

-   **博客系统**: 支持中英文双语，内容通过 MDX 格式管理。
-   **实时手部追踪 3D 演示**: 在 `/labs/hand-tracking` 路径下，利用 MediaPipe Hands 进行 21 关节点追踪，结合 React Three Fiber 和 Rapier 物理引擎实现沉浸式 3D 交互。
-   **Lab 实验区**: 集中展示各种实验性功能，可扩展。

## 🛠️ 技术栈

-   **前端框架**: Next.js 16 (App Router) with static export
-   **核心库**: React 19, TypeScript
-   **样式**: Tailwind CSS 4
-   **3D 图形与物理**: Three.js, @react-three/fiber, @react-three/rapier
-   **手部追踪**: MediaPipe Hands
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

## 📚 目录结构概览 (核心)

```
app/
  blog/                     # 博客相关页面
  labs/                     # 实验区域相关页面 (包含 hand-tracking)
  page.tsx                  # 网站首页
components/                 # 通用 React 组件
hooks/                      # 自定义 React Hooks
lib/                        # 工具函数、配置等
  hand-tracking/            # MediaPipe 集成、手势识别、坐标映射核心逻辑
types/                      # TypeScript 类型定义
content/posts/              # 博客文章 MDX 源文件
public/                     # 静态资源 (图片、字体等)
```

## ⚠️ 注意事项

-   由于使用静态导出 (`output: 'export'`)，生产环境中不具备服务器端功能。
-   访问 `/labs/hand-tracking` 页面时，浏览器会请求摄像头权限。
-   博客文章需要同时提供 `zh.mdx` 和 `en.mdx` 文件以支持双语。
-   推荐在光线充足的环境下使用手部追踪功能，以提高识别稳定性。

## 📖 更多文档

-   **项目架构**: 详细的项目结构与模块设计。
    -   [docs/architecture.md](docs/architecture.md)
    -   [docs/hand-tracking-3d-architecture.md](docs/hand-tracking-3d-architecture.md)
-   **代码审查报告**: 识别出的潜在问题和改进建议。
    -   [docs/code-review.md](docs/code-review.md)
-   **主页重构设计**: 主页最新设计方案。
    -   [docs/homepage-redesign-arch.md](docs/homepage-redesign-arch.md)
