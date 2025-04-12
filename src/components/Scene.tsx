import React from 'react';
import { Leva } from 'leva';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import SDFRenderer from './SDFRenderer.tsx';

export const Scene = () => {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Leva />
            <Stats />
            <Canvas
                camera={{ 
                    position: [0, 0, 3],
                    fov: 60,
                    // Lock camera position and rotation
                    rotation: [0, 0, 0],
                    up: [0, 1, 0]
                }}
                gl={{ antialias: true }}
                onCreated={({ gl, camera }) => {
                    gl.setClearColor('#111111');
                    // Disable camera controls
                    camera.rotation.set(0, 0, 0);
                    camera.position.set(0, 0, 3);
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