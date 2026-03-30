'use client';

import { Suspense, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type WeatherType = 'white' | 'dark' | 'storm';

function RainSystem({ r, type }: { r: number; type: WeatherType }) {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const drops = useMemo(() => {
    return Array.from({ length: count }, () => ({
      // Spawn strictly underneath the cloud base (cloud width is around 0.4)
      x: -0.05 - Math.random() * (r - 2.0), // from cloud base all the way to earth surface
      y: (Math.random() - 0.5) * 0.4, // narrowed lateral spread to only fall from the belly
      z: (Math.random() - 0.5) * 0.4,
      speed: 0.02 + Math.random() * 0.03
    }));
  }, [count, r]);

  useFrame(() => {
    if (type !== 'storm' || !meshRef.current) return;
    drops.forEach((drop, i) => {
      drop.x -= drop.speed;
      // If it falls below the cloud base towards the earth surface (-r + 2.0 is the earth surface)
      if (drop.x < -r + 2.0) {
        drop.x = -0.05 - Math.random() * 0.1; // Loop back exactly to the lower belly of the cloud
      }
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.z = Math.PI / 2; // Point cylinder along the fall axis (X)
      // squash slightly to make them look like motion-blurred lines
      dummy.scale.set(1, 4, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (type !== 'storm') return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} >
      <cylinderGeometry args={[0.003, 0.003, 0.05, 4]} />
      <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
    </instancedMesh>
  );
}

function LightningSystem({ type }: { type: WeatherType }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const nextFlash = useRef(0);
  
  useFrame((state) => {
    if (type !== 'storm' || !lightRef.current) return;
    const now = state.clock.elapsedTime;
    
    // Dim down fast
    if (lightRef.current.intensity > 0) {
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.2);
    }
    
    // Strike!
    if (now > nextFlash.current) {
        lightRef.current.intensity = 10.0 + Math.random() * 5.0; // bright flash
        nextFlash.current = now + 2.0 + Math.random() * 6.0; // Random interval 2-8 seconds
        // multi-strike simulator
        if (Math.random() > 0.5) {
             setTimeout(() => {
                 if (lightRef.current) lightRef.current.intensity = 8.0;
             }, 100);
        }
    }
  });

  if (type !== 'storm') return null;

  return (
    <pointLight ref={lightRef} position={[0, 0.2, 0]} distance={3} intensity={0} decay={2} color="#c084fc" />
  );
}

// --- Cartoon Cloud (High Poly / Smooth) ---
function CloudGroup({ r = 3, scale = 1, speedX = 0, speedY = 0, type = 'white' as WeatherType, color = '#ffffff' }) {
  const orbitGroupRef = useRef<THREE.Group>(null);

  const parts = useMemo(() => {
    const list = [];
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
        const pr = 0.15 + Math.random() * 0.2;
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
  
  const onBeforeCompile = useCallback((shader: any) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      varying float vAltitude;
      `
    ).replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vAltitude = length(worldPos.xyz);
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying float vAltitude;
      `
    ).replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      // Fake Volume Self-Shadowing: Bottom of the cloud (closer to Earth core r=2.0) is much darker
      float ao = smoothstep(2.1, 2.5, vAltitude);
      diffuseColor.rgb *= mix(0.15, 1.0, ao);
      `
    );
  }, []);

  return (
    <group ref={orbitGroupRef} rotation={initRot as any}>
      <group position={[r, 0, 0]} scale={scale}>
        {parts.map((p, i) => (
          <mesh key={i} position={[p.px, p.py, p.pz]} scale={[1, p.scaleY, 1]} castShadow receiveShadow>
            <sphereGeometry args={[p.pr, 32, 32]} />
            <meshStandardMaterial 
                 color={color} 
                 roughness={1} 
                 flatShading={false} 
                 onBeforeCompile={onBeforeCompile}
                 side={THREE.FrontSide}
            />
          </mesh>
        ))}
        {/* Dynamic Weather Systems generated only for storms */}
        <RainSystem r={r} type={type} />
        <LightningSystem type={type} />
      </group>
    </group>
  );
}

// --- High Res Shader Earth ---
function RealCartoonEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const topologyMap = useLoader(THREE.TextureLoader, '/earth-topology.png');
  const rippleIndex = useRef(0);
  const maxRipples = 10;

  // Use useMemo to ensure uniform object reference remains stable
  const uniforms = useMemo(() => {
    return {
      topologyMap: { value: topologyMap },
      uTime: { value: 0 },
      uRipples: { value: Array.from({ length: maxRipples }, () => new THREE.Vector3(0, 0, 0)) },
      uRippleTimes: { value: new Array(maxRipples).fill(-999.0) }
    };
  }, [topologyMap]);

  // Update time for dynamic ocean waves
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  // CPU-side texture data extraction to block clicking on land
  const topoData = useMemo(() => {
    if (typeof document === 'undefined') return null;
    if (!topologyMap || !topologyMap.image) return null;
    const img = topologyMap.image;
    const canvas = document.createElement('canvas');
    canvas.width = img.width || 1024;
    canvas.height = img.height || 512;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    // Draw the topology map to read its brightness exactly simulating the GLSL
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return {
      data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      width: canvas.width,
      height: canvas.height
    };
  }, [topologyMap]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation(); 
    if (e.intersections && e.intersections.length > 0) {
       const hit = e.intersections[0];
       
       // Detect if the click was exactly on the land by reading the matching UV pixel
       if (topoData && hit.uv) {
           const x = Math.floor(hit.uv.x * topoData.width);
           // In WebGL, UV (0,0) is bottom-left, but canvas (0,0) is top-left
           const y = Math.floor((1.0 - hit.uv.y) * topoData.height);
           const index = (y * topoData.width + x) * 4;
           const brightness = topoData.data[index] ?? 0; // read the red channel
           
           // If the grayscale value > 10 (out of 255), we're hitting land (0.04 > 0.01 shader threshold)
           if (brightness > 10) {
               return; // Abort: The user clicked solid land, do not spawn a water block ripple!
           }
       }
       
       const localPoint = e.object.worldToLocal(hit.point.clone());
       const idx = rippleIndex.current;
       uniforms.uRipples.value[idx]!.copy(localPoint);
       uniforms.uRippleTimes.value[idx] = uniforms.uTime.value;
       rippleIndex.current = (idx + 1) % maxRipples;
    }
  };

  const onBeforeCompile = useCallback((shader: any) => {
    shader.uniforms.topologyMap = uniforms.topologyMap;
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uRipples = uniforms.uRipples;
    shader.uniforms.uRippleTimes = uniforms.uRippleTimes;

    // Inject Uniforms, Varyings, and Analytic Wave Function
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform sampler2D topologyMap;
      uniform float uTime;
      uniform vec3 uRipples[10];
      uniform float uRippleTimes[10];
      varying float vHeight;
      varying float vWave;
      
      #define PI 3.141592653589793
      vec2 getEquirectangularUV(vec3 p) {
          vec3 n = normalize(p);
          // Match Three.js sphere UV mapping
          float u = 0.5 + atan(n.z, n.x) / (2.0 * PI);
          float v = 0.5 + asin(n.y) / PI;
          return vec2(u, v);
      }
      
      // Spherical Raymarch to check if there is an island blocking the path between origin and current wave front
      float getPathBlockage(vec3 start, vec3 end) {
          float dist = distance(start, end);
          if (dist < 0.2) return 1.0; // Base case, too close to be blocked
          
          float b = 0.0;
          // Sample 4 points across the arc
          for (float i = 0.2; i <= 0.8; i += 0.2) {
              vec3 pStep = normalize(mix(start, end, i)) * 2.0; // Projected back to radius 2.0
              float t = texture2D(topologyMap, getEquirectangularUV(pStep)).r;
              b += step(0.04, t); // accumulation of land hits
          }
          // The more land is crossed, the closer to 0 the multiplier becomes
          return clamp(1.0 - (b * 0.4), 0.0, 1.0);
      }
      
      float getWaterHeight(vec3 p, float time, vec3 mainP) {
          // Ambient ocean bubbly layer
          float w1 = sin(p.x * 6.0 + time * 2.0) * cos(p.y * 6.0 + time * 1.5);
          float w2 = sin(p.y * 12.0 - time * 3.0) * cos(p.z * 12.0 + time * 2.0);
          float baseWave = (w1 * 0.7 + w2 * 0.3) * 0.012; 
          
          // Accumulate interactive click ripples
          float ripple = 0.0;
          for (int i = 0; i < 10; i++) {
              float t = time - uRippleTimes[i];
              // Ripple lives for 10 seconds to allow decay
              if (t > 0.0 && t < 10.0) { 
                   // dist is the actual distance to the wave, evaluating the slope dynamically
                  float dist = distance(p, uRipples[i]);
                  float speed = 1.5; // Ripple expanding speed
                  float currentRadius = t * speed;
                  
                  // Spatial and temporal exponential decay
                  float damping = exp(-dist * 1.5 - t * 0.6);
                  
                  // Limit the wave oscillation strictly to the expanding front region
                  float ringDist = abs(dist - currentRadius);
                  float frontMask = smoothstep(0.4, 0.0, ringDist); 
                  
                  // Optimization & Stability: ONLY run the expensive raymarch if this vertex is actively displaced.
                  // We use mainP for the blockage check so that normal-map finite differences (pT, pB) don't jitter!
                  if (frontMask > 0.01) {
                      float blockageMult = getPathBlockage(uRipples[i], mainP);
                      damping *= blockageMult;
                      
                      // High frequency sin wave forming the ripple - amplitude reduced heavily for extreme subtlety
                      float rWave = sin((dist - currentRadius) * 13.0) * damping * 0.010;
                      ripple += rWave * frontMask;
                  }
              }
          }
          return baseWave + ripple;
      }
      `
    );

    // Recalculate physical normals via analytical neighbours
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `
      #include <beginnormal_vertex>
      
      float topo = texture2D(topologyMap, uv).r;
      float mask = smoothstep(0.01, 0.08, topo);
      
      float waterHeight = 0.0;
      
      // Compute true surface normals only for the water so we don't distort standard land
      // This is crucial for Volumetric lighting reflections!
      if (mask < 0.1) {
          waterHeight = getWaterHeight(position, uTime, position);
          
          float epsilon = 0.01;
          vec3 tmpTangent = cross(vec3(0.0, 1.0, 0.0), position);
          // Avoid singularity (NaN) at the exact North and South poles before normalizing
          if (length(tmpTangent) < 0.001) {
              tmpTangent = cross(vec3(1.0, 0.0, 0.0), position);
          }
          vec3 tangent = normalize(tmpTangent);
          vec3 bitangent = normalize(cross(position, tangent));
          
          // Sample neighbours exactly on the sphere surface shell (radius 2.0)
          vec3 pT = position + tangent * epsilon;
          pT = normalize(pT) * length(position); // Pin to surface
          vec3 pB = position + bitangent * epsilon;
          pB = normalize(pB) * length(position); // Pin to surface
          
          // Re-evaluate wave height at neighbour points using 'position' as macro-blockage anchor to prevent shadow acne!
          float hT = getWaterHeight(pT, uTime, position);
          float hB = getWaterHeight(pB, uTime, position);
          
          // Find actual displaced world points
          vec3 newP = position + normalize(position) * waterHeight;
          vec3 newPT = pT + normalize(pT) * hT;
          vec3 newPB = pB + normalize(pB) * hB;
          
          // Recalculated exact normal of the wave slope
          objectNormal = normalize(cross(newPT - newP, newPB - newP));
      }
      
      vHeight = mask;
      vWave = waterHeight; 
      `
    );

    // Apply exact shape to transformed mesh
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Calculate true extrusion with mask bleeding limits
      // Shoreline damping: (1.0 - smoothstep(0.0, 0.1, vHeight)) prevents water waves from spilling over the land masks
      float finalExtrusion = vHeight * 0.06 + vWave * (1.0 - smoothstep(0.0, 0.1, vHeight));
      
      transformed += normalize(objectNormal) * finalExtrusion;
      `
    );

    // Fragment Shader setup
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying float vHeight;
      varying float vWave;
      `
    );

    // Colorize land and ocean based on extrusion height
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Richer sea blue and greener land colors
      vec3 oceanBase = vec3(0.01, 0.52, 0.78);  // Deeper Sea Blue (#0284c7)
      vec3 waveHighlight = vec3(0.20, 0.75, 0.95); // Cyan highlight for wave peaks
      vec3 landColor = vec3(0.13, 0.77, 0.37);  // Richer Green (#22c55e)
      vec3 edgeColor = vec3(0.98, 0.82, 0.30);  // Sandy beach color (#fcd34d)
      
      vec3 finalColor = oceanBase;
      // Adjusted thresholds for smoother color transitioning on the rounded edges
      if (vHeight > 0.8) {
          finalColor = landColor; 
      } else if (vHeight > 0.1) {
          finalColor = edgeColor; 
      } else {
          // Ocean logic: mix in the wave highlight based on wave height
          // foam intensity scales up as the wave reaches its peak
          float foam = smoothstep(0.0, 0.012, vWave);
          finalColor = mix(oceanBase, waveHighlight, foam);
      }
      
      diffuseColor.rgb = finalColor;
      `
    );
  }, [uniforms]);

  return (
    <mesh
      ref={earthRef}
      receiveShadow
      castShadow
      rotation={[0, -Math.PI / 2, 0]}
      onPointerDown={handlePointerDown}
    >
      {/* High-Poly Sphere to extremely smooth out the surface curves */}
      <sphereGeometry args={[2, 256, 256]} />
      <meshPhysicalMaterial
        roughness={0.02}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.15}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
}

// --- Scene ---
function CartoonScene() {
  const rootRef = useRef<THREE.Group>(null);
  const numClouds = 25;

  const cloudsData = useMemo(() => [...Array(numClouds)].map(() => {
    const randy = Math.random();
    let type: WeatherType = 'white';
    if (randy > 0.7) type = 'dark';
    if (randy > 0.85) type = 'storm';

    let color = '#ffffff';
    if (type === 'white') {
        const cRand = Math.random();
        if (cRand > 0.8) color = '#e0f2fe';       // faint ice blue (ocean reflection)
        else if (cRand > 0.6) color = '#e2e8f0';  // light grey sky tint
        else if (cRand > 0.4) color = '#f8fafc';  // pearl white
    } else if (type === 'dark') {
        color = '#94a3b8';
    } else {
        color = '#334155';
    }

    return {
      speedX: (Math.random() - 0.5) * 0.005,
      speedY: (Math.random() - 0.5) * 0.005,
      scale: 0.4 + Math.random() * 0.5,
      r: 2.3 + Math.random() * 1.5, // brought clouds slightly closer since continents are lower
      type,
      color
    };
  }), []);

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

      {/* Orbiting Clouds with Dynamic Weather */}
      {cloudsData.map((d, i) => (
        <CloudGroup key={i} r={d.r} scale={d.scale} speedX={d.speedX} speedY={d.speedY} type={d.type} color={d.color} />
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