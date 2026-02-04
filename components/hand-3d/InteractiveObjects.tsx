'use client';

import { RigidBody } from '@react-three/rapier';

/**
 * 地板组件
 */
export function Ground() {
    return (
        <RigidBody type="fixed" colliders="cuboid" friction={0.8}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial color="#2d2d44" />
            </mesh>
        </RigidBody>
    );
}

interface DynamicBoxProps {
    position?: [number, number, number];
    size?: [number, number, number];
    color?: string;
}

/**
 * 动态方块组件
 */
export function DynamicBox({
    position = [0, 2, 0],
    size = [0.3, 0.3, 0.3],
    color = '#ff6b6b',
}: DynamicBoxProps) {
    return (
        <RigidBody
            type="dynamic"
            colliders="cuboid"
            restitution={0.3}
            friction={0.7}
            position={position}
        >
            <mesh castShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
}

interface DynamicSphereProps {
    position?: [number, number, number];
    radius?: number;
    color?: string;
}

/**
 * 动态球体组件
 */
export function DynamicSphere({
    position = [0, 2, 0],
    radius = 0.2,
    color = '#4ecdc4',
}: DynamicSphereProps) {
    return (
        <RigidBody
            type="dynamic"
            colliders="ball"
            restitution={0.6}
            friction={0.5}
            position={position}
        >
            <mesh castShadow>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
}

/**
 * 场景中的可交互物体集合
 */
export function InteractiveObjects() {
    return (
        <>
            <Ground />

            {/* 多个方块 */}
            <DynamicBox position={[-0.5, 1, 0]} color="#ff6b6b" />
            <DynamicBox position={[0.5, 1.5, 0]} color="#ffd93d" />
            <DynamicBox position={[0, 2, 0.5]} color="#6bcb77" />

            {/* 多个球体 */}
            <DynamicSphere position={[-0.3, 2.5, -0.3]} color="#4ecdc4" />
            <DynamicSphere position={[0.3, 3, 0.3]} color="#a855f7" />
        </>
    );
}
