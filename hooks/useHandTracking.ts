'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { createHandTracker, sendFrameToHands, MediaPipeResults } from '@/lib/hand-tracking/mediapipe';
import { detectGesture } from '@/lib/hand-tracking/gesture-detector';
import type { HandState, HandTrackingConfig, GestureState, NormalizedLandmarkList } from '@/types/hand-tracking';

const DEFAULT_GESTURE_STATE: GestureState = {
    type: 'NONE',
    confidence: 0,
    pinchStrength: 0,
    pinchDistance: 1,
};

const DEFAULT_HAND_STATE: HandState = {
    isDetected: false,
    landmarks: null,
    handedness: null,
    gesture: DEFAULT_GESTURE_STATE,
};

interface UseHandTrackingOptions extends HandTrackingConfig {
    enabled?: boolean;
}

interface HandsInstance {
    initialize: () => Promise<void>;
    send: (input: { image: HTMLVideoElement }) => Promise<void>;
    close: () => void;
}

/**
 * 手势追踪 Hook
 * 整合摄像头视频流与 MediaPipe Hands 模型
 */
export function useHandTracking(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    options?: UseHandTrackingOptions
) {
    const {
        enabled = true,
        minHandPresenceConfidence = 0.6,
        minGestureConfidence = 0.6,
        landmarkSmoothing = 0.5,
        maxNumHands = 1,
        modelComplexity = 1,
        minDetectionConfidence = 0.7,
        minTrackingConfidence = 0.5,
    } = options || {};

    const handsConfig = useMemo(
        () => ({
            maxNumHands,
            modelComplexity,
            minDetectionConfidence,
            minTrackingConfidence,
        }),
        [maxNumHands, modelComplexity, minDetectionConfidence, minTrackingConfidence]
    );

    const handsRef = useRef<HandsInstance | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const previousLandmarksRef = useRef<NormalizedLandmarkList | null>(null);
    const [handState, setHandState] = useState<HandState>(DEFAULT_HAND_STATE);
    const [isLoading, setIsLoading] = useState(true);
    const [fps, setFps] = useState(0);

    // FPS 计算
    const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

    // 处理 MediaPipe 结果
    const handleResults = useCallback((results: MediaPipeResults) => {
        // 更新 FPS
        fpsCounterRef.current.frames++;
        const now = performance.now();
        if (now - fpsCounterRef.current.lastTime >= 1000) {
            setFps(fpsCounterRef.current.frames);
            fpsCounterRef.current.frames = 0;
            fpsCounterRef.current.lastTime = now;
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const rawLandmarks = results.multiHandLandmarks[0] as NormalizedLandmarkList;
            const handedness = (results.multiHandedness?.[0]?.label as 'Left' | 'Right') || null;
            const handConfidence = results.multiHandedness?.[0]?.score ?? 1;

            if (handConfidence < minHandPresenceConfidence) {
                previousLandmarksRef.current = null;
                setHandState(DEFAULT_HAND_STATE);
                return;
            }

            const smoothing = Math.min(Math.max(landmarkSmoothing, 0), 0.95);
            const landmarks = smoothLandmarks(rawLandmarks, previousLandmarksRef.current, smoothing);
            previousLandmarksRef.current = landmarks;

            const gesture = detectGesture(landmarks, handedness);
            const stabilizedGesture =
                gesture.confidence >= minGestureConfidence
                    ? gesture
                    : { ...gesture, type: 'NONE' as const };

            setHandState({
                isDetected: true,
                landmarks,
                handedness,
                gesture: stabilizedGesture,
            });
        } else {
            previousLandmarksRef.current = null;
            setHandState(DEFAULT_HAND_STATE);
        }
    }, [landmarkSmoothing, minGestureConfidence, minHandPresenceConfidence]);

    // 初始化 MediaPipe Hands
    useEffect(() => {
        if (!enabled) return;

        let mounted = true;
        setIsLoading(true);

        const initHands = async () => {
            try {
                const hands = await createHandTracker(handsConfig, handleResults);

                if (mounted) {
                    await hands.initialize();
                    handsRef.current = hands;
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('MediaPipe Hands 初始化失败:', err);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initHands();

        return () => {
            mounted = false;
            if (handsRef.current) {
                handsRef.current.close();
                handsRef.current = null;
            }
        };
    }, [enabled, handleResults, handsConfig]);

    // 持续发送视频帧进行检测
    useEffect(() => {
        if (!enabled || isLoading) return;

        const detectFrame = async () => {
            const video = videoRef.current;
            const hands = handsRef.current;

            if (video && hands && video.readyState >= 2) {
                try {
                    await sendFrameToHands(hands as Parameters<typeof sendFrameToHands>[0], video);
                } catch (err) {
                    console.error('帧处理错误:', err);
                }
            }

            animationFrameRef.current = requestAnimationFrame(detectFrame);
        };

        detectFrame();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [enabled, isLoading, videoRef]);

    // 停止时重置状态
    useEffect(() => {
        if (enabled) return;
        previousLandmarksRef.current = null;
        setHandState(DEFAULT_HAND_STATE);
        setIsLoading(false);
        setFps(0);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = performance.now();
    }, [enabled]);

    return {
        handState,
        isLoading,
        fps,
    };
}

function smoothLandmarks(
    current: NormalizedLandmarkList,
    previous: NormalizedLandmarkList | null,
    smoothing: number
): NormalizedLandmarkList {
    if (!previous || smoothing <= 0) {
        return current.map((point) => ({ ...point }));
    }

    const t = 1 - smoothing;
    return current.map((point, index) => {
        const prev = previous[index] ?? point;
        return {
            x: prev.x + (point.x - prev.x) * t,
            y: prev.y + (point.y - prev.y) * t,
            z: prev.z + (point.z - prev.z) * t,
        };
    });
}
