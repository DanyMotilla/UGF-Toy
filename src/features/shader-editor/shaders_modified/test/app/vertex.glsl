#ifndef VERTEX_GLSL
#define VERTEX_GLSL

// 1. Base definitions
#include "uniforms.glsl"
#include "../implicit/types.glsl"

// 2. Core implementation
#include "../implicit/evaluation.glsl"

void main() {
    // Set up varyings
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = position;

    vec3 pos = position;

    // Apply displacement in Mesh mode
    if (u_mode == 1) { // Mesh mode
        if (u_effectType == 1) { // Displacement effect
            float sdfValue = map(vWorldPosition).Distance;
            sdfValue = tanh(sdfValue * u_contrast);
            pos += normal * sdfValue * u_effectStrength * 0.2;
        }
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#endif // VERTEX_GLSL
