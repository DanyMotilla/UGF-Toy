import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

function Sphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
}

function ControlsPanel() {
    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            zIndex: 100
        }}>
            <h3 style={{ marginTop: 0 }}>Controls</h3>
            <div style={{ marginBottom: '10px' }}>
                <label>
                    Rotation Speed:
                    <input type="range" min="0" max="0.1" step="0.001" defaultValue="0.01" />
                </label>
            </div>
            <div>
                <label>
                    Color:
                    <input type="color" defaultValue="#ff69b4" />
                </label>
            </div>
        </div>
    );
}

export default function Scene() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{ position: [0, 0, 3] }}
                gl={{ antialias: true }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#111111');
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <Sphere />
            </Canvas>
            <ControlsPanel />
        </div>
    );
}