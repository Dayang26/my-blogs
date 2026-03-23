'use client';

import { useRef, useEffect } from 'react';
import type { HandState, NormalizedLandmarkList } from '@/types/hand-tracking';
import { LandmarkIndex } from '@/types/hand-tracking';

interface DebugOverlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    handState: HandState;
    fps: number;
    isLoading: boolean;
}

// 手部骨架连接定义
const HAND_CONNECTIONS = [
    // 拇指
    [0, 1], [1, 2], [2, 3], [3, 4],
    // 食指
    [0, 5], [5, 6], [6, 7], [7, 8],
    // 中指
    [0, 9], [9, 10], [10, 11], [11, 12],
    // 无名指
    [0, 13], [13, 14], [14, 15], [15, 16],
    // 小指
    [0, 17], [17, 18], [18, 19], [19, 20],
    // 手掌横向连接
    [5, 9], [9, 13], [13, 17],
];

/**
 * 调试覆盖层组件
 * 在摄像头画面上绘制手部骨架和显示调试信息
 */
export function DebugOverlay({ videoRef, handState, fps, isLoading }: DebugOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 绘制手部骨架
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 匹配视频尺寸
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!handState.landmarks) return;

        const landmarks = handState.landmarks as NormalizedLandmarkList;

        // 绘制骨架线
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;

  HAND_CONNECTIONS.forEach(([start, end]) => {
    const p1 = landmarks[start as LandmarkIndex];
    const p2 = landmarks[end as LandmarkIndex];
    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
    ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
    ctx.stroke();
  });

        // 绘制关键点
        landmarks.forEach((point, index) => {
            const x = point.x * canvas.width;
            const y = point.y * canvas.height;

            // 指尖用不同颜色
            if ([4, 8, 12, 16, 20].includes(index)) {
                ctx.fillStyle = '#ff00ff';
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 如果正在捏合，标记捏合点
  if (handState.gesture.type === 'PINCH') {
    const thumb = landmarks[LandmarkIndex.THUMB_TIP];
    const index = landmarks[LandmarkIndex.INDEX_TIP];
    if (thumb && index) {
      const midX = ((thumb.x + index.x) / 2) * canvas.width;
      const midY = ((thumb.y + index.y) / 2) * canvas.height;

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(midX, midY, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
    }, [handState, videoRef]);

    const gestureEmoji: Record<string, string> = {
        NONE: '❓',
        OPEN: '✋',
        PINCH: '🤏',
        FIST: '✊',
        POINT: '👆',
    };

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* 骨架覆盖层 */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* 调试信息面板 */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm font-mono">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : handState.isDetected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span>
                        {isLoading ? '加载中...' : handState.isDetected ? '检测到手部' : '未检测到'}
                    </span>
                </div>

                <div>FPS: {fps}</div>

                {handState.isDetected && handState.landmarks && (
                    <>
                        <div>手: {handState.handedness}</div>
                        <div>
                            手势: {gestureEmoji[handState.gesture.type]} {handState.gesture.type}
                            ({(handState.gesture.confidence * 100).toFixed(0)}%)
                        </div>
                        <div>捏合强度: {(handState.gesture.pinchStrength * 100).toFixed(0)}%</div>

        <div className="mt-2 text-xs opacity-70">
          食指: ({handState.landmarks?.[8]?.x?.toFixed(2) ?? 'N/A'}, {handState.landmarks?.[8]?.y?.toFixed(2) ?? 'N/A'})
        </div>
                    </>
                )}
            </div>
        </div>
    );
}
