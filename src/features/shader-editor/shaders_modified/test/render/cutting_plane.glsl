#ifndef RENDER_CUTTING_PLANE_GLSL
#define RENDER_CUTTING_PLANE_GLSL

#include "../implicit/types.glsl"
#include "../color_implicit/types.glsl"

#define SURF_DIST 0.0005

// Region classification (0=surface, 1=inside, 2=outside)
int classify(float d) {
    if (abs(d) < SURF_DIST*2.0) return 0;
    return (d < 0.0) ? 1 : 2;
}

// Region color palette using Gruvbox dark theme
vec3 regionColor(int region) {
    if (region == 0) return vec3(0.984, 0.286, 0.203);    // Bright red (#fb4934) for surface
    if (region == 1) return vec3(0.721, 0.733, 0.149);    // Bright yellow (#b8bb26) for inside
    return vec3(0.513, 0.647, 0.596);                     // Aqua (#83a598) for outside
}

// Calculate plane normal from rotations
vec3 getPlaneNormal(float rotX, float rotY, float rotZ) {
    vec3 n = vec3(0.0, 0.0, 1.0);
    n = mat3(
        cos(rotZ), -sin(rotZ), 0.0,
        sin(rotZ), cos(rotZ), 0.0,
        0.0, 0.0, 1.0
    ) * n;
    n = mat3(
        cos(rotY), 0.0, sin(rotY),
        0.0, 1.0, 0.0,
        -sin(rotY), 0.0, cos(rotY)
    ) * n;
    n = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(rotX), -sin(rotX),
        0.0, sin(rotX), cos(rotX)
    ) * n;
    return normalize(n);
}

// Plane intersection
float intersectPlane(vec3 ro, vec3 rd, vec3 n, float dist) {
    float denom = dot(rd, n);
    if (abs(denom) > 0.0001) {
        return dot(n * dist - ro, n) / denom;
    }
    return -1.0;
}

// Get color for a point on the cutting plane
vec4 getCuttingPlaneColor(vec3 p, ColorImplicit field) {
    // Color based on region
    int region = classify(field.Distance);
    vec3 baseColor = regionColor(region);
    
    // Add isolines with fixed interval
    float interval = 0.05;
    float isoline = abs(fract(field.Distance / interval) - 0.5) * 2.0;
    float lineIntensity = smoothstep(0.0, 0.2, 1.0 - isoline);
    
    // Enhance isolines with Gruvbox colors
    vec3 lineColor = (region == 1) 
        ? vec3(0.980, 0.741, 0.184)  // Bright yellow (#fac858) for inside
        : vec3(0.513, 0.647, 0.596);  // Aqua (#83a598) for outside
    
    // Mix base color with isolines
    baseColor = mix(baseColor * 0.7, lineColor, lineIntensity * 0.4);
    
    // Surface highlight with glow
    float surfDist = abs(field.Distance);
    if (surfDist < SURF_DIST * 3.0) {
        float glow = smoothstep(SURF_DIST * 3.0, 0.0, surfDist);
        vec3 glowColor = vec3(0.984, 0.286, 0.203);  // Bright red (#fb4934)
        baseColor = mix(baseColor, glowColor, glow * 0.6);
    }
    
    // Simple transparency that increases near surface
    float alpha = 0.4;  // Base transparency
    alpha = mix(alpha, 0.8, smoothstep(SURF_DIST * 3.0, 0.0, surfDist));
    
    return vec4(baseColor, alpha);
}

#endif // RENDER_CUTTING_PLANE_GLSL
