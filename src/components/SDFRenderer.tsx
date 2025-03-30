import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { ShaderUniforms, createUniforms } from './shaders/uniforms';
import { createControls } from './controls';
import vertexShader from './shaders/vertex.ts';
import fragmentShader from './shaders/fragment.ts';

const SDFRenderer = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { size, camera } = useThree();
    const controls = useControls(createControls());
    const uniforms = useRef<ShaderUniforms>(createUniforms(controls, size, camera)).current;

    // Update uniforms only (no rotation/animation logic)
    useFrame(({ clock }) => {
        uniforms.u_time.value = clock.getElapsedTime();
        uniforms.u_scale.value = controls.scale;
        uniforms.u_color.value.set(controls.color);
        uniforms.u_thickness.value = controls.thickness;
        uniforms.u_mode.value = controls.mode === 'Raymarching' ? 0 : 1;
        uniforms.u_effectType.value = controls.effectType === 'Bump' ? 0 : 1;
        uniforms.u_sdfType.value = ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(controls.sdfType);
        uniforms.u_posX.value = controls.posX;
        uniforms.u_posY.value = controls.posY;
        uniforms.u_posZ.value = controls.posZ;
        uniforms.u_effectStrength.value = controls.effectStrength;
        uniforms.u_speed.value = controls.speed;
        uniforms.u_contrast.value = controls.contrast;
        uniforms.u_resolution.value.set(size.width, size.height);
        uniforms.u_cameraPos.value.copy(camera.position);
        uniforms.u_raymarchSteps.value = controls.raymarchSteps;
        uniforms.u_raymarchEpsilon.value = controls.raymarchEpsilon;
    });

    return (
        <>
            {controls.mode === 'Mesh' ? (
                <mesh ref={meshRef} rotation={[0, 0, 0]}> {/* Explicitly set static rotation */}
                    <sphereGeometry args={[1, 128, 128]} />
                    <shaderMaterial
                        ref={materialRef}
                        uniforms={uniforms}
                        vertexShader={vertexShader}
                        fragmentShader={fragmentShader}
                    />
                </mesh>
            ) : (
                <mesh rotation={[0, 0, 0]}> {/* Also static for raymarching plane */}
                    <planeGeometry args={[2, 2]} />
                    <shaderMaterial
                        ref={materialRef}
                        uniforms={uniforms}
                        vertexShader={vertexShader}
                        fragmentShader={fragmentShader}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </>
    );
};

export default SDFRenderer;