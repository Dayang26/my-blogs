'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GrabbableBox, GrabbableSphere, GrabbableObjectRef } from './GrabbableObjects';
import { VirtualHand } from './VirtualHand';
import { Ground } from './InteractiveObjects';
import type { HandState, NormalizedLandmarkList } from '@/types/hand-tracking';
import { LandmarkIndex } from '@/types/hand-tracking';
import { createCoordinateMapper, DEFAULT_MAPPER_CONFIG } from '@/lib/hand-tracking';
import { useVelocityTracker } from '@/hooks/useGrabbing';

interface InteractiveSceneProps {
    handState: HandState;
}

/**
 * 交互场景组件
 * 管理所有可抓取物体和手部交互
 */
export function InteractiveScene({ handState }: InteractiveSceneProps) {
    // 可抓取物体的 refs
    const objectRefs = useRef<Map<string, GrabbableObjectRef>>(new Map());
    const objectPositions = useRef<Map<string, THREE.Vector3>>(new Map());

    // 抓取状态
    const [grabbedObjectId, setGrabbedObjectId] = useState<string | null>(null);
    const wasGrabbingRef = useRef(false);

    // 坐标映射器
    const mapper = useMemo(() => createCoordinateMapper(DEFAULT_MAPPER_CONFIG), []);

    // 速度追踪
    const velocityTracker = useVelocityTracker(8);

    const renderHandPositions = useMemo(() => {
        if (!handState.landmarks) {
            return {
                indexTip: null,
                thumbTip: null,
                palm: null,
                pinchCenter: null,
            };
        }
        return mapHandPositions(handState.landmarks as NormalizedLandmarkList, mapper);
    }, [handState.landmarks, mapper]);

    // 注册物体 ref
    const registerObject = useCallback((id: string, ref: GrabbableObjectRef | null) => {
        if (ref) {
            objectRefs.current.set(id, ref);
        } else {
            objectRefs.current.delete(id);
        }
    }, []);

    // 更新物体位置
    const handlePositionUpdate = useCallback((id: string, position: THREE.Vector3) => {
        objectPositions.current.set(id, position.clone());
    }, []);

    // 查找最近的物体
    const findNearestObject = useCallback((position: THREE.Vector3, maxDistance: number = 0.2): string | null => {
        let nearestId: string | null = null;
        let nearestDistance = maxDistance;

        objectPositions.current.forEach((objPos, id) => {
            const distance = position.distanceTo(objPos);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestId = id;
            }
        });

        return nearestId;
    }, []);

    // 每帧更新
    useFrame(() => {
        // 更新手部位置
        const positions = handState.landmarks
            ? mapHandPositions(handState.landmarks as NormalizedLandmarkList, mapper)
            : null;

        const isPinching = handState.gesture.type === 'PINCH' && handState.gesture.pinchStrength > 0.7;
        const pinchCenter = positions?.pinchCenter ?? null;

        // 处理抓取逻辑
        if (isPinching && pinchCenter) {
            if (!wasGrabbingRef.current) {
                // 开始抓取 - 查找最近的物体
                const nearestId = findNearestObject(pinchCenter, 0.25);
                if (nearestId) {
                    const objRef = objectRefs.current.get(nearestId);
                    if (objRef) {
                        objRef.setKinematic(true);
                        setGrabbedObjectId(nearestId);
                        velocityTracker.reset();
                    }
                }
            } else if (grabbedObjectId) {
                // 持续抓取 - 移动物体
                const objRef = objectRefs.current.get(grabbedObjectId);
                if (objRef) {
                    objRef.setPosition(pinchCenter);
                    velocityTracker.updatePosition(pinchCenter);
                }
            }
            wasGrabbingRef.current = true;
        } else {
            if (wasGrabbingRef.current && grabbedObjectId) {
                // 释放物体
                const objRef = objectRefs.current.get(grabbedObjectId);
                if (objRef) {
                    objRef.setKinematic(false);

                    // 施加速度
                    const velocity = velocityTracker.getVelocity();
                    if (velocity.length() > 0.1) {
                        // 缩放速度并施加冲量
                        velocity.multiplyScalar(0.3);
                        objRef.applyImpulse(velocity);
                    }
                }
                setGrabbedObjectId(null);
            }
            wasGrabbingRef.current = false;
        }
    });

    return (
        <>
            <Ground />

            {/* 可抓取的方块 */}
            <GrabbableBox
                ref={(ref) => registerObject('box1', ref)}
                id="box1"
                position={[-0.5, 1, 0]}
                color="#ff6b6b"
                onPositionUpdate={handlePositionUpdate}
            />
            <GrabbableBox
                ref={(ref) => registerObject('box2', ref)}
                id="box2"
                position={[0.5, 1.5, 0]}
                color="#ffd93d"
                onPositionUpdate={handlePositionUpdate}
            />
            <GrabbableBox
                ref={(ref) => registerObject('box3', ref)}
                id="box3"
                position={[0, 2, 0.5]}
                color="#6bcb77"
                onPositionUpdate={handlePositionUpdate}
            />

            {/* 可抓取的球体 */}
            <GrabbableSphere
                ref={(ref) => registerObject('sphere1', ref)}
                id="sphere1"
                position={[-0.3, 2.5, -0.3]}
                color="#4ecdc4"
                onPositionUpdate={handlePositionUpdate}
            />
            <GrabbableSphere
                ref={(ref) => registerObject('sphere2', ref)}
                id="sphere2"
                position={[0.3, 3, 0.3]}
                color="#a855f7"
                onPositionUpdate={handlePositionUpdate}
            />

            {/* 虚拟手 */}
            {handState.isDetected && (
                <VirtualHand
                    indexTipPosition={renderHandPositions.indexTip}
                    thumbTipPosition={renderHandPositions.thumbTip}
                    palmPosition={renderHandPositions.palm}
                    visible={true}
                    isGrabbing={grabbedObjectId !== null}
                />
            )}
        </>
    );
}

function mapHandPositions(landmarks: NormalizedLandmarkList, mapper: ReturnType<typeof createCoordinateMapper>) {
    const indexTip = mapper.mapLandmarkToWorld(landmarks[LandmarkIndex.INDEX_TIP]);
    const thumbTip = mapper.mapLandmarkToWorld(landmarks[LandmarkIndex.THUMB_TIP]);
    const palm = mapper.mapLandmarkToWorld(landmarks[LandmarkIndex.WRIST]);
    const pinchCenter = indexTip.clone().add(thumbTip).multiplyScalar(0.5);

    return {
        indexTip,
        thumbTip,
        palm,
        pinchCenter,
    };
}
