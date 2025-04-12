import { useRef } from 'react';
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

    useFrame(({ clock }) => {
        if (!materialRef.current) return;

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
            // Raymarching specific updates
            uniforms.u_resolution.value.set(size.width, size.height);
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

    const shaderMaterial = (
        <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={THREE.DoubleSide}
            transparent={true}
        />
    );

    return (
        <group>
            {controls.mode === 'Mesh' ? (
                <mesh ref={meshRef}>
                    <sphereGeometry args={[1, 128, 128]} />
                    {shaderMaterial}
                </mesh>
            ) : (
                <mesh>
                    <planeGeometry args={[2, 2]} />
                    {shaderMaterial}
                </mesh>
            )}
        </group>
    );
};

export default SDFRenderer;