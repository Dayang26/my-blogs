'use client';

import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface VelocityTrackerState {
    positions: THREE.Vector3[];
    timestamps: number[];
    currentVelocity: THREE.Vector3;
}

/**
 * 速度追踪 Hook
 * 追踪手部运动速度，用于抛掷时施加初速度
 */
export function useVelocityTracker(maxSamples: number = 5) {
    const stateRef = useRef<VelocityTrackerState>({
        positions: [],
        timestamps: [],
        currentVelocity: new THREE.Vector3(0, 0, 0),
    });

    const updatePosition = useCallback((position: THREE.Vector3 | null) => {
        if (!position) {
            // 重置追踪
            stateRef.current.positions = [];
            stateRef.current.timestamps = [];
            stateRef.current.currentVelocity.set(0, 0, 0);
            return;
        }

        const now = performance.now();
        const state = stateRef.current;

        // 添加新样本
        state.positions.push(position.clone());
        state.timestamps.push(now);

        // 保持样本数量在限制内
        while (state.positions.length > maxSamples) {
            state.positions.shift();
            state.timestamps.shift();
        }

// 计算速度 (使用最早和最新的样本)
    if (state.positions.length >= 2) {
      const oldestPos = state.positions[0];
      const newestPos = state.positions[state.positions.length - 1];
      const oldestTime = state.timestamps[0];
      const newestTime = state.timestamps[state.timestamps.length - 1];

      if (oldestPos && newestPos && oldestTime !== undefined && newestTime !== undefined) {
        const deltaTime = (newestTime - oldestTime) / 1000;
        if (deltaTime > 0) {
          state.currentVelocity
            .copy(newestPos)
            .sub(oldestPos)
            .divideScalar(deltaTime);
        }
      }
    }
    }, [maxSamples]);

    const getVelocity = useCallback((): THREE.Vector3 => {
        return stateRef.current.currentVelocity.clone();
    }, []);

    const reset = useCallback(() => {
        stateRef.current.positions = [];
        stateRef.current.timestamps = [];
        stateRef.current.currentVelocity.set(0, 0, 0);
    }, []);

    return {
        updatePosition,
        getVelocity,
        reset,
    };
}

export type GrabState = 'idle' | 'detecting' | 'grabbing' | 'holding';

interface UseGrabbingOptions {
    grabRadius?: number;          // 抓取检测范围
    releaseVelocityScale?: number; // 释放速度缩放
}

interface UseGrabbingReturn {
    grabState: GrabState;
    grabbedObjectId: string | null;
    handlePinchStart: (pinchPosition: THREE.Vector3) => void;
    handlePinchEnd: () => THREE.Vector3; // 返回释放速度
    updatePinchPosition: (position: THREE.Vector3) => void;
    setNearbyObjects: (objects: Array<{ id: string; position: THREE.Vector3 }>) => void;
}

/**
 * 抓取机制 Hook
 */
export function useGrabbing(options?: UseGrabbingOptions): UseGrabbingReturn {
    const {
        grabRadius = 0.15,
        releaseVelocityScale = 3,
    } = options || {};

    const [grabState, setGrabState] = useState<GrabState>('idle');
    const [grabbedObjectId, setGrabbedObjectId] = useState<string | null>(null);
    const nearbyObjectsRef = useRef<Array<{ id: string; position: THREE.Vector3 }>>([]);

    const velocityTracker = useVelocityTracker();

    const setNearbyObjects = useCallback((objects: Array<{ id: string; position: THREE.Vector3 }>) => {
        nearbyObjectsRef.current = objects;
    }, []);

    const handlePinchStart = useCallback((pinchPosition: THREE.Vector3) => {
        if (grabState !== 'idle') return;

        setGrabState('detecting');

        // 查找最近的物体
        let closestObject: { id: string; position: THREE.Vector3 } | null = null;
        let closestDistance = grabRadius;

        for (const obj of nearbyObjectsRef.current) {
            const distance = pinchPosition.distanceTo(obj.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestObject = obj;
            }
        }

        if (closestObject) {
            setGrabbedObjectId(closestObject.id);
            setGrabState('grabbing');
            velocityTracker.reset();
        } else {
            setGrabState('idle');
        }
    }, [grabState, grabRadius, velocityTracker]);

    const updatePinchPosition = useCallback((position: THREE.Vector3) => {
        if (grabState === 'grabbing' || grabState === 'holding') {
            velocityTracker.updatePosition(position);
            if (grabState === 'grabbing') {
                setGrabState('holding');
            }
        }
    }, [grabState, velocityTracker]);

    const handlePinchEnd = useCallback((): THREE.Vector3 => {
        const velocity = velocityTracker.getVelocity().multiplyScalar(releaseVelocityScale);

        setGrabbedObjectId(null);
        setGrabState('idle');
        velocityTracker.reset();

        return velocity;
    }, [velocityTracker, releaseVelocityScale]);

    return {
        grabState,
        grabbedObjectId,
        handlePinchStart,
        handlePinchEnd,
        updatePinchPosition,
        setNearbyObjects,
    };
}
