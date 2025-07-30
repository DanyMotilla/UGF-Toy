#ifndef RENDER_TRUE_CLIPPING_GLSL
#define RENDER_TRUE_CLIPPING_GLSL

// 1. Base definitions (no dependencies)
#include "../implicit/types.glsl"
#include "../core/constants.glsl"
#include "../core/math.glsl"

// 2. Level 1 (depends on base)
#include "../implicit/operations.glsl"
#include "../color_implicit/types.glsl"

// 3. Level 2 (depends on level 1)
#include "../implicit/primitives.glsl"

// 4. Level 3 (depends on level 2)
#include "../implicit/evaluation.glsl"
#include "../render/lighting.glsl"
#include "../render/cutting_plane.glsl"

// Constants for clipping - balanced precision for gyroid
#define PLANE_SURF_DIST 0.001   // Moderate precision for plane detection
#define NORMAL_EPS 0.001       // Moderate epsilon for normals
#define MIN_STEP 0.001         // Standard minimum step
#define PRECISION_BOOST 0.8    // Moderate step size reduction

// Calculate normal using central differences with dynamic epsilon
vec3 calcColorNormal(in vec3 pos) {
    ColorImplicit field = mapColor(pos);
    float dist = abs(field.Distance);
    float eps = max(NORMAL_EPS, dist * 0.001); // Dynamic epsilon based on distance
    vec2 h = vec2(eps, 0.0);
    
    // Get central differences
    float px = mapColor(pos + h.xyy).Distance;
    float nx = mapColor(pos - h.xyy).Distance;
    float py = mapColor(pos + h.yxy).Distance;
    float ny = mapColor(pos - h.yxy).Distance;
    float pz = mapColor(pos + h.yyx).Distance;
    float nz = mapColor(pos - h.yyx).Distance;
    
    // Calculate normal and invert if inside
    vec3 normal = normalize(vec3(px - nx, py - ny, pz - nz));
    return field.Distance < 0.0 ? -normal : normal;
}

// Forward declarations
vec3 getClipNormal(vec3 p, bool isInside);
vec4 getGradientColor(vec3 p, bool isInside, vec3 planeN, float planeD);

// Result type for true clipping raymarch
struct ClipMarchResult {
    float Distance;
    bool Hit;
    bool IsInside;
    vec3 Normal;
    vec4 Color;
};

// Get normal for inside/outside points
vec3 getClipNormal(vec3 p, bool isInside) {
    // calcColorNormal already handles inside/outside inversion
    return calcColorNormal(p);
}

// Get gradient color for inside/outside points
vec4 getGradientColor(vec3 p, bool isInside, vec3 planeN, float planeD) {
    vec3 normal = getClipNormal(p, isInside);
    vec3 normalColor = normal * 0.5 + 0.5; // Convert normal range from [-1,1] to [0,1]
    
    // Base color is just the normal color
    vec3 baseColor = normalColor;
    
    // Add slight highlight near the plane
    float planeDist = abs(dot(p - planeN * planeD, planeN));
    float gradientWidth = 0.02;
    float planeGradient = smoothstep(0.0, gradientWidth, planeDist);
    
    // Make it slightly brighter near the plane
    baseColor = mix(baseColor * 1.2, baseColor, planeGradient);
    return vec4(baseColor, 1.0);
}

// Binary search refinement for exact plane intersection
float refineIntersection(vec3 ro, vec3 rd, float t0, float t1, vec3 planeN, float planeD) {
    float t = t0;
    for (int i = 0; i < 5; i++) {  // 5 refinement steps
        float mid = (t0 + t1) * 0.5;
        vec3 p = ro + rd * mid;
        if (dot(p - planeN * planeD, planeN) < 0.0) {
            t0 = mid;
        } else {
            t1 = mid;
        }
    }
    return (t0 + t1) * 0.5;
}

// Raymarch with inside/outside detection
ClipMarchResult clipMarch(vec3 ro, vec3 rd, vec3 planeN, float planeD) {
    float depth = 0.0;
    bool isInside = false;
    float lastBeforePlane = 0.0;
    float firstAfterPlane = MAX_DIST;
    bool crossedPlane = false;
    
    // First determine if we start inside the object
    ColorImplicit startField = mapColor(ro);
    bool startInside = startField.Distance < 0.0;
    
    // If we start inside and beyond the plane, we need to march backwards first
    if (startInside && dot(ro - planeN * planeD, planeN) < 0.0) {
        // Start marching from the plane intersection
        depth = -dot(ro - planeN * planeD, planeN);
    }
    
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * depth;
        
        // Get field value
        ColorImplicit field = mapColor(p);
        isInside = field.Distance < 0.0;
        float surfaceDist = abs(field.Distance);
        
        // Get distance to plane
        float planeDist = dot(p - planeN * planeD, planeN);
        bool beyondPlane = planeDist < 0.0;
        
        // Track plane crossing
        if (!crossedPlane && i > 0) {
            if (!beyondPlane) {
                lastBeforePlane = depth;
            } else if (lastBeforePlane > 0.0) {
                firstAfterPlane = depth;
                crossedPlane = true;
                
                // When we cross the plane, jump to just beyond it
                depth = firstAfterPlane + SURFACE_DIST;
                continue;
            }
        }
        
        // Check for hit with surface
        if (surfaceDist < SURFACE_DIST) {
            // Only show points beyond the cutting plane
            if (beyondPlane) {
                vec3 normal = getClipNormal(p, isInside);
                vec4 color = getGradientColor(p, isInside, planeN, planeD);
                return ClipMarchResult(depth, true, isInside, normal, color);
            } else if (!crossedPlane) {
                // If we haven't crossed the plane yet, keep marching
                depth += max(MIN_STEP, surfaceDist * PRECISION_BOOST);
                continue;
            }
        }
        
        // Adaptive step size calculation
        float baseStep = surfaceDist * PRECISION_BOOST;
        
        // Take much smaller steps when beyond the plane or near surface
        if (beyondPlane || surfaceDist < SURFACE_DIST * 2.0) {
            baseStep *= 0.2;  // Even smaller steps for fine details
        }
        
        // Ensure minimum step size
        baseStep = max(MIN_STEP, baseStep);
        
        // Reduce step size near the plane
        float planeProximity = exp(-abs(planeDist) * 20.0);
        float maxStep = beyondPlane ? 0.01 : 0.05;
        
        // Final step calculation
        float finalStep = min(baseStep, maxStep);
        finalStep = mix(finalStep, MIN_STEP, planeProximity);
        depth += finalStep;
        
        if (depth > MAX_DIST) break;
    }
    
    return ClipMarchResult(MAX_DIST, false, false, vec3(0.0), vec4(0.0));
}

#endif // RENDER_TRUE_CLIPPING_GLSL
