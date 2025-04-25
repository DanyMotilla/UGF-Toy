import * as THREE from 'three';
import { Controls } from '../../types.ts';

// Uniform types
interface BaseUniforms {
    [key: string]: THREE.IUniform<any>;
    u_time: THREE.IUniform<number>;
    u_mode: THREE.IUniform<number>;
}

interface MeshUniforms {
    [key: string]: THREE.IUniform<any>;
    u_effectType: THREE.IUniform<number>;
    u_sdfType: THREE.IUniform<number>;
    u_scale: THREE.IUniform<number>;
    u_posX: THREE.IUniform<number>;
    u_posY: THREE.IUniform<number>;
    u_posZ: THREE.IUniform<number>;
    u_color: THREE.IUniform<THREE.Color>;
    u_thickness: THREE.IUniform<number>;
    u_effectStrength: THREE.IUniform<number>;
    u_contrast: THREE.IUniform<number>;
}

interface RaymarchUniforms {
    [key: string]: THREE.IUniform<any>;
    u_resolution: THREE.IUniform<THREE.Vector2>;
    u_cameraPos: THREE.IUniform<THREE.Vector3>;
    u_mouse_X: THREE.IUniform<number>;
    u_mouse_Y: THREE.IUniform<number>;
    u_raymarchSteps: THREE.IUniform<number>;
    u_raymarchEpsilon: THREE.IUniform<number>;
    u_count: THREE.IUniform<number>;
    u_size_x: THREE.IUniform<number>;
    u_size_y: THREE.IUniform<number>;
    u_size_z: THREE.IUniform<number>;
    u_sdf_thickness: THREE.IUniform<number>;
    u_bias: THREE.IUniform<number>;
    u_drop_yz: THREE.IUniform<number>;
    u_drop_zx: THREE.IUniform<number>;
    u_drop_xy: THREE.IUniform<number>;
    u_variantIndex: THREE.IUniform<number>;
}

export interface ShaderUniforms extends BaseUniforms, MeshUniforms, RaymarchUniforms {
    [key: string]: THREE.IUniform<any>;
}

export const createUniforms = (controls: Controls, size: { width: number, height: number }, camera: THREE.Camera): ShaderUniforms => ({
    // Base uniforms
    u_time: { value: 0 },
    u_mode: { value: controls.mode === 'Raymarching' ? 0 : 1 },

    // Mesh uniforms
    u_effectType: { value: controls.effectType === 'Bump' ? 0 : 1 },
    u_sdfType: { value: ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(controls.sdfType) },
    u_scale: { value: controls.scale },
    u_posX: { value: controls.posX },
    u_posY: { value: controls.posY },
    u_posZ: { value: controls.posZ },
    u_color: { value: new THREE.Color(controls.color) },
    u_thickness: { value: controls.thickness },
    u_effectStrength: { value: controls.effectStrength },
    u_contrast: { value: controls.contrast },

    // Raymarching uniforms
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_cameraPos: { value: camera.position },
    u_mouse_X: { value: 0 },
    u_mouse_Y: { value: 0 },
    u_raymarchSteps: { value: controls.raymarchSteps },
    u_raymarchEpsilon: { value: controls.raymarchEpsilon },
    u_count: { value: controls.count },
    u_size_x: { value: controls.size_x },
    u_size_y: { value: controls.size_y },
    u_size_z: { value: controls.size_z },
    u_sdf_thickness: { value: controls.sdf_thickness },
    u_bias: { value: controls.bias },
    u_drop_yz: { value: controls.drop_yz },
    u_drop_zx: { value: controls.drop_zx },
    u_drop_xy: { value: controls.drop_xy },
    u_variantIndex: { value: controls.variantIndex }
});