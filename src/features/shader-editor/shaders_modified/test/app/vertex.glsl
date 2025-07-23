#ifndef VERTEX_GLSL
#define VERTEX_GLSL

// 1. Base definitions (no dependencies)
#include "../implicit/types.glsl"
#include "../core/constants.glsl"
#include "../core/math.glsl"
#include "uniforms.glsl"

// 2. Level 1 (depends on base)
#include "../implicit/operations.glsl"
#include "../color_implicit/types.glsl"

// 3. Level 2 (depends on level 1)
#include "../implicit/primitives.glsl"
#include "../render/raymarching.glsl"

// 4. Level 3 (depends on level 2)
#include "../implicit/modifiers.glsl"

// 5. High-level features
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
