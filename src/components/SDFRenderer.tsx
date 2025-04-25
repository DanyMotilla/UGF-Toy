import { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { extend, type ThreeElements, useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useGLTF, shaderMaterial, Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { createUniforms } from './shaders/utils/uniforms.ts';
import { createControls } from './controls';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import { ThreeEvent } from '@react-three/fiber';

// Create a custom shader material using @react-three/drei's shaderMaterial
const SDFMaterial = shaderMaterial(
    // Initial uniforms - these will be overridden
    {
        u_time: { value: 0 },
        u_mode: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_cameraPos: { value: new THREE.Vector3() },
        u_mouse_X: { value: 0.0 },
        u_mouse_Y: { value: 0.0 },
        u_rotation_speed: { value: 1.0 },
        u_effectType: { value: 0 },
        u_sdfType: { value: 0 },
        u_scale: { value: 1.0 },
        u_posX: { value: 0.0 },
        u_posY: { value: 0.0 },
        u_posZ: { value: 0.0 },
        u_color: { value: new THREE.Color('#ff69b4') },
        u_thickness: { value: 0.1 },
        u_effectStrength: { value: 0.5 },
        u_contrast: { value: 1.0 },
        u_raymarchSteps: { value: 100 },
        u_raymarchEpsilon: { value: 0.001 }
    },
    // Vertex shader
    vertexShader,
    // Fragment shader
    fragmentShader
);

// Set material properties
SDFMaterial.prototype.side = THREE.DoubleSide;
SDFMaterial.prototype.transparent = true;
SDFMaterial.prototype.depthWrite = true;
SDFMaterial.prototype.depthTest = true;

// Extend R3F with our custom material
extend({ SDFMaterial });

// Add the type declaration for our custom element
declare module '@react-three/fiber' {
    interface ThreeElements {
        sdfMaterial: ThreeElements['shaderMaterial'] & { uniforms?: { [key: string]: THREE.IUniform<any> } }
    }
}

// Main renderer component
const SDFRenderer = () => {
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const controls = useControls(createControls());
    const perspectiveCameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { size, gl } = useThree();

    const [uniforms] = useState(() => {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);
        
        const initialUniforms = createUniforms(controls, {
            width: window.innerWidth,
            height: window.innerHeight
        }, camera);

        // Initialize mode-specific uniforms
        Object.entries(controls).forEach(([key, value]) => {
            const uniformKey = `u_${key}`;
            if (initialUniforms[uniformKey]) {
                if (key === 'mode') {
                    initialUniforms[uniformKey].value = value === 'Raymarching' ? 0 : 1;
                } else if (key === 'effectType') {
                    initialUniforms[uniformKey].value = value === 'Bump' ? 0 : 1;
                } else if (key === 'sdfType') {
                    initialUniforms[uniformKey].value = ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(value as string);
                } else if (key === 'color') {
                    initialUniforms[uniformKey].value.set(value);
                } else {
                    initialUniforms[uniformKey].value = value;
                }
            }
        });

        return initialUniforms;
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setModelUrl(url);
    };

    // Update uniforms based on controls
    useEffect(() => {
        Object.entries(controls).forEach(([key, value]) => {
            const uniformKey = `u_${key}`;
            if (uniforms[uniformKey]) {
                if (key === 'mode') {
                    uniforms[uniformKey].value = value === 'Raymarching' ? 0 : 1;
                } else if (key === 'effectType') {
                    uniforms[uniformKey].value = value === 'Bump' ? 0 : 1;
                } else if (key === 'sdfType') {
                    uniforms[uniformKey].value = ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(value as string);
                } else if (key === 'color') {
                    uniforms[uniformKey].value.set(value);
                } else {
                    uniforms[uniformKey].value = value;
                }
            }
        });
    }, [controls, uniforms]);

    // Update resolution uniform
    useEffect(() => {
        if (uniforms.u_resolution) {
            uniforms.u_resolution.value.set(
                size.width * gl.getPixelRatio(),
                size.height * gl.getPixelRatio()
            );
        }
    }, [size, gl, uniforms]);

    // Update time uniform
    useFrame(({ clock }) => {
        if (uniforms.u_time) {
            uniforms.u_time.value = clock.getElapsedTime();
        }
    });

    return (
        <Suspense fallback={<Html>Loading...</Html>}>
            {controls.mode === 'Mesh' ? (
                <>
                    <PerspectiveCamera ref={perspectiveCameraRef} makeDefault position={[0, 0, 5]} />
                    <OrbitControls makeDefault />
                    <MeshScene url={modelUrl} uniforms={uniforms} />
                    <Html
                        prepend
                        fullscreen
                        style={{
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--leva-colors-elevation2, #1a1a1a)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: 'inset 0 0 0 1px var(--leva-colors-elevation1, #161616)',
                            width: 'calc(100% - 40px)',
                            maxWidth: '380px',
                            margin: '0 auto',
                            fontFamily: 'var(--leva-fonts-mono, system-ui, sans-serif)',
                        }}>
                            <label 
                                htmlFor="model-upload"
                                style={{
                                    color: 'var(--leva-colors-highlight1, #909090)',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'nowrap',
                                    userSelect: 'none',
                                }}
                            >
                                Import Model:
                            </label>
                            <div style={{
                                position: 'relative',
                                flex: 1,
                                background: 'var(--leva-colors-elevation1, #161616)',
                                padding: '2px',
                                borderRadius: '2px',
                            }}>
                                <input 
                                    id="model-upload"
                                    type="file" 
                                    accept=".gltf,.glb"
                                    onChange={handleFileUpload}
                                    style={{
                                        width: '100%',
                                        height: '20px',
                                        padding: '0 6px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--leva-colors-highlight3, #cccccc)',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                    }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    right: '6px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--leva-colors-highlight1, #909090)',
                                    fontSize: '9px',
                                    opacity: 0.5,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}>
                                    .GLTF, .GLB
                                </span>
                            </div>
                        </div>
                    </Html>
                </>
            ) : (
                <RaymarchScene uniforms={uniforms} />
            )}
        </Suspense>
    );
};

// Raymarching mode component
const RaymarchScene = ({ uniforms }: { uniforms: { [key: string]: THREE.IUniform<any> } }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previousMouseX, setPreviousMouseX] = useState(0);
    const [previousMouseY, setPreviousMouseY] = useState(0);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);

    const material = useMemo(() => {
        const mat = new SDFMaterial();
        mat.uniforms = uniforms;
        materialRef.current = mat;
        return mat;
    }, [uniforms]);

    useEffect(() => {
        const handleGlobalPointerMove = (event: PointerEvent) => {
            if (isDragging && materialRef.current) {
                const sensitivity = 0.01;
                const deltaX = (event.clientX - previousMouseX) * sensitivity;
                const deltaY = (event.clientY - previousMouseY) * sensitivity;

                const uniforms = materialRef.current.uniforms;
                if (uniforms.u_mouse_X && uniforms.u_mouse_Y) {
                    uniforms.u_mouse_X.value += deltaX;
                    uniforms.u_mouse_Y.value += deltaY;
                }

                setPreviousMouseX(event.clientX);
                setPreviousMouseY(event.clientY);
            }
        };

        const handleGlobalPointerUp = () => {
            setIsDragging(false);
        };

        // Add window-level listeners when dragging starts
        if (isDragging) {
            window.addEventListener('pointermove', handleGlobalPointerMove);
            window.addEventListener('pointerup', handleGlobalPointerUp);
            window.addEventListener('pointercancel', handleGlobalPointerUp);
        }

        // Cleanup listeners
        return () => {
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            window.removeEventListener('pointerup', handleGlobalPointerUp);
            window.removeEventListener('pointercancel', handleGlobalPointerUp);
        };
    }, [isDragging, previousMouseX, previousMouseY]);

    const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
        const target = event.target as HTMLElement;
        if (target) {
            target.setPointerCapture(event.pointerId);
        }
        setIsDragging(true);
        setPreviousMouseX(event.clientX);
        setPreviousMouseY(event.clientY);
    };

    const handlePointerMove = () => {};

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    // Create a full-screen quad for raymarching
    return (
        <mesh 
            position={[0, 0, -1]}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <planeGeometry args={[10, 10]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};

// Mesh mode component
const MeshScene = ({ url, uniforms }: { url?: string | null; uniforms: { [key: string]: THREE.IUniform<any> } }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const material = useMemo(() => {
        const mat = new SDFMaterial();
        mat.uniforms = uniforms;
        return mat;
    }, [uniforms]);

    // Update material uniforms when they change
    useEffect(() => {
        material.uniforms = uniforms;
    }, [uniforms, material]);

    if (url) {
        const { nodes } = useGLTF(url);
        const meshes = Object.values(nodes).filter((node): node is THREE.Mesh => node instanceof THREE.Mesh);
        
        return (
            <group>
                {meshes.map((mesh: THREE.Mesh, index: number) => (
                    <mesh 
                        key={index}
                        geometry={mesh.geometry}
                        position={mesh.position}
                        rotation={mesh.rotation}
                        scale={mesh.scale}
                    >
                        <primitive object={material} attach="material" />
                    </mesh>
                ))}
            </group>
        );
    }

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 128, 128]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};

export { SDFRenderer };
export default SDFRenderer;