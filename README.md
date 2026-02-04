# HandTrack 3D

基于浏览器摄像头的实时手势识别与 3D 物理交互演示项目。

## 功能概览

- MediaPipe Hands 实时 21 关节点追踪
- 左右手识别、平滑滤波与置信度阈值控制
- React Three Fiber + Rapier 物理交互场景
- `/hand-3d` 页面提供调试与状态面板

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- @react-three/fiber / drei / rapier
- MediaPipe Hands

## 本地启动

```bash
pnpm install
pnpm dev
```

访问：`http://localhost:3000/hand-3d`

## 常用脚本

- `pnpm dev` 启动开发服务器
- `pnpm build` 构建生产版本
- `pnpm start` 启动生产服务器
- `pnpm lint` 运行 ESLint

## 注意事项

- 首次进入 `/hand-3d` 需要允许摄像头权限
- 推荐在光线充足环境使用以提升识别稳定性
