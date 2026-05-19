# Plan de Optimización - OraculoMundial (Móvil)

## Estado Actual
- **Bundle size**: 1.1MB (gzip: 305KB)
- **Problema principal**: 14 stadiums 3D renderizándose simultáneamente
- **Impacto**: Carga lenta en móvil, alto consumo de CPU/GPU

---

## 5 Estrategias de Optimización (Ordenadas por Impacto)

### 1. **Lazy Loading de Componentes 3D + Code Splitting** ⭐⭐⭐⭐⭐
**Impacto**: 40-50% reducción en tiempo de carga inicial  
**Complejidad**: Media  
**Tiempo**: 2-3 horas

#### Problema
- Todos los 14 stadiums se cargan en el bundle inicial
- Cada stadium tiene su propio Three.js renderer (14 WebGL contexts)
- Los usuarios solo ven 1-2 stadiums a la vez en móvil

#### Solución
```typescript
// 1. Lazy load el componente MundialGame
const MundialGame = React.lazy(() => import('./components/MundialGame'));

// 2. En MundialGame.tsx - Lazy load stadiums por demanda
const MiniStadium3D = React.lazy(() => import('./components/scene/MiniStadium3D'));

// 3. Usar Intersection Observer para renderizar solo stadiums visibles
const useVisibleStadium = (ref: RefObject<HTMLDivElement>) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return isVisible;
};

// 4. En el render de cada stadium
{isVisible && (
  <Suspense fallback={<div className="w-full h-full bg-slate-800 animate-pulse" />}>
    <MiniStadium3D stadium={stadium} />
  </Suspense>
)}
```

#### Librerías
- `react-intersection-observer` - Detectar visibilidad
- `@loadable/component` - Code splitting avanzado

#### Resultado esperado
- Carga inicial: 305KB → 150KB (gzip)
- TTI (Time to Interactive): 3s → 1.2s en móvil

---

### 2. **Reducir Complejidad de Geometría 3D (LOD - Level of Detail)** ⭐⭐⭐⭐
**Impacto**: 30-40% reducción en renderizado  
**Complejidad**: Media-Alta  
**Tiempo**: 3-4 horas

#### Problema
- Cada stadium usa `CylinderGeometry(32, 32)` - 32 segmentos
- Cada luz tiene `SphereGeometry(8, 8)` - 64 triángulos
- En móvil, esto es excesivo

#### Solución
```typescript
// Crear versiones LOD de la geometría
const createStadiumGeometry = (color: string, lod: 'high' | 'medium' | 'low'): THREE.Group => {
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
  // ... resto del código

  return group;
};

// Detectar LOD según dispositivo
const getLOD = (): 'high' | 'medium' | 'low' => {
  if (/mobile|android|iphone/i.test(navigator.userAgent)) {
    return 'low'; // Móvil
  }
  if (window.devicePixelRatio > 2) {
    return 'high'; // Retina/High-end
  }
  return 'medium'; // Desktop normal
};

// Usar en componente
const lod = getLOD();
const stadiumGroup = createStadiumGeometry(stadium.color, lod);
```

#### Librerías
- `three/examples/jsm/utils/BufferGeometryUtils` - Merge geometries

#### Resultado esperado
- Triángulos renderizados: 50K → 15K
- FPS en móvil: 15-20 → 45-60

---

### 3. **Optimizar Shaders y Materiales** ⭐⭐⭐⭐
**Impacto**: 25-35% reducción en GPU load  
**Complejidad**: Alta  
**Tiempo**: 4-5 horas

#### Problema
- Shader del balón 3D es muy complejo (12 vértices icosaedro en fragment shader)
- Cada stadium usa `MeshStandardMaterial` con sombras
- `shadowMap.type = THREE.PCFShadowMap` es costoso en móvil

#### Solución
```typescript
// 1. Simplificar shader del balón
const soccerBallMaterial = new THREE.ShaderMaterial({
  uniforms: {
    light1Pos: { value: new THREE.Vector3(5, 5, 2).normalize() },
    light1Color: { value: new THREE.Color(0x38bdf8) }
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    uniform vec3 light1Pos;
    uniform vec3 light1Color;
    
    void main() {
      float diff = max(dot(vNormal, light1Pos), 0.0);
      vec3 color = mix(vec3(0.96), vec3(0.08), step(0.5, diff));
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

// 2. Usar BasicMaterial en móvil (sin sombras)
const isMobile = /mobile|android|iphone/i.test(navigator.userAgent);
const stadiumMaterial = isMobile 
  ? new THREE.MeshPhongMaterial({ color: stadiumColor })
  : new THREE.MeshStandardMaterial({ color: stadiumColor });

// 3. Deshabilitar sombras en móvil
if (isMobile) {
  directionalLight.castShadow = false;
  renderer.shadowMap.enabled = false;
}
```

#### Librerías
- `three/examples/jsm/shaders/ShaderLib` - Shaders optimizados

#### Resultado esperado
- GPU load: 80% → 40%
- Shader compilation time: 200ms → 50ms

---

### 4. **Defer Rendering No Crítico + RequestIdleCallback** ⭐⭐⭐
**Impacto**: 20-30% mejora en TTI  
**Complejidad**: Baja-Media  
**Tiempo**: 1-2 horas

#### Problema
- Framer Motion anima 5 componentes simultáneamente en el header
- Todas las animaciones se ejecutan en el main thread
- Bloquea el renderizado de stadiums

#### Solución
```typescript
// 1. Defer animaciones no críticas
const useIdleAnimation = (callback: () => void) => {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 100);
      return () => clearTimeout(id);
    }
  }, [callback]);
};

// 2. Lazy load animaciones del header
const AnimatedBicycleKick = React.lazy(() => 
  import('./components/AnimatedBicycleKick')
);

// 3. Usar will-change CSS para optimizar
const animatedStyle = {
  willChange: 'transform',
  transform: 'translateZ(0)' // Force GPU acceleration
};

// 4. Reducir Framer Motion complexity
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }} // Reducir duración
  style={animatedStyle}
>
  {children}
</motion.div>
```

#### Librerías
- `react-use-idle-callback` - Wrapper para requestIdleCallback

#### Resultado esperado
- TTI: 1.2s → 0.8s
- Main thread blocking: 300ms → 100ms

---

### 5. **Optimizar Bundle de Dependencias** ⭐⭐⭐
**Impacto**: 15-25% reducción en bundle size  
**Complejidad**: Baja  
**Tiempo**: 1-2 horas

#### Problema
- Three.js: 600KB (sin gzip)
- Framer Motion: 50KB
- Supabase: 80KB
- Lucide Icons: 40KB

#### Solución
```bash
# 1. Analizar bundle
npm install -D webpack-bundle-analyzer
npx vite-plugin-visualizer

# 2. Tree-shake Three.js
# En vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'vendor': ['framer-motion', 'supabase']
        }
      }
    }
  }
}

# 3. Usar dynamic imports
const THREE = await import('three');

# 4. Reemplazar Lucide con SVG inline
# Lucide: 40KB → SVG inline: 2KB
```

#### Librerías
- `vite-plugin-visualizer` - Visualizar bundle
- `@vitejs/plugin-dynamic-import-vars` - Dynamic imports

#### Resultado esperado
- Bundle size: 305KB → 220KB (gzip)
- Carga inicial: 1.5s → 0.9s

---

## Plan de Implementación (Orden Recomendado)

### Fase 1: Rápida (1-2 horas) - Máximo impacto
1. ✅ Lazy load stadiums con Intersection Observer
2. ✅ Deshabilitar sombras en móvil
3. ✅ Reducir segmentos de geometría en móvil

### Fase 2: Media (2-3 horas)
4. ✅ Defer animaciones del header
5. ✅ Code splitting de componentes

### Fase 3: Completa (4-5 horas)
6. ✅ Optimizar shaders
7. ✅ Analizar y tree-shake bundle

---

## Métricas de Éxito

| Métrica | Antes | Después | Meta |
|---------|-------|---------|------|
| Bundle (gzip) | 305KB | 220KB | <250KB |
| TTI (móvil) | 3.0s | 0.8s | <1.5s |
| FCP (móvil) | 2.5s | 0.6s | <1.2s |
| FPS (móvil) | 15-20 | 45-60 | >30 |
| GPU Load | 80% | 40% | <50% |

---

## Próximos Pasos

1. Implementar Fase 1 (rápida)
2. Medir con Lighthouse
3. Implementar Fase 2
4. Medir nuevamente
5. Decidir si continuar con Fase 3

**Estimado total**: 6-8 horas para todas las fases
