import { GestureState, GestureType, LandmarkIndex } from '@/types/hand-tracking';

// 兼容 MediaPipe 的 landmark 类型
type NormalizedLandmark = { x: number; y: number; z: number };
type NormalizedLandmarkList = NormalizedLandmark[];

/**
 * 计算两点之间的欧几里得距离
 */
export function calculateDistance(
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number }
): number {
    return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
}

/**
 * 检测手指是否伸直
 * @param landmarks 手部关键点
 * @param fingerIndex 手指索引 (0=拇指, 1=食指, 2=中指, 3=无名指, 4=小指)
 */
export function isFingerExtended(
    landmarks: NormalizedLandmarkList,
    fingerIndex: number,
    handedness?: 'Left' | 'Right' | null
): boolean {
    // 每根手指的关键点偏移
    const fingerOffsets = [
        [1, 2, 3, 4],     // 拇指: CMC, MCP, IP, TIP
        [5, 6, 7, 8],     // 食指: MCP, PIP, DIP, TIP
        [9, 10, 11, 12],  // 中指
        [13, 14, 15, 16], // 无名指
        [17, 18, 19, 20], // 小指
    ];

    const offsets = fingerOffsets[fingerIndex];
    const mcp = landmarks[offsets[0]];
    const pip = landmarks[offsets[1]];
    const tip = landmarks[offsets[3]];

    if (fingerIndex === 0) {
        // 拇指特殊处理: 使用 x 坐标判断 (区分左右手)
        if (handedness === 'Left') {
            return tip.x > mcp.x;
        }
        if (handedness === 'Right') {
            return tip.x < mcp.x;
        }
        // 未知手型时保守处理
        return tip.x < mcp.x;
    }

    // 其他手指: 指尖应该比 PIP 关节更高 (y 值更小表示更高)
    return tip.y < pip.y;
}

/**
 * 检测捏合手势
 */
export function detectPinch(landmarks: NormalizedLandmarkList): {
    isPinching: boolean;
    strength: number;
    distance: number;
} {
    const thumbTip = landmarks[LandmarkIndex.THUMB_TIP];
    const indexTip = landmarks[LandmarkIndex.INDEX_TIP];

    const distance = calculateDistance(thumbTip, indexTip);

    const PINCH_THRESHOLD = 0.08;  // 捏合阈值
    const MAX_DISTANCE = 0.15;     // 最大检测距离

    const isPinching = distance < PINCH_THRESHOLD;
    const strength = Math.max(0, Math.min(1, 1 - (distance / MAX_DISTANCE)));

    return { isPinching, strength, distance };
}

/**
 * 检测握拳手势
 */
export function detectFist(landmarks: NormalizedLandmarkList): boolean {
    return detectFistWithHandedness(landmarks, null);
}

export function detectFistWithHandedness(
    landmarks: NormalizedLandmarkList,
    handedness?: 'Left' | 'Right' | null
): boolean {
    // 所有手指都弯曲（包含拇指）
    for (let i = 0; i <= 4; i++) {
        if (isFingerExtended(landmarks, i, handedness)) {
            return false;
        }
    }
    return true;
}

/**
 * 检测张开手掌手势
 */
export function detectOpenHand(landmarks: NormalizedLandmarkList): boolean {
    return detectOpenHandWithHandedness(landmarks, null);
}

export function detectOpenHandWithHandedness(
    landmarks: NormalizedLandmarkList,
    handedness?: 'Left' | 'Right' | null
): boolean {
    // 至少 4 根手指伸直（包含拇指）
    let extendedCount = 0;
    for (let i = 0; i <= 4; i++) {
        if (isFingerExtended(landmarks, i, handedness)) {
            extendedCount++;
        }
    }
    return extendedCount >= 4;
}

/**
 * 检测指向手势 (仅食指伸直)
 */
export function detectPoint(
    landmarks: NormalizedLandmarkList,
    handedness?: 'Left' | 'Right' | null
): boolean {
    const indexExtended = isFingerExtended(landmarks, 1, handedness);
    const middleExtended = isFingerExtended(landmarks, 2, handedness);
    const ringExtended = isFingerExtended(landmarks, 3, handedness);
    const pinkyExtended = isFingerExtended(landmarks, 4, handedness);

    return indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
}

/**
 * 综合手势检测
 */
export function detectGesture(
    landmarks: NormalizedLandmarkList,
    handedness?: 'Left' | 'Right' | null
): GestureState {
    const pinchResult = detectPinch(landmarks);

    // 优先级: PINCH > FIST > POINT > OPEN > NONE
    let type: GestureType = 'NONE';
    let confidence = 0;

    if (pinchResult.isPinching) {
        type = 'PINCH';
        confidence = pinchResult.strength;
    } else if (detectFistWithHandedness(landmarks, handedness)) {
        type = 'FIST';
        confidence = 0.9;
    } else if (detectPoint(landmarks, handedness)) {
        type = 'POINT';
        confidence = 0.8;
    } else if (detectOpenHandWithHandedness(landmarks, handedness)) {
        type = 'OPEN';
        confidence = 0.85;
    }

    return {
        type,
        confidence,
        pinchStrength: pinchResult.strength,
        pinchDistance: pinchResult.distance,
    };
}
