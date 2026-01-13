import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LLMRecord } from '../types';

interface GalaxySceneProps {
  diaries: LLMRecord[];
  rotationSpeed: number;
  cameraAngle: number;
  onDiaryClick?: (diary: LLMRecord) => void;
}

// Diary Star Component with sparkles
function DiaryStar({ 
  diary, 
  position,
  onClick
}: { 
  diary: LLMRecord; 
  position: [number, number, number];
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const baseY = position[1];
  
  // Sparkle particles around the star - more sparkles for better glow
  const sparkles = useMemo(() => {
    const SPARKLE_COUNT = 12; // Increased from 6
    const sparklePositions = new Float32Array(SPARKLE_COUNT * 3);
    const sparkleColors = new Float32Array(SPARKLE_COUNT * 3);
    const color = new THREE.Color(diary.emotionColor || '#ffffff');
    
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const angle = (i / SPARKLE_COUNT) * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.4;
      sparklePositions[i * 3] = Math.cos(angle) * radius;
      sparklePositions[i * 3 + 1] = Math.sin(angle) * radius;
      sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      
      sparkleColors[i * 3] = color.r;
      sparkleColors[i * 3 + 1] = color.g;
      sparkleColors[i * 3 + 2] = color.b;
    }
    
    return { positions: sparklePositions, colors: sparkleColors };
  }, [diary.emotionColor]);
  
  // Animate star bobbing, rotation, and pulsing glow
  useFrame((state) => {
    if (groupRef.current && starRef.current) {
      const time = state.clock.elapsedTime;
      // Bobbing animation
      groupRef.current.position.y = baseY + Math.sin(time * 1.5 + position[0]) * 0.15;
      // Star rotation
      starRef.current.rotation.x = time * 0.2;
      starRef.current.rotation.y = time * 0.4;
      
      // Pulsing glow effect
      const pulse = Math.sin(time * 2) * 0.3 + 1; // Pulse between 0.7 and 1.3
      if (starRef.current.material) {
        (starRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 3.5 * pulse;
      }
      
      // Pulse the glow halo
      if (glowRef.current) {
        const scale = 1 + Math.sin(time * 2.5) * 0.2;
        glowRef.current.scale.set(scale, scale, scale);
        if (glowRef.current.material) {
          (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(time * 2) * 0.2;
        }
      }
      
      // Pulse the point light
      if (lightRef.current) {
        lightRef.current.intensity = 2 * pulse;
      }
    }
  });
  
  const emotionColor = diary.emotionColor || '#ffffff';
  
  return (
    <group ref={groupRef} position={position}>
      {/* Outer glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={emotionColor}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Sparkle particles - enhanced */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[sparkles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors={true}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Main star sphere - clickable */}
      <mesh 
        ref={starRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={emotionColor}
          emissive={emotionColor}
          emissiveIntensity={3.5}
          roughness={0.1}
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>
      
      {/* Point light for glow - enhanced */}
      <pointLight 
        ref={lightRef}
        color={emotionColor} 
        intensity={2} 
        distance={3} 
        decay={1.5} 
      />
    </group>
  );
}

// Fog Plane Component - circular plate that covers the galaxy
function FogPlane() {
  // Galaxy radius is approximately 25 units, so make the fog circle cover that area
  const galaxyRadius = 25;
  const fogRadius = galaxyRadius * 1.5; // Slightly larger than galaxy
  
  return (
    <mesh 
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]} // Horizontal plane (flat, facing up)
    >
      <circleGeometry args={[fogRadius, 64]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function GalaxyScene({ diaries, rotationSpeed, cameraAngle, onDiaryClick }: GalaxySceneProps) {
  const galaxyRef = useRef<THREE.InstancedMesh>(null);
  const galaxyGroupRef = useRef<THREE.Group>(null);
  const starFieldRef = useRef<THREE.Points>(null);
  const diaryStarsGroupRef = useRef<THREE.Group>(null);
  const galaxyMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Create background starfield
  const starField = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  // Seeded random function for consistent positions based on diary ID
  const seededRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return () => {
      hash = ((hash * 9301) + 49297) % 233280;
      return hash / 233280;
    };
  };

  // Calculate diary star positions - stable based on diary ID (stored in ref to persist)
  const positionsMapRef = useRef<Map<string, [number, number, number]>>(new Map());
  
  // Helper function to calculate distance between two 3D points
  const distance3D = (pos1: [number, number, number], pos2: [number, number, number]): number => {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };
  
  // Check if a position is too close to existing positions
  const isPositionValid = (
    newPos: [number, number, number], 
    existingPositions: [number, number, number][],
    minDistance: number
  ): boolean => {
    for (const existingPos of existingPositions) {
      if (distance3D(newPos, existingPos) < minDistance) {
        return false;
      }
    }
    return true;
  };
  
  const diaryPositions = useMemo(() => {
    const MIN_DISTANCE = 2.5; // Minimum distance between stars (adjust based on star size)
    const MAX_ATTEMPTS = 50; // Maximum attempts to find a valid position
    
    // Get all existing positions
    const existingPositions: [number, number, number][] = Array.from(positionsMapRef.current.values());
    
    // Calculate positions for new diaries only
    diaries.forEach((diary) => {
      if (!positionsMapRef.current.has(diary.id)) {
        const random = seededRandom(diary.id);
        let attempts = 0;
        let validPosition: [number, number, number] | null = null;
        
        // Try to find a valid position that doesn't overlap
        while (attempts < MAX_ATTEMPTS && !validPosition) {
          // Generate a candidate position
          const radius = 8 + random() * 12;
          const spinAngle = radius * 0.2;
          const branchAngle = (random() * 2 * Math.PI);
          
          const randomX = (random() - 0.5) * 0.8;
          const randomY = (random() - 0.5) * 0.6;
          const randomZ = (random() - 0.5) * 0.8;
          
          const candidatePos: [number, number, number] = [
            Math.cos(branchAngle + spinAngle) * radius + randomX,
            randomY,
            Math.sin(branchAngle + spinAngle) * radius + randomZ,
          ];
          
          // Check if this position is valid (not too close to existing stars)
          if (isPositionValid(candidatePos, existingPositions, MIN_DISTANCE)) {
            validPosition = candidatePos;
          } else {
            attempts++;
            // Add some variation to the random seed for next attempt
            random();
          }
        }
        
        // If we found a valid position, use it; otherwise use the last generated position
        if (validPosition) {
          positionsMapRef.current.set(diary.id, validPosition);
          existingPositions.push(validPosition); // Add to existing for next diary
        } else {
          // Fallback: use the last generated position even if it overlaps slightly
          const radius = 8 + random() * 12;
          const spinAngle = radius * 0.2;
          const branchAngle = (random() * 2 * Math.PI);
          const randomX = (random() - 0.5) * 0.8;
          const randomY = (random() - 0.5) * 0.6;
          const randomZ = (random() - 0.5) * 0.8;
          const fallbackPos: [number, number, number] = [
            Math.cos(branchAngle + spinAngle) * radius + randomX,
            randomY,
            Math.sin(branchAngle + spinAngle) * radius + randomZ,
          ];
          positionsMapRef.current.set(diary.id, fallbackPos);
          existingPositions.push(fallbackPos);
        }
      }
    });
    
    // Remove positions for diaries that no longer exist
    const currentIds = new Set(diaries.map(d => d.id));
    for (const id of positionsMapRef.current.keys()) {
      if (!currentIds.has(id)) {
        positionsMapRef.current.delete(id);
      }
    }
    
    // Return positions in the same order as diaries array
    return diaries.map(diary => positionsMapRef.current.get(diary.id)!);
  }, [diaries]);

  // Create glowing materials with custom texture
  const starMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
      color: '#ffffff',
      transparent: true,
      opacity: 1,
    });
  }, []);

  // Create instanced mesh data for galaxy particles
  const galaxyInstances = useMemo(() => {
    const count = 2000;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const colorInside = new THREE.Color('#fffef8'); // Warm cream - slightly off-white
    const colorOutside = new THREE.Color('#7dd3fc');
    
    // Create matrices for each instance
    const matrices: THREE.Matrix4[] = [];
    const instanceColors: THREE.Color[] = [];
    
    for (let i = 0; i < count; i++) {
      // Spiral Galaxy Distribution
      const radius = Math.random() * 25;
      const spinAngle = radius * 0.8;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      
      const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
      const y = (Math.random() - 0.5) * 2 + randomY;
      const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      // Create matrix for this instance
      const instanceMatrix = new THREE.Matrix4();
      instanceMatrix.setPosition(x, y, z);
      matrices.push(instanceMatrix);
      
      // Color mix based on radius with intensity for glow
      const mixedColor = colorInside.clone().lerp(colorOutside, radius / 20);
      const intensity = 2.0 + Math.random() * 2.0;
      mixedColor.multiplyScalar(intensity);
      instanceColors.push(mixedColor);
    }
    
    return { matrices, colors: instanceColors, count };
  }, []);

  // Initialize instanced mesh matrices
  useEffect(() => {
    if (galaxyRef.current && galaxyInstances) {
      const scale = 0.05;
      const scaleVector = new THREE.Vector3(scale, scale, scale);
      const matrix = new THREE.Matrix4();
      for (let i = 0; i < galaxyInstances.count; i++) {
        matrix.copy(galaxyInstances.matrices[i]);
        matrix.scale(scaleVector);
        galaxyRef.current.setMatrixAt(i, matrix);
      }
      galaxyRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [galaxyInstances]);

  const galaxyGeometry = useMemo(() => {
    return new THREE.SphereGeometry(1, 16, 16);
  }, []);

  const galaxyMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 1,
      roughness: 0.1,
      metalness: 0.5,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    galaxyMaterialRef.current = material;
    return material;
  }, []);

  // Rotate galaxy, diary stars, and background starfield together based on drag input
  // Also animate particle glow effect
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Rotate galaxy group (includes particles and fog)
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y += rotationSpeed * delta;
    }
    // Rotate diary stars group with the same speed as galaxy
    if (diaryStarsGroupRef.current) {
      diaryStarsGroupRef.current.rotation.y += rotationSpeed * delta;
    }
    // Rotate background starfield - slower rotation for parallax effect
    if (starFieldRef.current) {
      starFieldRef.current.rotation.y += rotationSpeed * delta * 0.3; // 30% speed for subtle parallax
    }
    
    // Pulse galaxy particles for glow effect (much smaller than diary stars)
    if (
      galaxyMaterialRef.current && 
      galaxyRef.current && 
      galaxyInstances &&
      typeof galaxyRef.current.setMatrixAt === 'function'
    ) {
      try {
        // Subtle pulsing - smaller variation than diary stars
        const pulse = Math.sin(time * 1.5) * 0.15 + 1; // Pulse between 0.85 and 1.15
        galaxyMaterialRef.current.emissiveIntensity = 1.5 * pulse;
        // Slight opacity variation for shimmer effect
        galaxyMaterialRef.current.opacity = 0.8 + Math.sin(time * 1.2) * 0.2;
        
        // Update instance scales for pulsing effect
        const scale = 0.05 * pulse; // Small spheres
        const scaleVector = new THREE.Vector3(scale, scale, scale);
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < galaxyInstances.count; i++) {
          matrix.copy(galaxyInstances.matrices[i]);
          matrix.scale(scaleVector);
          galaxyRef.current.setMatrixAt(i, matrix);
        }
        galaxyRef.current.instanceMatrix.needsUpdate = true;
      } catch (error) {
        // Silently ignore if instanced mesh isn't ready yet
        console.warn('Galaxy particles update skipped:', error);
      }
    }
  });

  return (
    <>
      {/* Background starfield */}
      <points ref={starFieldRef} material={starMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starField, 3]}
          />
        </bufferGeometry>
      </points>

      {/* Galaxy group - particles and fog rotate together */}
      <group ref={galaxyGroupRef}>
        {/* Main galaxy particles as spheres */}
        <instancedMesh
          ref={galaxyRef}
          args={[galaxyGeometry, galaxyMaterial, galaxyInstances.count]}
        />

        {/* Fog - circular plate covering the galaxy */}
        {/* <FogPlane /> */}
      </group>

      {/* Diary stars as 3D spheres - grouped to rotate with galaxy */}
      <group ref={diaryStarsGroupRef}>
        {diaries.map((diary, index) => (
          <DiaryStar
            key={diary.id}
            diary={diary}
            position={diaryPositions[index]}
            onClick={() => onDiaryClick?.(diary)}
          />
        ))}
      </group>
    </>
  );
}
