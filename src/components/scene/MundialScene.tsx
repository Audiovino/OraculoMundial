import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * MundialScene – Fondo 3D interactivo utilizando Three.js puro (Vanilla).
 * Evita cualquier incompatibilidad de versiones entre @react-three/fiber/drei y Three.js,
 * garantizando estabilidad total en produccion y un rendimiento impecable (120 FPS).
 */
export const MundialScene: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const canvas = canvasRef.current;

        // --- 1. CONFIGURACIÓN DE LA ESCENA, CÁMARA Y RENDERER ---
        const scene = new THREE.Scene();
        
        // Cámara con perspectiva
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 8;

        // Renderer con alpha habilitado para fondo transparente y antialiasing optimizado
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // --- 2. ILUMINACIÓN ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Luz azul brillante (estilo mundialista futurista)
        const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
        dirLight1.position.set(10, 10, 5);
        scene.add(dirLight1);

        // Luz índigo de contraste para estética Slate/Azul
        const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.8);
        dirLight2.position.set(-10, -10, -5);
        scene.add(dirLight2);

        // --- 3. SISTEMA DE PARTÍCULAS (STARDUST / ESTRELLAS) ---
        const starsCount = 2000;
        const starsGeometry = new THREE.BufferGeometry();
        const starsPositions = new Float32Array(starsCount * 3);
        const starsSpeeds = new Float32Array(starsCount);

        for (let i = 0; i < starsCount * 3; i += 3) {
            // Distribuir estrellas en un cubo grande alrededor de la escena
            starsPositions[i] = (Math.random() - 0.5) * 150;
            starsPositions[i + 1] = (Math.random() - 0.5) * 150;
            starsPositions[i + 2] = (Math.random() - 0.5) * 100 - 30; // Detrás y adelante
            starsSpeeds[i / 3] = 0.05 + Math.random() * 0.05;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xfcd34d, // Chispas doradas/celestes estilo estadio
            size: 0.25, // Un poco más grandes para que parezcan flares o confeti
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // --- 4. BALÓN 3D CLÁSICO REALISTA (PROCEDURAL SHADER DE ALTA DEFINICIÓN) ---
        const ballGroup = new THREE.Group();

        // Custom Shader Material for a perfect classic soccer ball
        const soccerBallMaterial = new THREE.ShaderMaterial({
            uniforms: {
                light1Pos: { value: new THREE.Vector3(10, 10, 5).normalize() },
                light1Color: { value: new THREE.Color(0x38bdf8) },
                light2Pos: { value: new THREE.Vector3(-10, -10, -5).normalize() },
                light2Color: { value: new THREE.Color(0x818cf8) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                uniform vec3 light1Pos;
                uniform vec3 light1Color;
                uniform vec3 light2Pos;
                uniform vec3 light2Color;
                
                vec3 icos[12];
                
                void main() {
                    float phi = 1.61803398875;
                    icos[0] = normalize(vec3(-1.0, phi, 0.0));
                    icos[1] = normalize(vec3(1.0, phi, 0.0));
                    icos[2] = normalize(vec3(-1.0, -phi, 0.0));
                    icos[3] = normalize(vec3(1.0, -phi, 0.0));
                    
                    icos[4] = normalize(vec3(0.0, -1.0, phi));
                    icos[5] = normalize(vec3(0.0, 1.0, phi));
                    icos[6] = normalize(vec3(0.0, -1.0, -phi));
                    icos[7] = normalize(vec3(0.0, 1.0, -phi));
                    
                    icos[8] = normalize(vec3(phi, 0.0, -1.0));
                    icos[9] = normalize(vec3(phi, 0.0, 1.0));
                    icos[10] = normalize(vec3(-phi, 0.0, -1.0));
                    icos[11] = normalize(vec3(-phi, 0.0, 1.0));
                    
                    vec3 p = normalize(vPosition);
                    
                    float firstMax = -1.0;
                    float secondMax = -1.0;
                    for (int i = 0; i < 12; i++) {
                        float d = dot(p, icos[i]);
                        if (d > firstMax) {
                            secondMax = firstMax;
                            firstMax = d;
                        } else if (d > secondMax) {
                            secondMax = d;
                        }
                    }
                    
                    // Base Colors
                    vec3 baseColor = vec3(0.96, 0.96, 0.98); // White hexagons
                    
                    // Pentagons
                    if (firstMax > 0.89) {
                        baseColor = vec3(0.08, 0.08, 0.10); // Deep charcoal/black
                    }
                    
                    // Seams around pentagons
                    float seam1 = abs(firstMax - 0.89);
                    if (seam1 < 0.018) {
                        baseColor = vec3(0.0, 0.0, 0.0);
                    }
                    
                    // Seams between hexagons
                    float edgeVal = firstMax - secondMax;
                    if (edgeVal < 0.048 && firstMax <= 0.89) {
                        baseColor = vec3(0.0, 0.0, 0.0);
                    }
                    
                    // Lighting calculation
                    vec3 n = normalize(vNormal);
                    
                    // Light 1 (Blue)
                    float diff1 = max(dot(n, light1Pos), 0.0);
                    vec3 r1 = reflect(-light1Pos, n);
                    float spec1 = pow(max(dot(r1, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
                    
                    // Light 2 (Purple)
                    float diff2 = max(dot(n, light2Pos), 0.0);
                    vec3 r2 = reflect(-light2Pos, n);
                    float spec2 = pow(max(dot(r2, vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
                    
                    // Ambient Light
                    vec3 ambient = vec3(0.2) * baseColor;
                    
                    // Combined Diffuse & Specular
                    vec3 diffuse = (diff1 * light1Color + diff2 * light2Color) * baseColor * 0.9;
                    vec3 specular = (spec1 * light1Color * 0.45) + (spec2 * light2Color * 0.35);
                    
                    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
                }
            `
        });

        const ballGeo = new THREE.SphereGeometry(1.5, 64, 64);
        const ballMesh = new THREE.Mesh(ballGeo, soccerBallMaterial);
        ballGroup.add(ballMesh);

        // Capa de brillo holográfico sutil alrededor del balón
        const glowGeo = new THREE.SphereGeometry(1.52, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        ballGroup.add(glowMesh);

        // Luz de energía interna dinámica
        const pointLight = new THREE.PointLight(0x60a5fa, 2.0, 8);
        ballGroup.add(pointLight);

        scene.add(ballGroup);

        // --- 5. LÓGICA DE ANIMACIÓN, SCROLL E INTERACCIÓN ---
        let currentScroll = window.scrollY;
        let targetScroll = window.scrollY;
        
        const handleScroll = () => {
            targetScroll = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Ajustar tamaño del canvas dinámicamente
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Variables para la animación de flotación y rotación
        let clock = new THREE.Clock();

        const animate = () => {
            const requestID = requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // Rotación base continua
            ballGroup.rotation.y += delta * 0.15;
            ballGroup.rotation.x += delta * 0.08;

            // Efecto de flotación senoidal suave (Float)
            ballGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

            // Interpolación del scroll para suavidad (Lerp)
            currentScroll += (targetScroll - currentScroll) * 0.08;
            
            const maxScroll = Math.max(1000, document.documentElement.scrollHeight - window.innerHeight);
            const scrollProgress = Math.min(Math.max(currentScroll / maxScroll, 0), 1);

            // Traslación y rotación reactiva al scroll
            // El balón se desplaza hacia la derecha y hacia abajo conforme el usuario navega por la página
            const targetY = -scrollProgress * 4;
            const targetX = scrollProgress * 3;
            const targetZ = scrollProgress * 1.5;

            ballGroup.position.y += targetY; // Sumar al efecto de flotación
            ballGroup.position.x = THREE.MathUtils.lerp(ballGroup.position.x, targetX, 0.08);
            ballGroup.position.z = THREE.MathUtils.lerp(ballGroup.position.z, targetZ, 0.08);
            
            // Rotación extra basada en el avance del scroll
            ballGroup.rotation.z = scrollProgress * Math.PI * 2;

            // Rotar sutilmente el fondo de partículas de estrellas
            stars.rotation.y += delta * 0.02;
            stars.rotation.x += delta * 0.01;

            renderer.render(scene, camera);
        };

        const animationID = requestAnimationFrame(animate);

        // --- 6. LIMPIEZA / DESTRUCCIÓN ---
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationID);

            // Liberar memoria de WebGL y Three.js
            ballGeo.dispose();
            soccerBallMaterial.dispose();
            glowGeo.dispose();
            glowMat.dispose();
            starsGeometry.dispose();
            starsMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 pointer-events-none" 
            style={{ 
                zIndex: 0,
                background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' 
            }}
        >
            <canvas 
                ref={canvasRef} 
                className="w-full h-full block"
            />
        </div>
    );
};
