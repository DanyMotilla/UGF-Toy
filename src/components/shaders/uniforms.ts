import * as THREE from 'three';

export type ShaderUniforms = {
    // Time and animation
    u_time: { value: number };
    u_speed: { value: number };

    // Geometry and transformation
    u_scale: { value: number };
    u_posX: { value: number };
    u_posY: { value: number };
    u_posZ: { value: number };

    // Material and effects
    u_color: { value: THREE.Color };
    u_thickness: { value: number };
    u_effectStrength: { value: number };
    u_contrast: { value: number };

    // Mode and type controls
    u_mode: { value: number };
    u_effectType: { value: number };
    u_sdfType: { value: number };

    // Raymarching specific
    u_resolution: { value: THREE.Vector2 };
    u_cameraPos: { value: THREE.Vector3 };
    u_raymarchSteps: { value: number };
    u_raymarchEpsilon: { value: number };

    // SDF parameters
    u_count: { value: number };
    u_size_x: { value: number };
    u_size_y: { value: number };
    u_size_z: { value: number };
    u_sdf_thickness: { value: number };
    u_bias: { value: number };
    u_drop_yz: { value: number };
    u_drop_zx: { value: number };
    u_drop_xy: { value: number };
    u_variantIndex: { value: number };
};

export const createUniforms = (
    controls: any,
    size: { width: number; height: number },
    camera: THREE.Camera
): ShaderUniforms => ({
    // Time and animation
    u_time: { value: 0 },
    u_speed: { value: controls.speed },

    // Geometry and transformation
    u_scale: { value: controls.scale },
    u_posX: { value: controls.posX },
    u_posY: { value: controls.posY },
    u_posZ: { value: controls.posZ },

    // Material and effects
    u_color: { value: new THREE.Color(controls.color) },
    u_thickness: { value: controls.thickness },
    u_effectStrength: { value: controls.effectStrength },
    u_contrast: { value: controls.contrast },

    // Mode and type controls
    u_mode: { value: controls.mode === 'Raymarching' ? 0 : 1 },
    u_effectType: { value: controls.effectType === 'Bump' ? 0 : 1 },
    u_sdfType: { value: ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'].indexOf(controls.sdfType) },

    // Raymarching specific
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_cameraPos: { value: new THREE.Vector3().copy(camera.position) },
    u_raymarchSteps: { value: controls.raymarchSteps },
    u_raymarchEpsilon: { value: controls.raymarchEpsilon },

    // SDF parameters
    u_count: { value: controls.count },
    u_size_x: { value: controls.size_x },
    u_size_y: { value: controls.size_y },
    u_size_z: { value: controls.size_z },
    u_sdf_thickness: { value: controls.sdf_thickness },
    u_bias: { value: controls.bias },
    u_drop_yz: { value: controls.drop_yz },
    u_drop_zx: { value: controls.drop_zx },
    u_drop_xy: { value: controls.drop_xy },
    u_variantIndex: { value: controls.variantIndex },
});