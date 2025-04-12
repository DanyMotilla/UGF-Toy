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
    count: number;
    size_x: number;
    size_y: number;
    size_z: number;
    sdf_thickness: number;
    bias: number;
    drop_yz: number;
    drop_zx: number;
    drop_xy: number;
    variantIndex: number;
}

export type Controls = BaseControls & MeshControls & RaymarchControls;
