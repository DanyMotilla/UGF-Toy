// Rendering modes
export type RenderMode = 'Raymarching' | 'Mesh';
export type EffectType = 'Bump' | 'Displacement';
export type SDFType = 'Gyroid' | 'Sphere' | 'Box' | 'Torus' | 'Waves';

// Control interfaces
export interface BaseControls {
    mode: RenderMode;
}

export interface MeshControls {
    effectType: EffectType;
    sdfType: SDFType;
    scale: number;
    posX: number;
    posY: number;
    posZ: number;
    color: string;
    thickness: number;
    effectStrength: number;
    contrast: number;
}

export interface RaymarchControls {
    raymarchSteps: number;
    raymarchEpsilon: number;
    plane_enabled: boolean;
    plane_rotX: number;
    plane_rotY: number;
    plane_rotZ: number;
    plane_dist: number;
}

export type Controls = BaseControls & MeshControls & RaymarchControls;
