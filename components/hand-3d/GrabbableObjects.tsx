'use client';

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, vec3 } from '@react-three/rapier';
import * as THREE from 'three';

// Rapier rigid body types (WASM API uses numeric values)
const RigidBodyType = {
  Dynamic: 0,
  Fixed: 1,
  KinematicPositionBased: 2,
  KinematicVelocityBased: 3,
} as const;

type ColliderType = 'cuboid' | 'ball';

interface GrabbableObjectProps {
    id: string;
    collider: ColliderType;
    position?: [number, number, number];
    color?: string;
    onPositionUpdate?: (id: string, position: THREE.Vector3) => void;
    physics?: {
        restitution?: number;
        friction?: number;
    };
    children?: React.ReactNode;
}

export interface GrabbableObjectRef {
    getId: () => string;
    getPosition: () => THREE.Vector3;
    getRigidBody: () => RapierRigidBody | null;
    setKinematic: (isKinematic: boolean) => void;
    setPosition: (position: THREE.Vector3) => void;
    applyImpulse: (impulse: THREE.Vector3) => void;
}

/**
 * 通用可抓取物体组件 (统一 GrabbableBox 和 GrabbableSphere)
 */
export const GrabbableObject = forwardRef<GrabbableObjectRef, GrabbableObjectProps>(
    function GrabbableObject(
        { id, collider, position = [0, 2, 0], color = '#ff6b6b', onPositionUpdate, physics, children },
        ref
    ) {
        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const [isGrabbed, setIsGrabbed] = useState(false);
        const positionRef = useRef(new THREE.Vector3(...position));

        useFrame(() => {
            if (rigidBodyRef.current) {
                const translation = rigidBodyRef.current.translation();
                positionRef.current.set(translation.x, translation.y, translation.z);
                onPositionUpdate?.(id, positionRef.current);
            }
        });

        useImperativeHandle(ref, () => ({
            getId: () => id,
            getPosition: () => positionRef.current.clone(),
            getRigidBody: () => rigidBodyRef.current,
            setKinematic: (isKinematic: boolean) => {
                if (rigidBodyRef.current) {
                    if (isKinematic) {
                        rigidBodyRef.current.setBodyType(RigidBodyType.KinematicPositionBased, true);
                    } else {
                        rigidBodyRef.current.setBodyType(RigidBodyType.Dynamic, true);
                    }
                    setIsGrabbed(isKinematic);
                }
            },
            setPosition: (pos: THREE.Vector3) => {
                if (rigidBodyRef.current) {
                    rigidBodyRef.current.setNextKinematicTranslation(pos);
                }
            },
            applyImpulse: (impulse: THREE.Vector3) => {
                if (rigidBodyRef.current) {
                    rigidBodyRef.current.applyImpulse(vec3(impulse), true);
                }
            },
        }));

        return (
            <RigidBody
                ref={rigidBodyRef}
                type="dynamic"
                colliders={collider}
                restitution={physics?.restitution ?? 0.3}
                friction={physics?.friction ?? 0.7}
                position={position}
                name={id}
            >
                {children ? children : (
                    <mesh castShadow>
                        <boxGeometry args={[0.3, 0.3, 0.3]} />
                        <meshStandardMaterial
                            color={isGrabbed ? '#ffffff' : color}
                            emissive={isGrabbed ? color : '#000000'}
                            emissiveIntensity={isGrabbed ? 0.5 : 0}
                        />
                    </mesh>
                )}
            </RigidBody>
        );
    }
);

/** @deprecated Use GrabbableObject with collider="cuboid" instead */
export const GrabbableBox = forwardRef<GrabbableObjectRef, { id: string; position?: [number, number, number]; size?: [number, number, number]; color?: string; onPositionUpdate?: (id: string, position: THREE.Vector3) => void }>(
    function GrabbableBox(props, ref) {
        const { size = [0.3, 0.3, 0.3], color = '#ff6b6b', ...rest } = props;
        return (
            <GrabbableObject ref={ref} collider="cuboid" color={color} physics={{ restitution: 0.3, friction: 0.7 }} {...rest}>
                <mesh castShadow>
                    <boxGeometry args={size} />
                    <meshStandardMaterial color={color} emissive="#000000" emissiveIntensity={0} />
                </mesh>
            </GrabbableObject>
        );
    }
);

/** @deprecated Use GrabbableObject with collider="ball" instead */
export const GrabbableSphere = forwardRef<GrabbableObjectRef, { id: string; position?: [number, number, number]; radius?: number; color?: string; onPositionUpdate?: (id: string, position: THREE.Vector3) => void }>(
    function GrabbableSphere(props, ref) {
        const { radius = 0.2, color = '#4ecdc4', ...rest } = props;
        return (
            <GrabbableObject ref={ref} collider="ball" color={color} physics={{ restitution: 0.6, friction: 0.5 }} {...rest}>
                <mesh castShadow>
                    <sphereGeometry args={[radius, 32, 32]} />
                    <meshStandardMaterial color={color} emissive="#000000" emissiveIntensity={0} />
                </mesh>
            </GrabbableObject>
        );
    }
);
