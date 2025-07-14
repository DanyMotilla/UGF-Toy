#ifndef IMPLICIT_EVALUATION_GLSL
#define IMPLICIT_EVALUATION_GLSL

#include "types.glsl"
#include "primitives.glsl"
#include "../color_implicit/types.glsl"

ColorImplicit mapColor(vec3 p) {
    Implicit sphere = SphereNative(p, vec3(0.0), 0.5);
    vec4 color = vec4(0.8, 0.2, 0.2, 1.0); // Red color
    return ColorImplicit(sphere.Distance, sphere.Gradient, color);
}

Implicit map(vec3 p) {
    return ToImplicit(mapColor(p));
}

#endif // IMPLICIT_EVALUATION_GLSL
