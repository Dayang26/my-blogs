// 手势追踪相关类型定义

/**
 * 手部骨架连接定义 (21 个 landmarks 之间的连线)
 * 每个元素为 [start, end] landmark 索引对
 */
export const HAND_CONNECTIONS: readonly [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
] as const;

/**
 * 手势类型枚举
 */
export type GestureType = 'NONE' | 'OPEN' | 'PINCH' | 'FIST' | 'POINT';

/**
 * 手势状态
 */
export interface GestureState {
    type: GestureType;
    confidence: number;      // 0-1
    pinchStrength: number;   // 0-1, 仅 PINCH 时有效
    pinchDistance: number;   // 拇指-食指距离
}

/**
 * 归一化坐标点
 */
export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
}

/**
 * 归一化坐标点列表 (21 个关节点)
 */
export type NormalizedLandmarkList = NormalizedLandmark[];

/**
 * 手部状态
 */
export interface HandState {
    isDetected: boolean;
    landmarks: NormalizedLandmarkList | null;
    handedness: 'Left' | 'Right' | null;
    gesture: GestureState;
}

/**
 * 3D 向量类型 (简化)
 */
export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

/**
 * 手部关键点索引
 */
export enum LandmarkIndex {
    WRIST = 0,
    THUMB_CMC = 1,
    THUMB_MCP = 2,
    THUMB_IP = 3,
    THUMB_TIP = 4,
    INDEX_MCP = 5,
    INDEX_PIP = 6,
    INDEX_DIP = 7,
    INDEX_TIP = 8,
    MIDDLE_MCP = 9,
    MIDDLE_PIP = 10,
    MIDDLE_DIP = 11,
    MIDDLE_TIP = 12,
    RING_MCP = 13,
    RING_PIP = 14,
    RING_DIP = 15,
    RING_TIP = 16,
    PINKY_MCP = 17,
    PINKY_PIP = 18,
    PINKY_DIP = 19,
    PINKY_TIP = 20,
}

/**
 * 坐标映射配置
 */
export interface CoordinateMapperConfig {
    sceneWidth: number;
    sceneHeight: number;
    sceneDepth: number;
    mirrorX: boolean;
}

/**
 * 摄像头 Hook 配置
 */
export interface CameraConfig {
    width?: number;
    height?: number;
    facingMode?: 'user' | 'environment';
}

/**
 * 摄像头 Hook 返回值
 */
export interface UseCameraReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isReady: boolean;
    error: Error | null;
    start: () => Promise<void>;
    stop: () => void;
}

/**
 * 手势追踪 Hook 配置
 */
export interface HandTrackingConfig {
    maxNumHands?: number;
    modelComplexity?: 0 | 1;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
    /**
     * 手部识别置信度阈值（基于 MediaPipe handedness score）
     */
    minHandPresenceConfidence?: number;
    /**
     * 手势置信度阈值（低于该值将视为 NONE）
     */
    minGestureConfidence?: number;
    /**
     * landmark 平滑系数（0-1，越大越平滑）
     */
    landmarkSmoothing?: number;
}
