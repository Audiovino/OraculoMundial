import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

// URL base del índice de modelos (generado una sola vez con generate-and-upload-3d.mjs)
// Los modelos viven en Supabase Storage — nunca se regeneran
const MODELS_INDEX_URL = '/models/models-index.json';

interface TripoModelViewerProps {
  stadiumId: string;
  fallback?: React.ReactNode;
}

// Cache en memoria para el índice (se carga una sola vez por sesión)
let modelsIndexCache: Record<string, string> | null = null;
let modelsIndexPromise: Promise<Record<string, string>> | null = null;

async function getModelsIndex(): Promise<Record<string, string>> {
  if (modelsIndexCache) return modelsIndexCache;
  if (!modelsIndexPromise) {
    modelsIndexPromise = fetch(MODELS_INDEX_URL)
      .then(r => r.json())
      .then(data => { modelsIndexCache = data; return data; })
      .catch(() => {
        modelsIndexPromise = null;
        return {};
      });
  }
  return modelsIndexPromise;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

const TripoModelViewer: React.FC<TripoModelViewerProps> = ({ stadiumId, fallback }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setModelUrl(null);

    getModelsIndex().then(index => {
      if (cancelled) return;
      const url = index[stadiumId];
      if (url) {
        setModelUrl(url);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [stadiumId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Cargando modelo 3D...</span>
        </div>
      </div>
    );
  }

  if (notFound || !modelUrl) {
    return fallback ? <>{fallback}</> : (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <span className="text-xs text-slate-500">Modelo 3D no disponible</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [5, 3, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1} enableDamping />
      </Canvas>
      <div className="absolute bottom-2 right-2 text-[9px] text-slate-600 pointer-events-none">
        Arrastrá para rotar
      </div>
    </div>
  );
};

export default TripoModelViewer;
