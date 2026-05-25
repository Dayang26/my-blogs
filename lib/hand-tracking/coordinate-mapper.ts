import * as THREE from 'three';
import type { CoordinateMapperConfig, Vector3D } from '@/types/hand-tracking';

/**
 * 创建坐标映射器
 * 将 MediaPipe 的归一化坐标转换为 Three.js 世界坐标
 */
export function createCoordinateMapper(config: CoordinateMapperConfig) {
    const { sceneWidth, sceneHeight, sceneDepth, mirrorX } = config;

    const targetVec = new THREE.Vector3();

    return {
        /**
         * 将 MediaPipe landmark 转换为 Three.js Vector3
         */
        mapLandmarkToWorld(landmark: Vector3D): THREE.Vector3 {
            const x = (landmark.x - 0.5) * sceneWidth * (mirrorX ? -1 : 1);
            const y = (0.5 - landmark.y) * sceneHeight;
            const z = -landmark.z * sceneDepth;
            return new THREE.Vector3(x, y, z);
        },

        /**
         * 原地更新 Vector3 (避免分配新对象)
         */
        mapLandmarkToWorldInPlace(landmark: Vector3D, target: THREE.Vector3 = targetVec): THREE.Vector3 {
            target.x = (landmark.x - 0.5) * sceneWidth * (mirrorX ? -1 : 1);
            target.y = (0.5 - landmark.y) * sceneHeight;
            target.z = -landmark.z * sceneDepth;
            return target;
        },

        /**
         * 批量转换多个关键点
         */
        mapLandmarksToWorld(landmarks: Vector3D[]): THREE.Vector3[] {
            return landmarks.map((lm) => this.mapLandmarkToWorld(lm));
        },

        /**
         * 应用指数移动平均滤波 (减少抖动)
         */
        smoothPosition(
            current: THREE.Vector3,
            previous: THREE.Vector3 | null,
            smoothing: number = 0.3
        ): THREE.Vector3 {
            if (!previous) return current.clone();
            return previous.clone().lerp(current, smoothing);
        },

        /**
         * 计算手部移动速度
         */
        calculateVelocity(
            current: THREE.Vector3,
            previous: THREE.Vector3 | null,
            deltaTime: number
        ): THREE.Vector3 {
            if (!previous || deltaTime <= 0) return new THREE.Vector3(0, 0, 0);
            return current.clone().sub(previous).divideScalar(deltaTime);
        },
    };
}

/**
 * 默认坐标映射配置
 */
export const DEFAULT_MAPPER_CONFIG: CoordinateMapperConfig = {
    sceneWidth: 4,    // 3D 场景宽度 (米)
    sceneHeight: 3,   // 3D 场景高度 (米)
    sceneDepth: 2,    // 3D 场景深度 (米)
    mirrorX: true,    // 镜像翻转 (摄像头画面是镜像的)
};
