'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { ReactNode, Suspense } from 'react';

interface Scene3DProps {
    children?: ReactNode;
    debug?: boolean;
    className?: string;
}

/**
 * 3D 场景容器组件
 */
export function Scene3D({ children, debug = false, className }: Scene3DProps) {
    return (
        <Canvas
            className={className}
            shadows
            camera={{ position: [0, 2, 4], fov: 50 }}
            gl={{ antialias: true }}
            style={{ background: '#0f172a' }}
        >
            <Suspense fallback={null}>
                {/* 光源 */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-far={20}
                    shadow-camera-left={-10}
                    shadow-camera-right={10}
                    shadow-camera-top={10}
                    shadow-camera-bottom={-10}
                />

                {/* 环境 */}
                <Environment preset="city" />

                {/* 调试网格 */}
                {debug && (
                    <Grid
                        position={[0, 0, 0]}
                        args={[10, 10]}
                        cellSize={0.5}
                        cellThickness={0.5}
                        cellColor="#6f6f6f"
                        sectionSize={2}
                        sectionThickness={1}
                        sectionColor="#9d4edd"
                        fadeDistance={25}
                        fadeStrength={1}
                        followCamera={false}
                    />
                )}

                {/* 轨道控制器 (仅调试模式) */}
                {debug && <OrbitControls enableDamping dampingFactor={0.05} />}

                {children}
            </Suspense>
        </Canvas>
    );
}
