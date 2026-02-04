'use client';

import { Physics } from '@react-three/rapier';
import { ReactNode } from 'react';

interface PhysicsWorldProps {
    children: ReactNode;
    debug?: boolean;
    gravity?: [number, number, number];
}

/**
 * 物理世界包装组件
 */
export function PhysicsWorld({
    children,
    debug = false,
    gravity = [0, -9.81, 0],
}: PhysicsWorldProps) {
    return (
        <Physics gravity={gravity} debug={debug}>
            {children}
        </Physics>
    );
}
