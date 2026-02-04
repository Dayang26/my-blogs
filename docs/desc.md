# HandTrack 3D 项目概述

## 项目简介

这是一个基于浏览器摄像头的手势追踪与 3D 物理交互演示项目。通过 MediaPipe Hands 识别用户手部关键点，并将其映射到 Three.js 场景中，实现抓取、拖动与抛掷等交互。

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 16.1.4 |
| React | 19.2.3 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| MediaPipe Hands | ^0.4 |
| React Three Fiber | ^9.5 |
| Rapier | ^2.2 |

## 主要路由

- `/`：产品化首页入口
- `/hand-3d`：手势追踪与 3D 交互演示

## 目录结构（核心）

```
app/
  hand-3d/page.tsx        # 手势追踪 3D 页面
  page.tsx                # 首页入口
components/hand-3d/       # 3D 场景与交互组件
hooks/                    # 摄像头/手势/抓取相关 Hooks
lib/hand-tracking/        # MediaPipe 封装、手势识别、坐标映射
types/hand-tracking.ts    # 类型定义
```

## 当前功能状态

- 已完成 MediaPipe Hands 接入与调试覆盖层
- 已完成抓取/拖动/抛掷交互逻辑
- 已加入左右手判断、平滑滤波与置信度门限
- UI 已优化为演示级产品体验
