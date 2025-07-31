#ifndef RENDER_TRUE_CLIPPING_GLSL
#define RENDER_TRUE_CLIPPING_GLSL

// 1. Base definitions (no dependencies)
#include "../implicit/types.glsl"
#include "../core/constants.glsl"
#include "../core/math.glsl"
#include "../render/cutting_plane.glsl"

// 2. Level 1 (depends on base)
#include "../implicit/operations.glsl"
#include "../color_implicit/types.glsl"

// 3. Level 2 (depends on level 1)
#include "../implicit/primitives.glsl"

// 4. Level 3 (depends on level 2)
#include "../implicit/evaluation.glsl"
#include "../render/lighting.glsl"

// Constants for clipping
#define PLANE_SURF_DIST 0.001    // Plane detection threshold
#define NORMAL_EPS 0.001       // Normal calculation epsilon
#define MIN_STEP 0.001          // Minimum step size
#define MAX_STEPS 256           // Maximum raymarching steps
#define STEP_SCALE 0.68          // Scale factor for steps

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
    float lastInside = 0.0;  // Track last point inside the surface
    
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
                depth += MIN_STEP;
                continue;
            }
        }
        
        // Check for surface intersection
        if (surfaceDist < SURFACE_DIST * 2.0 && beyondPlane) {
            vec3 p = ro + rd * depth;
            float d = mapColor(p).Distance;
            
            // Multi-point sampling
            vec3 offsets[8] = vec3[8](
                vec3(1,1,0), vec3(-1,1,0),
                vec3(1,-1,0), vec3(-1,-1,0),
                vec3(0,1,1), vec3(0,-1,1),
                vec3(1,0,-1), vec3(-1,0,-1)
            );
            
            bool foundSurface = d < 0.0;
            float minDist = abs(d);
            
            // Sample in a small sphere
            for(int i = 0; i < 8 && !foundSurface; i++) {
                vec3 sp = p + offsets[i] * MIN_STEP;
                float sd = mapColor(sp).Distance;
                if (sd < 0.0) {
                    foundSurface = true;
                    p = sp;
                    d = sd;
                }
                minDist = min(minDist, abs(sd));
            }
            
            // Found surface or very close to it
            if (foundSurface || minDist < SURFACE_DIST * 0.5) {
                // Binary search refinement
                vec3 pStart = p - rd * MIN_STEP * 2.0;
                vec3 pEnd = p + rd * MIN_STEP * 2.0;
                
                for(int i = 0; i < 4; i++) {
                    vec3 pMid = (pStart + pEnd) * 0.5;
                    float dMid = mapColor(pMid).Distance;
                    
                    if (dMid < 0.0) {
                        pEnd = pMid;
                        p = pMid;
                        d = dMid;
                    } else {
                        pStart = pMid;
                    }
                }
                
                if (d < 0.0) {
                    vec3 normal = getClipNormal(p, true);
                    vec4 color = getGradientColor(p, true, planeN, planeD);
                    return ClipMarchResult(length(p - ro), true, true, normal, color);
                }
            }
        }
        
        // Consistent stepping with minimum guarantee
        float stepSize = max(MIN_STEP, surfaceDist * STEP_SCALE);
        depth += stepSize;
        
        if (depth > MAX_DIST) break;
    }
    
    return ClipMarchResult(MAX_DIST, false, false, vec3(0.0), vec4(0.0));
}

#endif // RENDER_TRUE_CLIPPING_GLSL
