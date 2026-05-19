import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SoccerBall3D: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const innerBallRef = useRef<THREE.Mesh>(null);
    const outerWireframeRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Auto-spin base
        groupRef.current.rotation.y += delta * 0.2;
        groupRef.current.rotation.x += delta * 0.1;

        // Interaction based on page scroll
        const scrollY = window.scrollY;
        // Approximation of max scroll
        const maxScroll = Math.max(1000, document.documentElement.scrollHeight - window.innerHeight);
        const scrollProgress = scrollY / maxScroll;

        // Lerp position (Moves down and slightly right as we scroll)
        const targetY = -scrollProgress * 3; // Moves 3 units down max
        const targetX = scrollProgress * 2;  // Moves 2 units right max
        const targetZ = scrollProgress * 1;  // Comes slightly closer
        
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
        
        // Add extra rotation spin from scroll
        groupRef.current.rotation.z = scrollProgress * Math.PI * 4;
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Inner glowing core */}
            <mesh ref={innerBallRef}>
                <icosahedronGeometry args={[1.5, 2]} />
                <meshStandardMaterial 
                    color="#0f172a" 
                    emissive="#1e3a8a"
                    emissiveIntensity={0.6}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Outer tech wireframe */}
            <mesh ref={outerWireframeRef} scale={1.01}>
                <icosahedronGeometry args={[1.5, 2]} />
                <meshBasicMaterial 
                    color="#38bdf8" 
                    wireframe 
                    transparent 
                    opacity={0.4} 
                />
            </mesh>
            
            {/* Dynamic Energy Light */}
            <pointLight color="#60a5fa" intensity={2} distance={8} />
        </group>
    );
};
