'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface VirtualHandProps {
    indexTipPosition: THREE.Vector3 | null;
    thumbTipPosition: THREE.Vector3 | null;
    palmPosition: THREE.Vector3 | null;
    visible?: boolean;
    isGrabbing?: boolean;
}

/**
 * 虚拟手组件 - 在 3D 场景中表示手部碰撞体
 */
export function VirtualHand({
    indexTipPosition,
    thumbTipPosition,
    palmPosition,
    visible = true,
    isGrabbing = false,
}: VirtualHandProps) {
    const indexRef = useRef<RapierRigidBody>(null);
    const thumbRef = useRef<RapierRigidBody>(null);
    const palmRef = useRef<RapierRigidBody>(null);

    // 每帧更新碰撞体位置
    useFrame(() => {
        if (indexRef.current && indexTipPosition) {
            indexRef.current.setNextKinematicTranslation(indexTipPosition);
        }
        if (thumbRef.current && thumbTipPosition) {
            thumbRef.current.setNextKinematicTranslation(thumbTipPosition);
        }
        if (palmRef.current && palmPosition) {
            palmRef.current.setNextKinematicTranslation(palmPosition);
        }
    });

    const fingerColor = isGrabbing ? '#ff0000' : '#00ff00';
    const palmColor = isGrabbing ? '#ff4444' : '#44ff44';

    return (
        <>
            {/* 食指指尖碰撞球 */}
            {indexTipPosition && (
                <RigidBody
                    ref={indexRef}
                    type="kinematicPosition"
                    colliders={false}
                    position={[indexTipPosition.x, indexTipPosition.y, indexTipPosition.z]}
                >
                    <BallCollider args={[0.03]} />
                    {visible && (
                        <mesh>
                            <sphereGeometry args={[0.03, 16, 16]} />
                            <meshStandardMaterial
                                color={fingerColor}
                                transparent
                                opacity={0.7}
                                emissive={fingerColor}
                                emissiveIntensity={0.3}
                            />
                        </mesh>
                    )}
                </RigidBody>
            )}

            {/* 大拇指指尖碰撞球 */}
            {thumbTipPosition && (
                <RigidBody
                    ref={thumbRef}
                    type="kinematicPosition"
                    colliders={false}
                    position={[thumbTipPosition.x, thumbTipPosition.y, thumbTipPosition.z]}
                >
                    <BallCollider args={[0.03]} />
                    {visible && (
                        <mesh>
                            <sphereGeometry args={[0.03, 16, 16]} />
                            <meshStandardMaterial
                                color={fingerColor}
                                transparent
                                opacity={0.7}
                                emissive={fingerColor}
                                emissiveIntensity={0.3}
                            />
                        </mesh>
                    )}
                </RigidBody>
            )}

            {/* 手掌中心碰撞球 */}
            {palmPosition && (
                <RigidBody
                    ref={palmRef}
                    type="kinematicPosition"
                    colliders={false}
                    position={[palmPosition.x, palmPosition.y, palmPosition.z]}
                >
                    <BallCollider args={[0.05]} />
                    {visible && (
                        <mesh>
                            <sphereGeometry args={[0.05, 16, 16]} />
                            <meshStandardMaterial
                                color={palmColor}
                                transparent
                                opacity={0.5}
                                emissive={palmColor}
                                emissiveIntensity={0.2}
                            />
                        </mesh>
                    )}
                </RigidBody>
            )}
        </>
    );
}
