#ifndef IMPLICIT_TYPES_GLSL
#define IMPLICIT_TYPES_GLSL

// Base Implicit type for SDFs and implicit functions
struct Implicit {
    float Distance;
    vec3 Gradient;
};

// Create a default Implicit
Implicit CreateImplicit() {
    return Implicit(0.0, vec3(0.0));
}

// Create an Implicit from a distance value
Implicit CreateImplicit(float iValue) {
    return Implicit(iValue, vec3(0.0));
}

#endif // IMPLICIT_TYPES_GLSL
