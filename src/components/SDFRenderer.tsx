import { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend, type ThreeElements } from '@react-three/fiber';
import { useControls } from 'leva';
import { useGLTF, shaderMaterial, Html } from '@react-three/drei';
import { createUniforms } from './shaders/utils/uniforms.ts';
import { createControls } from './controls';
import { Controls } from './types';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

// Create a custom shader material using @react-three/drei's shaderMaterial
const CustomMaterial = shaderMaterial(
    // Initial uniforms - these will be overridden
    {},
    // Vertex shader
    vertexShader,
    // Fragment shader
    fragmentShader
);

// Set material properties
CustomMaterial.prototype.side = THREE.DoubleSide;
CustomMaterial.prototype.transparent = true;
CustomMaterial.prototype.depthWrite = false;
CustomMaterial.prototype.depthTest = true;

// Extend R3F with our custom material
extend({ CustomMaterial });

// Add the type declaration for our custom element
declare module '@react-three/fiber' {
    interface ThreeElements {
        customMaterial: ThreeElements['meshStandardMaterial'] & { uniforms?: { [key: string]: THREE.IUniform<any> } }
    }
}

const Model = ({ url, uniforms }: { url: string; uniforms: { [key: string]: THREE.IUniform<any> } }) => {
    const { nodes } = useGLTF(url);
    const meshes = Object.values(nodes).filter((node): node is THREE.Mesh => node instanceof THREE.Mesh);
    
    const material = useMemo(() => {
        const mat = new CustomMaterial();
        mat.uniforms = uniforms;
        return mat;
    }, []); // Only create once

    // Update uniforms when they change
    useEffect(() => {
        material.uniforms = uniforms;
    }, [uniforms, material]);
    
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
                    <primitive object={material} />
                </mesh>
            ))}
        </group>
    );
};

interface SDFRendererSceneProps {
    modelUrl: string | null;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SDFRendererScene = ({ modelUrl, onFileUpload }: SDFRendererSceneProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size, camera, gl } = useThree();
    const controls = useControls(createControls()) as unknown as Controls;
    
    // Create uniforms ref that won't change between renders
    const uniformsRef = useRef<{ [key: string]: THREE.IUniform<any> }>(createUniforms(controls, size, camera));
    const uniforms = uniformsRef.current;

    // Set pixel ratio for high DPI displays
    gl.setPixelRatio(window.devicePixelRatio);

    const material = useMemo(() => {
        const mat = new CustomMaterial();
        mat.uniforms = uniforms;
        return mat;
    }, []); // Only create once

    // Update material uniforms when they change
    useEffect(() => {
        material.uniforms = uniforms;
    }, [uniforms, material]);

    useFrame(({ clock }) => {
        // Time and animation updates
        uniforms.u_time.value = clock.getElapsedTime();

        // Mode and type control updates
        uniforms.u_mode.value = controls.mode === 'Raymarching' ? 0 : 1;
        uniforms.u_effectType.value = controls.effectType === 'Bump' ? 0 : 1;
        uniforms.u_sdfType.value = ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(controls.sdfType);

        if (controls.mode === 'Mesh') {
            // Mesh mode updates
            uniforms.u_scale.value = controls.scale;
            uniforms.u_posX.value = controls.posX;
            uniforms.u_posY.value = controls.posY;
            uniforms.u_posZ.value = controls.posZ;
            uniforms.u_color.value.set(controls.color);
            uniforms.u_thickness.value = controls.thickness;
            uniforms.u_effectStrength.value = controls.effectStrength;
            uniforms.u_contrast.value = controls.contrast;
        } else {
            // Raymarching specific updates - account for pixel ratio
            const pixelRatio = window.devicePixelRatio;
            uniforms.u_resolution.value.set(size.width * pixelRatio, size.height * pixelRatio);
            uniforms.u_cameraPos.value.copy(camera.position);
            uniforms.u_raymarchSteps.value = controls.raymarchSteps;
            uniforms.u_raymarchEpsilon.value = controls.raymarchEpsilon;

            // SDF parameters
            uniforms.u_count.value = controls.count;
            uniforms.u_size_x.value = controls.size_x;
            uniforms.u_size_y.value = controls.size_y;
            uniforms.u_size_z.value = controls.size_z;
            uniforms.u_sdf_thickness.value = controls.sdf_thickness;
            uniforms.u_bias.value = controls.bias;
            uniforms.u_drop_yz.value = controls.drop_yz;
            uniforms.u_drop_zx.value = controls.drop_zx;
            uniforms.u_drop_xy.value = controls.drop_xy;
            uniforms.u_variantIndex.value = controls.variantIndex;
        }
    });

    return (
        <group>
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
                            onChange={onFileUpload}
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
            {controls.mode === 'Mesh' ? (
                modelUrl ? (
                    <Suspense fallback={null}>
                        <Model url={modelUrl} uniforms={uniforms} />
                    </Suspense>
                ) : (
                    <mesh ref={meshRef}>
                        <sphereGeometry args={[1, 128, 128]} />
                        <primitive object={material} />
                    </mesh>
                )
            ) : (
                <mesh>
                    <planeGeometry args={[2, 2]} />
                    <primitive object={material} />
                </mesh>
            )}
        </group>
    );
};

const SDFRenderer = () => {
    const [modelUrl, setModelUrl] = useState<string | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setModelUrl(url);
    };

    return (
        <SDFRendererScene modelUrl={modelUrl} onFileUpload={handleFileUpload} />
    );
};

export default SDFRenderer;