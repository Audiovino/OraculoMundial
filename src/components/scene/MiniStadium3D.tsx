import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Stadium } from '../../data/StadiumsData';

interface MiniStadium3DProps {
  stadium: Stadium;
  currentTime?: Date;
  weather?: 'clear' | 'cloudy' | 'rainy' | 'stormy';
  interactive?: boolean;
}

interface TimeOfDay {
  period: 'madrugada' | 'mañana' | 'mediodía' | 'tarde' | 'noche';
  hour: number;
  skyColor: THREE.Color;
  lightIntensity: number;
  ambientIntensity: number;
  sunPosition: { x: number; y: number; z: number };
}

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 0 && hour < 6) {
    return {
      period: 'madrugada',
      hour,
      skyColor: new THREE.Color(0x0a0e27),
      lightIntensity: 0.1,
      ambientIntensity: 0.15,
      sunPosition: { x: 0, y: -5, z: 0 }
    };
  } else if (hour >= 6 && hour < 9) {
    return {
      period: 'mañana',
      hour,
      skyColor: new THREE.Color(0xff9a56),
      lightIntensity: 0.6,
      ambientIntensity: 0.5,
      sunPosition: { x: -8, y: 3, z: 5 }
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      period: 'mañana',
      hour,
      skyColor: new THREE.Color(0x87ceeb),
      lightIntensity: 1.0,
      ambientIntensity: 0.8,
      sunPosition: { x: -5, y: 8, z: 5 }
    };
  } else if (hour >= 12 && hour < 15) {
    return {
      period: 'mediodía',
      hour,
      skyColor: new THREE.Color(0x87ceeb),
      lightIntensity: 1.2,
      ambientIntensity: 1.0,
      sunPosition: { x: 0, y: 10, z: 0 }
    };
  } else if (hour >= 15 && hour < 18) {
    return {
      period: 'tarde',
      hour,
      skyColor: new THREE.Color(0xffa500),
      lightIntensity: 0.8,
      ambientIntensity: 0.7,
      sunPosition: { x: 8, y: 5, z: 5 }
    };
  } else if (hour >= 18 && hour < 21) {
    return {
      period: 'tarde',
      hour,
      skyColor: new THREE.Color(0xff6347),
      lightIntensity: 0.4,
      ambientIntensity: 0.3,
      sunPosition: { x: 10, y: 2, z: 5 }
    };
  } else {
    return {
      period: 'noche',
      hour,
      skyColor: new THREE.Color(0x0a0e27),
      lightIntensity: 0.15,
      ambientIntensity: 0.2,
      sunPosition: { x: 0, y: -5, z: 0 }
    };
  }
};

// Detectar si es móvil
const isMobileDevice = (): boolean => {
  return /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent) || 
         (typeof window !== 'undefined' && window.innerWidth < 768);
};

// Detectar LOD (Level of Detail) según dispositivo
const getLOD = (): 'high' | 'medium' | 'low' => {
  if (isMobileDevice()) {
    return 'low'; // Móvil: geometría simplificada
  }
  if (window.devicePixelRatio > 2) {
    return 'high'; // Retina/High-end
  }
  return 'medium'; // Desktop normal
};

const createStadiumGeometry = (color: string, lod: 'high' | 'medium' | 'low' = 'medium'): THREE.Group => {
  const group = new THREE.Group();
  const stadiumColor = new THREE.Color(color);

  // LOD: Reducir segmentos según dispositivo
  const segments = {
    high: 32,
    medium: 16,
    low: 8
  }[lod];

  // Base del estadio
  const baseGeometry = new THREE.CylinderGeometry(3, 3.5, 0.3, segments);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.7,
    metalness: 0.1
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0;
  group.add(base);

  // Estructura del estadio (anillo)
  const torusSegments = lod === 'low' ? 8 : (lod === 'medium' ? 12 : 16);
  const stadiumGeometry = new THREE.TorusGeometry(2.5, 0.4, torusSegments, 50);
  const stadiumMaterial = new THREE.MeshStandardMaterial({
    color: stadiumColor,
    roughness: 0.5,
    metalness: 0.3
  });
  const stadium = new THREE.Mesh(stadiumGeometry, stadiumMaterial);
  stadium.position.y = 0.5;
  stadium.rotation.x = Math.PI * 0.3;
  group.add(stadium);

  // Gradas (cilindro interior)
  const gradesGeometry = new THREE.CylinderGeometry(2.2, 2.0, 0.8, segments);
  const gradesMaterial = new THREE.MeshStandardMaterial({
    color: stadiumColor,
    roughness: 0.6,
    metalness: 0.2
  });
  const grades = new THREE.Mesh(gradesGeometry, gradesMaterial);
  grades.position.y = 0.6;
  group.add(grades);

  // Cancha
  const fieldGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.05, segments);
  const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.8,
    metalness: 0
  });
  const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
  field.position.y = 1.0;
  group.add(field);

  // Línea central de la cancha
  const lineGeometry = new THREE.PlaneGeometry(3.6, 0.05);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.3
  });
  const line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.position.y = 1.01;
  line.rotation.x = -Math.PI / 2;
  group.add(line);

  // Luces del estadio (reducir en móvil)
  const lightCount = lod === 'low' ? 2 : 4;
  for (let i = 0; i < lightCount; i++) {
    const angle = (i / lightCount) * Math.PI * 2;
    const lightPole = new THREE.Group();

    // Poste
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2, 6);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.5
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.2;
    lightPole.add(pole);

    // Foco (reducir complejidad en móvil)
    const spotSegments = lod === 'low' ? 4 : 8;
    const spotGeometry = new THREE.SphereGeometry(0.15, spotSegments, spotSegments);
    const spotMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff99,
      emissive: 0xffff99,
      emissiveIntensity: 0.5
    });
    const spot = new THREE.Mesh(spotGeometry, spotMaterial);
    spot.position.y = 2.2;
    lightPole.add(spot);

    lightPole.position.x = Math.cos(angle) * 2.8;
    lightPole.position.z = Math.sin(angle) * 2.8;
    group.add(lightPole);
  }

  return group;
};

const MiniStadium3D: React.FC<MiniStadium3DProps> = ({
  stadium,
  currentTime = new Date(),
  weather = 'clear',
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stadiumGroupRef = useRef<THREE.Group | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Get time of day
    const hour = currentTime.getHours();
    const timeOfDay = getTimeOfDay(hour);

    // Background
    scene.background = timeOfDay.skyColor;
    scene.fog = new THREE.Fog(timeOfDay.skyColor, 20, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    
    // Optimizar para móvil: deshabilitar sombras
    const lod = getLOD();
    if (lod !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
    } else {
      renderer.shadowMap.enabled = false;
    }
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, timeOfDay.ambientIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, timeOfDay.lightIntensity);
    directionalLight.position.set(timeOfDay.sunPosition.x, timeOfDay.sunPosition.y, timeOfDay.sunPosition.z);
    
    // Optimizar sombras para móvil
    if (lod !== 'low') {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
    } else {
      directionalLight.castShadow = false;
    }
    
    scene.add(directionalLight);

    // Stadium
    const stadiumGroup = createStadiumGeometry(stadium.color, lod);
    stadiumGroupRef.current = stadiumGroup;
    scene.add(stadiumGroup);

    // Weather effects
    if (weather === 'rainy' || weather === 'stormy') {
      const rainGeometry = new THREE.BufferGeometry();
      const rainCount = weather === 'stormy' ? 1000 : 500;
      const positions = new Float32Array(rainCount * 3);

      for (let i = 0; i < rainCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = Math.random() * 5;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }

      rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.05,
        transparent: true,
        opacity: 0.6
      });
      const rain = new THREE.Points(rainGeometry, rainMaterial);
      scene.add(rain);
    }

    // Mouse interaction
    const onMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (interactive && stadiumGroupRef.current) {
        rotationRef.current.y += (mouseRef.current.x - rotationRef.current.y) * 0.05;
        rotationRef.current.x += (mouseRef.current.y - rotationRef.current.x) * 0.05;

        stadiumGroupRef.current.rotation.y = rotationRef.current.y;
        stadiumGroupRef.current.rotation.x = rotationRef.current.x * 0.3;
      } else if (stadiumGroupRef.current) {
        stadiumGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [stadium, currentTime, weather, interactive]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: interactive ? 'grab' : 'default'
      }}
    />
  );
};

export default MiniStadium3D;
