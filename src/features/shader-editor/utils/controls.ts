import { RenderMode, EffectType, SDFType } from './types';

export type LevaControls = ReturnType<typeof createControls>;

export const createControls = () => {
    const controls = {
        // Mode and type controls
        mode: {
            value: 'Raymarching' as RenderMode,
            options: ['Raymarching', 'Mesh'] as RenderMode[],
        },
        effectType: {
            value: 'Bump' as EffectType,
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
            value: 5.0, min: 0.1, max: 5, step: 0.1,
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
            value: '#b49e82',
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
        }
    } as const;

    return controls;
};