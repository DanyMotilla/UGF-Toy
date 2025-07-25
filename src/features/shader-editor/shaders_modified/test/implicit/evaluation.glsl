#ifndef IMPLICIT_EVALUATION_GLSL
#define IMPLICIT_EVALUATION_GLSL

#include "types.glsl"
#include "primitives.glsl"
#include "../color_implicit/types.glsl"

// Main shape definition
ColorImplicit mapColor(vec3 p) {
    // Create a sphere using SphereNative
    Implicit sphere = SphereNative(p, vec3(0.0), 0.5);
    return ColorImplicit(sphere.Distance, sphere.Gradient, vec4(0.8, 0.2, 0.2, 1.0));
}

Implicit map(vec3 p) {
    return ToImplicit(mapColor(p));
}

#endif // IMPLICIT_EVALUATION_GLSL
