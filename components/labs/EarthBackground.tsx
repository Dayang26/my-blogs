'use client';

import { Suspense, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Cartoon Cloud (High Poly / Smooth) ---
function CloudGroup({ r = 3, scale = 1, speedX = 0, speedY = 0 }) {
    const orbitGroupRef = useRef<THREE.Group>(null);
    
    const parts = useMemo(() => {
       const list = [];
       // More parts for a fluffier, complex cumulus cloud
       const count = 4 + Math.floor(Math.random() * 4);
       for (let i = 0; i < count; i++) {
           const pr = 0.15 + Math.random() * 0.2; 
           // Spread them wider horizontally and flatter vertically
           const px = (Math.random() - 0.5) * 0.5;
           const py = (Math.random() - 0.5) * 0.1; 
           const pz = (Math.random() - 0.5) * 0.5;
           const scaleY = 0.5 + Math.random() * 0.4; // Squash them vertically
           list.push({ pr, px, py, pz, scaleY });
       }
       return list;
    }, []);

    useFrame(() => {
        if (orbitGroupRef.current) {
            orbitGroupRef.current.rotation.x += speedX;
            orbitGroupRef.current.rotation.y += speedY;
        }
    });

    const initRot = useMemo(() => [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI], []);

    return (
       <group ref={orbitGroupRef} rotation={initRot as any}>
          <group position={[r, 0, 0]} scale={scale}>
             {parts.map((p, i) => (
                 <mesh key={i} position={[p.px, p.py, p.pz]} scale={[1, p.scaleY, 1]} castShadow receiveShadow>
                     <sphereGeometry args={[p.pr, 32, 32]} /> 
                     <meshStandardMaterial color="#ffffff" roughness={1} flatShading={false} />
                 </mesh>
             ))}
          </group>
       </group>
    );
}

// --- High Res Shader Earth ---
function RealCartoonEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const topologyMap = useLoader(THREE.TextureLoader, '/earth-topology.png');

  // Use useMemo to ensure uniform object reference remains stable
  const uniforms = useMemo(() => ({
    topologyMap: { value: topologyMap }
  }), [topologyMap]);

  const onBeforeCompile = useCallback((shader: any) => {
    shader.uniforms.topologyMap = uniforms.topologyMap;
    
    // Inject Uniforms and Varyings
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform sampler2D topologyMap;
      varying float vHeight;
      `
    );
    
    // Extrude based on Topology Map
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Read elevation. Topology map has sea level close to 0
      float topo = texture2D(topologyMap, uv).r;
      
      // We want a sharp plateau for land to get the blocky cartoon thickness
      // Smoother transition to round off the edges of the landmasses
      float mask = smoothstep(0.01, 0.08, topo);
      
      // Lowered the height of the continents relative to sea level for a more natural look
      float extrusion = mask * 0.06; 
      vHeight = mask; // pass to fragment shader for coloring
      
      transformed += normalize(objectNormal) * extrusion;
      `
    );

    // Fragment Shader setup
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying float vHeight;
      `
    );
    
    // Colorize land and ocean based on extrusion height
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Richer sea blue and greener land colors
      vec3 oceanColor = vec3(0.01, 0.52, 0.78); 
      vec3 landColor = vec3(0.13, 0.77, 0.37);  
      vec3 edgeColor = vec3(0.98, 0.82, 0.30);  // Sandy beach color (#fcd34d)
      
      vec3 finalColor = oceanColor;
      // Adjusted thresholds for smoother color transitioning on the rounded edges
      if (vHeight > 0.8) {
          finalColor = landColor; 
      } else if (vHeight > 0.1) {
          finalColor = edgeColor; 
      }
      
      diffuseColor.rgb = finalColor;
      `
    );
  }, [uniforms]);

  return (
    <mesh ref={earthRef} receiveShadow castShadow rotation={[0, -Math.PI / 2, 0]}>
      {/* High-Poly Sphere to remove triangles completely */}
      <sphereGeometry args={[2, 256, 256]} />
      <meshStandardMaterial 
        roughness={0.6} 
        metalness={0.1} 
        onBeforeCompile={onBeforeCompile} 
      />
    </mesh>
  );
}

// --- Scene ---
function CartoonScene() {
    const rootRef = useRef<THREE.Group>(null);
    const numClouds = 25;

    const cloudsData = useMemo(() => [...Array(numClouds)].map(() => ({
       speedX: (Math.random() - 0.5) * 0.005,
       speedY: (Math.random() - 0.5) * 0.005,
       scale: 0.4 + Math.random() * 0.5,
       r: 2.3 + Math.random() * 1.5 // brought clouds slightly closer since continents are lower
    })), []);

    return (
      <>
        {/* Orbit Controls for Mouse Drag Rotation */}
        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={1.5} 
            makeDefault 
        />

        {/* Lights for vibrant cartoon look */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, -5, -5]} intensity={0.6} color="#0284c7" />

        <group ref={rootRef}>
          <RealCartoonEarth />
        </group>

        {/* Orbiting Clouds */}
        {cloudsData.map((d, i) => (
           <CloudGroup key={i} r={d.r} scale={d.scale} speedX={d.speedX} speedY={d.speedY} />
        ))}
      </>
    );
}

export function EarthBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} shadows style={{ background: '#0f172a' }}>
          <CartoonScene />
        </Canvas>
      </Suspense>
    </div>
  );
}