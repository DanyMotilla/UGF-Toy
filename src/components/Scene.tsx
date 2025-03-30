import React from 'react';
import { Leva } from 'leva';
import { Canvas } from '@react-three/fiber';
import SDFRenderer from './SDFRenderer.tsx';

export const Scene = () => {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Leva />
            <Canvas
                camera={{ position: [0, 0, 3], fov: 60 }}
                gl={{ antialias: true }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#111111');
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <SDFRenderer />
            </Canvas>
        </div>
    );
};

export default Scene;