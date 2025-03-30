export const createControls = () => {
    return {
        mode: {
            value: 'Raymarching' as 'Raymarching' | 'Mesh',
            options: ['Raymarching', 'Mesh'] as const,
        },
        effectType: {
            value: 'Displacement' as 'Bump' | 'Displacement',
            options: ['Bump', 'Displacement'],
            render: (get: any) => get('mode') === 'Mesh'
        },
        sdfType: {
            value: 'Gyroid' as 'Gyroid' | 'Sphere' | 'Box' | 'Torus' | 'Waves',
            options: ['Gyroid', 'Sphere', 'Box', 'Torus', 'Waves'] as const,
        },
        color: { value: '#ff69b4' },
        scale: { value: 1.0, min: 0.1, max: 5, step: 0.1 },
        thickness: { value: 0.1, min: 0, max: 1, step: 0.01 },
        posX: { value: 0, min: -2, max: 2, step: 0.01 },
        posY: { value: 0, min: -2, max: 2, step: 0.01 },
        posZ: { value: 0, min: -2, max: 2, step: 0.01 },
        effectStrength: { value: 0.5, min: 0, max: 2, step: 0.01 },
        speed: { value: 0.5, min: 0, max: 3, step: 0.01 },
        contrast: { value: 1, min: 0.1, max: 5, step: 0.01 },
        rotationSpeed: { value: 0.01, min: 0, max: 0.1, step: 0.001 },
        animate: { value: true },
        raymarchSteps: { value: 100, min: 20, max: 200 },
        raymarchEpsilon: { value: 0.001, min: 0.0001, max: 0.01, step: 0.0001 },
    };
};