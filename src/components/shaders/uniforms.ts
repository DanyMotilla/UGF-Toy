import * as THREE from 'three';

export type ShaderUniforms = {
    u_time: { value: number };
    u_scale: { value: number };
    u_color: { value: THREE.Color };
    u_thickness: { value: number };
    u_mode: { value: number };
    u_effectType: { value: number };
    u_sdfType: { value: number };
    u_posX: { value: number };
    u_posY: { value: number };
    u_posZ: { value: number };
    u_effectStrength: { value: number };
    u_speed: { value: number };
    u_contrast: { value: number };
    u_resolution: { value: THREE.Vector2 };
    u_cameraPos: { value: THREE.Vector3 };
    u_raymarchSteps: { value: number };
    u_raymarchEpsilon: { value: number };
};

export const createUniforms = (
    controls: any,
    size: { width: number; height: number },
    camera: THREE.Camera
): ShaderUniforms => ({
    u_time: { value: 0 },
    u_scale: { value: controls.scale },
    u_color: { value: new THREE.Color(controls.color) },
    u_thickness: { value: controls.thickness },
    u_mode: { value: controls.mode === 'Raymarching' ? 0 : 1 },
    u_effectType: { value: controls.effectType === 'Bump' ? 0 : 1 },
    u_sdfType: { value: ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(controls.sdfType) },
    u_posX: { value: controls.posX },
    u_posY: { value: controls.posY },
    u_posZ: { value: controls.posZ },
    u_effectStrength: { value: controls.effectStrength },
    u_speed: { value: controls.speed },
    u_contrast: { value: controls.contrast },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_cameraPos: { value: new THREE.Vector3().copy(camera.position) },
    u_raymarchSteps: { value: controls.raymarchSteps },
    u_raymarchEpsilon: { value: controls.raymarchEpsilon },
});