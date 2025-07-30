#ifndef IMPLICIT_EVALUATION_GLSL
#define IMPLICIT_EVALUATION_GLSL

#include "types.glsl"
#include "primitives.glsl"
#include "../color_implicit/types.glsl"

// Main shape definition
ColorImplicit mapColor(vec3 p) {
    // Create a gyroid with smaller scale and much thicker surface
    Implicit gyroid = sdfGyroid(p, 8.0, 0.15);
    
    // Create a bounding box
    Implicit box = BoxCenter(p, vec3(0.0), vec3(1.0));
    
    // Intersect gyroid with box
    float dist = max(gyroid.Distance, box.Distance);
    vec3 grad = gyroid.Distance > box.Distance ? gyroid.Gradient : box.Gradient;
    
    return CreateColorImplicit(dist, grad, vec4(0.8, 0.2, 0.2, 1.0));
}

Implicit map(vec3 p) {
    return ToImplicit(mapColor(p));
}

#endif // IMPLICIT_EVALUATION_GLSL
