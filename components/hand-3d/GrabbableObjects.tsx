'use client';

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, vec3 } from '@react-three/rapier';
import * as THREE from 'three';

interface GrabbableObjectProps {
    id: string;
    position?: [number, number, number];
    size?: [number, number, number];
    color?: string;
    children?: React.ReactNode;
    onPositionUpdate?: (id: string, position: THREE.Vector3) => void;
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
 * 可抓取的方块组件
 */
export const GrabbableBox = forwardRef<GrabbableObjectRef, GrabbableObjectProps>(
    function GrabbableBox(
        { id, position = [0, 2, 0], size = [0.3, 0.3, 0.3], color = '#ff6b6b', onPositionUpdate },
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
                        rigidBodyRef.current.setBodyType(2, true); // KinematicPositionBased
                    } else {
                        rigidBodyRef.current.setBodyType(0, true); // Dynamic
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
                colliders="cuboid"
                restitution={0.3}
                friction={0.7}
                position={position}
                name={id}
            >
                <mesh castShadow>
                    <boxGeometry args={size} />
                    <meshStandardMaterial
                        color={isGrabbed ? '#ffffff' : color}
                        emissive={isGrabbed ? color : '#000000'}
                        emissiveIntensity={isGrabbed ? 0.5 : 0}
                    />
                </mesh>
            </RigidBody>
        );
    }
);

/**
 * 可抓取的球体组件
 */
export const GrabbableSphere = forwardRef<GrabbableObjectRef, GrabbableObjectProps & { radius?: number }>(
    function GrabbableSphere(
        { id, position = [0, 2, 0], radius = 0.2, color = '#4ecdc4', onPositionUpdate },
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
                        rigidBodyRef.current.setBodyType(2, true);
                    } else {
                        rigidBodyRef.current.setBodyType(0, true);
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
                colliders="ball"
                restitution={0.6}
                friction={0.5}
                position={position}
                name={id}
            >
                <mesh castShadow>
                    <sphereGeometry args={[radius, 32, 32]} />
                    <meshStandardMaterial
                        color={isGrabbed ? '#ffffff' : color}
                        emissive={isGrabbed ? color : '#000000'}
                        emissiveIntensity={isGrabbed ? 0.5 : 0}
                    />
                </mesh>
            </RigidBody>
        );
    }
);
