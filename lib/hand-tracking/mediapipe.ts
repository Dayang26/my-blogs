'use client';

import type { HandTrackingConfig } from '@/types/hand-tracking';

// MediaPipe 类型定义
export interface MediaPipeResults {
    image: HTMLCanvasElement | HTMLVideoElement;
    multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
    multiHandedness?: Array<{ label: string; score: number }>;
}

type OnResultsCallback = (results: MediaPipeResults) => void;

interface HandsInstance {
    setOptions: (options: Record<string, unknown>) => void;
    onResults: (callback: OnResultsCallback) => void;
    send: (input: { image: HTMLVideoElement | HTMLCanvasElement }) => Promise<void>;
    initialize: () => Promise<void>;
    close: () => void;
}

/**
 * 动态加载 MediaPipe Hands
 */
export async function loadMediaPipeHands(): Promise<typeof import('@mediapipe/hands')> {
    const hands = await import('@mediapipe/hands');
    return hands;
}

/**
 * 创建 MediaPipe Hands 实例
 */
export async function createHandTracker(
    config?: HandTrackingConfig,
    onResults?: OnResultsCallback
): Promise<HandsInstance> {
    const {
        maxNumHands = 1,
        modelComplexity = 1,
        minDetectionConfidence = 0.7,
        minTrackingConfidence = 0.5,
    } = config || {};

    // 动态导入 MediaPipe
    const { Hands } = await import('@mediapipe/hands');

    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
    });

    hands.setOptions({
        maxNumHands,
        modelComplexity,
        minDetectionConfidence,
        minTrackingConfidence,
    });

    if (onResults) {
        hands.onResults(onResults as Parameters<typeof hands.onResults>[0]);
    }

    return hands as unknown as HandsInstance;
}

/**
 * 将视频帧发送给 MediaPipe 处理
 */
export async function sendFrameToHands(
    hands: HandsInstance,
    video: HTMLVideoElement
): Promise<void> {
    await hands.send({ image: video });
}
