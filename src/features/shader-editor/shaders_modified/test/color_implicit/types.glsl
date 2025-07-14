#ifndef COLOR_TYPES_GLSL
#define COLOR_TYPES_GLSL

#include "../implicit/types.glsl"

// ColorImplicit type for colored SDFs and implicits
struct ColorImplicit {
    float Distance;
    vec3 Gradient;
    vec4 Color;
};

// Create a ColorImplicit from an Implicit and color
ColorImplicit CreateColorImplicit(Implicit iImplicit, vec4 iColor) {
    return ColorImplicit(iImplicit.Distance, iImplicit.Gradient, iColor);
}

// Create a ColorImplicit directly from components
ColorImplicit CreateColorImplicit(float iValue, vec3 iGradient, vec4 iColor) {
    return ColorImplicit(iValue, iGradient, iColor);
}

// Convert ColorImplicit back to Implicit
Implicit ToImplicit(ColorImplicit a) {
    return CreateImplicit(a.Distance);
}

#endif // COLOR_TYPES_GLSL
