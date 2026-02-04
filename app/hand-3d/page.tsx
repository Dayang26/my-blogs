'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import {
    Scene3D,
    PhysicsWorld,
    InteractiveScene,
    DebugOverlay,
} from '@/components/hand-3d';

/**
 * 手势追踪 3D 交互演示页面
 */
export default function Hand3DPage() {
    const [isStarted, setIsStarted] = useState(false);
    const [debugMode, setDebugMode] = useState(true);

    // 摄像头 Hook
    const { videoRef, isReady: cameraReady, error: cameraError, start, stop } = useCamera({
        width: 640,
        height: 480,
    });

    // 手势追踪 Hook
    const { handState, isLoading, fps } = useHandTracking(videoRef, {
        enabled: isStarted && cameraReady,
        minHandPresenceConfidence: 0.65,
        minGestureConfidence: 0.65,
        landmarkSmoothing: 0.6,
    });

    const statusPill = useMemo(() => {
        if (cameraError) {
            return { label: 'Camera Error', color: 'bg-red-500/20 text-red-200 border-red-500/30' };
        }
        if (!isStarted) {
            return { label: 'Idle', color: 'bg-slate-500/20 text-slate-200 border-slate-500/30' };
        }
        if (isLoading) {
            return { label: 'Model Loading', color: 'bg-amber-500/20 text-amber-200 border-amber-500/30' };
        }
        if (handState.isDetected) {
            return { label: 'Hand Detected', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
        }
        return { label: 'No Hand', color: 'bg-slate-500/20 text-slate-200 border-slate-500/30' };
    }, [cameraError, handState.isDetected, isLoading, isStarted]);

    // 启动/停止
    const handleToggle = async () => {
        if (isStarted) {
            stop();
            setIsStarted(false);
        } else {
            await start();
            setIsStarted(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* 背景氛围 */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            {/* 头部控制栏 */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                            <span className="text-xl">🖐️</span>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">HandTrack 3D</div>
                            <div className="text-xs text-slate-400">Real-time gesture physics lab</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${statusPill.color}`}
                        >
                            {statusPill.label}
                        </span>
                        <label className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                                type="checkbox"
                                checked={debugMode}
                                onChange={(e) => setDebugMode(e.target.checked)}
                                className="h-4 w-4 accent-cyan-400"
                            />
                            Debug
                        </label>
                        <button
                            onClick={handleToggle}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                isStarted
                                    ? 'bg-red-500/90 text-white hover:bg-red-500'
                                    : 'bg-cyan-500/90 text-slate-950 hover:bg-cyan-400'
                            }`}
                        >
                            {isStarted ? 'Stop' : 'Start'}
                        </button>
                        <Link
                            href="/"
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-white/30"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="mx-auto flex h-screen w-full max-w-7xl flex-col gap-4 px-6 pb-6 pt-24 lg:flex-row">
                {/* 左侧信息区 */}
                <section className="flex w-full flex-col gap-4 lg:w-[360px]">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <div className="text-sm font-semibold">Camera Feed</div>
                            <div className="text-xs text-slate-400">640 × 480</div>
                        </div>
                        <div className="relative aspect-video bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover"
                                style={{ transform: 'scaleX(-1)' }}
                            />

                            {isStarted && (
                                <DebugOverlay
                                    videoRef={videoRef}
                                    handState={handState}
                                    fps={fps}
                                    isLoading={isLoading}
                                />
                            )}

                            {cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 p-4">
                                    <p className="text-center text-sm text-red-100">{cameraError.message}</p>
                                </div>
                            )}

                            {!isStarted && !cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                                    <p className="text-sm text-slate-300">点击 Start 启动摄像头</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <div className="text-sm font-semibold">Live Status</div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                                <div className="text-slate-400">Camera</div>
                                <div className="mt-1 text-sm font-semibold">
                                    {isStarted && cameraReady ? 'Live' : 'Idle'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                                <div className="text-slate-400">Detection</div>
                                <div className="mt-1 text-sm font-semibold">
                                    {isLoading ? 'Loading' : handState.isDetected ? 'Active' : 'None'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                                <div className="text-slate-400">Gesture</div>
                                <div className="mt-1 text-sm font-semibold">{handState.gesture.type}</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                                <div className="text-slate-400">FPS</div>
                                <div className="mt-1 text-sm font-semibold">{fps}</div>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-400">
                            手势置信度: {(handState.gesture.confidence * 100).toFixed(0)}% · 捏合强度:{' '}
                            {(handState.gesture.pinchStrength * 100).toFixed(0)}%
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <div className="text-sm font-semibold">How to Use</div>
                        <ul className="mt-2 space-y-2 text-xs text-slate-300">
                            <li>将手放在摄像头前，保持在画面中心</li>
                            <li>用食指与拇指捏合抓取物体</li>
                            <li>拖动手部移动物体，松开即可抛出</li>
                            <li>开启 Debug 查看骨架与关键点</li>
                        </ul>
                    </div>
                </section>

                {/* 3D 场景区 */}
                <section className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                    <div className="absolute inset-0">
                        <Scene3D debug={debugMode} className="h-full w-full">
                            <PhysicsWorld debug={debugMode}>
                                <InteractiveScene handState={handState} />
                            </PhysicsWorld>
                        </Scene3D>
                    </div>
                </section>
            </main>
        </div>
    );
}
