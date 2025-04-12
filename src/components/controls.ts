import { RenderMode, EffectType, SDFType } from './types';

export type LevaControls = ReturnType<typeof createControls>;

export const createControls = () => {
    const controls = {
        // Mode and type controls
        mode: {
            value: 'Mesh' as RenderMode,
            options: ['Raymarching', 'Mesh'] as RenderMode[],
        },
        effectType: {
            value: 'Displacement' as EffectType,
            options: ['Bump', 'Displacement'] as EffectType[],
            render: (get: any) => get('mode') === 'Mesh'
        },
        sdfType: {
            value: 'Gyroid' as SDFType,
            options: ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'] as SDFType[],
            render: (get: any) => get('mode') === 'Mesh'
        },

        // Geometry and transformation
        scale: { 
            value: 1.0, min: 0.1, max: 5, step: 0.1,
            render: (get: any) => get('mode') === 'Mesh'
        },
        posX: { 
            value: 0, min: -2, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Mesh'
        },
        posY: { 
            value: 0, min: -2, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Mesh'
        },
        posZ: { 
            value: 0, min: -2, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Mesh'
        },

        // Material and effects
        color: { 
            value: '#ff69b4',
            render: (get: any) => get('mode') === 'Mesh'
        },
        thickness: { 
            value: 0.1, min: 0, max: 1, step: 0.01,
            render: (get: any) => get('mode') === 'Mesh'
        },
        effectStrength: { 
            value: 0.5, min: 0, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Mesh' && get('effectType') === 'Bump'
        },
        contrast: { 
            value: 1, min: 0.1, max: 5, step: 0.01,
            render: (get: any) => get('mode') === 'Mesh' && get('effectType') === 'Bump'
        },

        // Raymarching specific
        raymarchSteps: { 
            value: 100, min: 20, max: 200,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        raymarchEpsilon: { 
            value: 0.001, min: 0.0001, max: 0.01, step: 0.0001,
            render: (get: any) => get('mode') === 'Raymarching'
        },

        // SDF parameters
        count: {
            value: 1.5, min: 0.5, max: 5, step: 0.1,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        size_x: {
            value: 5.0, min: 1, max: 20, step: 0.1,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        size_y: {
            value: 5.0, min: 1, max: 20, step: 0.1,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        size_z: {
            value: 5.0, min: 1, max: 20, step: 0.1,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        sdf_thickness: {
            value: 0.8, min: 0.1, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        bias: {
            value: -0.19, min: -1, max: 1, step: 0.01,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        drop_yz: {
            value: 1.0, min: 0, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        drop_zx: {
            value: 1.0, min: 0, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        drop_xy: {
            value: 0.65, min: 0, max: 2, step: 0.01,
            render: (get: any) => get('mode') === 'Raymarching'
        },
        variantIndex: {
            value: 0, min: 0, max: 4, step: 1,
            render: (get: any) => get('mode') === 'Raymarching'
        }
    } as const;

    return controls;
};