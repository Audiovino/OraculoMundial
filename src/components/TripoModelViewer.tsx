import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

interface TripoModelViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // Center and scale the model so it fits
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

const TripoModelViewer: React.FC<TripoModelViewerProps> = ({ modelUrl }) => {
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
    </div>
  );
};

export default TripoModelViewer;
