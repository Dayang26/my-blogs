'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { CameraConfig, UseCameraReturn } from '@/types/hand-tracking';

/**
 * 摄像头访问 Hook
 * 处理浏览器摄像头权限请求和视频流获取
 */
export function useCamera(config?: CameraConfig): UseCameraReturn {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const {
        width = 640,
        height = 480,
        facingMode = 'user',
    } = config || {};

    const start = useCallback(async () => {
        try {
            setError(null);

            // 检查浏览器是否支持
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('您的浏览器不支持摄像头访问');
            }

            // 请求摄像头权限
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: width },
                    height: { ideal: height },
                    facingMode,
                },
                audio: false,
            });

            streamRef.current = stream;

            // 将视频流绑定到 video 元素
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // 等待视频加载完成
                await new Promise<void>((resolve, reject) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current?.play();
                            resolve();
                        };
                        videoRef.current.onerror = () => {
                            reject(new Error('视频加载失败'));
                        };
                    }
                });

                setIsReady(true);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('摄像头访问失败');

            // 处理常见错误
            if (error.name === 'NotAllowedError') {
                setError(new Error('摄像头权限被拒绝，请在浏览器设置中允许访问摄像头'));
            } else if (error.name === 'NotFoundError') {
                setError(new Error('未找到摄像头设备'));
            } else {
                setError(error);
            }

            setIsReady(false);
        }
    }, [width, height, facingMode]);

    const stop = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsReady(false);
    }, []);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        videoRef,
        isReady,
        error,
        start,
        stop,
    };
}
