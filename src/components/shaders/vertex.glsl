#ifndef VERTEX_GLSL
#define VERTEX_GLSL

#include "./utils/constants.glsl"
#include "./drawing/drawing.glsl"

void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = position;

    vec3 pos = position;

    if (u_mode == 1) {
        if (u_effectType == 1) {
            float sdfValue = mapSdf(vWorldPosition);
            sdfValue = tanh(sdfValue * u_contrast);
            pos += normal * sdfValue * u_effectStrength * 0.2;
        }
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#endif // VERTEX_GLSL