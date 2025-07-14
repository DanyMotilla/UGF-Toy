#ifndef COLOR_IMPLICIT_GLSL
#define COLOR_IMPLICIT_GLSL

//======================================
// COLOR IMPLICIT CLASS & FUNCTIONS
//======================================

//-> =================================== ->#KILL# {
struct ColorImplicit {
    float Distance;
    vec3 Gradient;
    vec4 Color;
};

// Basic construction functions
ColorImplicit CreateColorImplicit(float iValue, vec3 iGradient, vec4 iColor) {
    return ColorImplicit(iValue, iGradient, iColor);
}
ColorImplicit CreateColorImplicit(Implicit iImplicit, vec4 iColor) {
    return ColorImplicit(iImplicit.Distance, iImplicit.Gradient, iColor);
}

//-> =================================== ->#KILL# }
ColorImplicit Negate(ColorImplicit iColorImplicit) {
    return ColorImplicit(-iColorImplicit.Distance, -iColorImplicit.Gradient, iColorImplicit.Color);
}

ColorImplicit Add(ColorImplicit a, ColorImplicit b) {
    float d = min(a.Distance, b.Distance);
    vec3 g = (d == a.Distance) ? a.Gradient : b.Gradient;
    vec4 c = (d == a.Distance) ? a.Color : b.Color;
    return ColorImplicit(d, g, c);
}

ColorImplicit Add(ColorImplicit a, ColorImplicit b, vec4 colorA, vec4 colorB) {
    float d = min(a.Distance, b.Distance);
    vec3 g = (d == a.Distance) ? a.Gradient : b.Gradient;
    vec4 c = (d == a.Distance) ? colorA : colorB;
    return ColorImplicit(d, g, c);
}

ColorImplicit Add(ColorImplicit a, float b) {
    return ColorImplicit(a.Distance + b, a.Gradient, a.Color);
}

Implicit ToImplicit(ColorImplicit a) {
    return CreateImplicit(a.Distance);
}

ColorImplicit Subtract(ColorImplicit a, ColorImplicit b) {
    float d = max(a.Distance, -b.Distance);
    vec3 g = (d == a.Distance) ? a.Gradient : -b.Gradient;
    vec4 c = (d == a.Distance) ? a.Color : b.Color;
    return ColorImplicit(d, g, c);
}

// Min with color blend
ColorImplicit Min(Implicit a, Implicit b, vec4 colorA, vec4 colorB) {
    float blendingRatio = a.Distance <= b.Distance ? 0.0 : 1.0;
    Implicit result = Min(a, b);
    return ColorImplicit(result.Distance, result.Gradient, mix(colorA, colorB, blendingRatio));
}

ColorImplicit Min(ColorImplicit a, ColorImplicit b) {
    if(a.Distance <= b.Distance)
        return a;

    return b;
}

// Max with color blend
ColorImplicit Max(Implicit a, Implicit b, vec4 colorA, vec4 colorB) {
    float blendingRatio = a.Distance >= b.Distance ? 0.0 : 1.0;
    Implicit result = Max(a, b);
    return ColorImplicit(result.Distance, result.Gradient, mix(colorA, colorB, blendingRatio));
}

ColorImplicit Max(ColorImplicit a, ColorImplicit b) {
    if(a.Distance >= b.Distance)
        return a;

    return b;
}

ColorImplicit Atan(ColorImplicit a, ColorImplicit b) {
    float x = b.Distance;
    float y = a.Distance;
    float ir2 = 1.0 / (x * x + y * y);

    float distance = atan(y, x);
    vec3 gradient = vec3(-y * ir2, x * ir2, 0.0);
    vec4 color = 0.5 * (a.Color + b.Color);

    return ColorImplicit(distance, gradient, color);
}

// Primitives

ColorImplicit Plane(vec3 p, vec3 origin, vec3 normal, vec4 color) {
    Implicit result = Plane(p, origin, normal);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit Plane(vec2 p, vec2 origin, vec2 normal, vec4 color) {
    Implicit result = Plane(p, origin, normal);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit LineSegment(vec2 p, vec2 start, vec2 end, vec4 color) {
    Implicit result = LineSegment(p, start, end);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit RectangleCentered(vec2 p, vec2 center, vec2 size, vec4 color) {
    Implicit result = RectangleCentered(p, center, size);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit Rectangle(vec2 p, vec2 min, vec2 max, vec4 color) {
    Implicit result = Rectangle(p, min, max);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit RectangleCenterRotatedExp(vec2 p, vec2 center, vec2 size, float angle, vec4 color) {
    Implicit result = RectangleCenterRotatedExp(p, center, size, angle);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit Intersection(ColorImplicit a, ColorImplicit b) {
    float d = max(a.Distance, b.Distance);
    vec3 g = (d == a.Distance) ? a.Gradient : b.Gradient;
    vec4 c = (d == a.Distance) ? a.Color : b.Color;
    return ColorImplicit(d, g, c);
}

ColorImplicit RectangleUGFSDFCenterRotated(vec2 p, vec2 center, float size, float angle, vec4 color) {
    Implicit result = RectangleUGFSDFCenterRotated(p, center, size, angle);
    return ColorImplicit(result.Distance, result.Gradient, color);
}

ColorImplicit TriangleWaveEvenPositive(ColorImplicit param, float period) {
    Implicit base = TriangleWaveEvenPositive(Implicit(param.Distance, param.Gradient), period);
    return ColorImplicit(base.Distance, base.Gradient, param.Color);
}

// Booleans

ColorImplicit UnionEuclidean(ColorImplicit a, ColorImplicit b, float radius) {
    float blendingRatio;
    Implicit base = UnionEuclidean(Implicit(a.Distance, a.Gradient), Implicit(b.Distance, b.Gradient), radius, blendingRatio);
    vec4 color = mix(a.Color, b.Color, blendingRatio);
    return ColorImplicit(base.Distance, base.Gradient, color);
}

ColorImplicit UnionEuclidean(ColorImplicit a, ColorImplicit b, ColorImplicit c, float radius) {
    Implicit base = UnionEuclidean(Implicit(a.Distance, a.Gradient), Implicit(b.Distance, b.Gradient), Implicit(c.Distance, c.Gradient), radius);
    vec4 color = (a.Color + b.Color + c.Color) / 3.0;
    return ColorImplicit(base.Distance, base.Gradient, color);
}

ColorImplicit UnionSmoothMedial(ColorImplicit a, ColorImplicit b, float k) {
    float blendingRatio;
    Implicit base = UnionSmoothMedial(Implicit(a.Distance, a.Gradient), Implicit(b.Distance, b.Gradient), k, blendingRatio);
    vec4 color = mix(a.Color, b.Color, blendingRatio);
    return ColorImplicit(base.Distance, base.Gradient, color);
}

#endif // COLOR_IMPLICIT_GLSL
