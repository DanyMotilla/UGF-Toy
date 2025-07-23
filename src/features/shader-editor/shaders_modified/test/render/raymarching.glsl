#ifndef RENDER_RAYMARCHING_GLSL
#define RENDER_RAYMARCHING_GLSL

#include "../implicit/types.glsl"
#include "../color_implicit/types.glsl"

// Constants
#define MAX_STEPS 256
#define MAX_DIST 100.0
#define SURFACE_DIST 0.001

// Result struct for ray hits
struct RayHit {
    float distance;
    vec4 color;
    vec3 position;
    vec3 normal;
};

// Forward declarations
ColorImplicit mapColor(vec3 p);  // To be implemented by the user

// Sphere SDF
Implicit Sphere(vec3 p, vec3 center, float radius) {
    vec3 offset = p - center;
    float dist = length(offset) - radius;
    vec3 grad = normalize(offset);
    return Implicit(dist, grad);
}

// Get distance for raymarching
float getRaymarchDistance(vec3 p) {
    return Sphere(p, vec3(0.0), 0.5).Distance;
}

// Cast a ray and return hit information
RayHit castRay(vec3 ro, vec3 rd) {
    float t = 0.0;
    float precis = SURFACE_DIST;
    
    vec3 pos;
    ColorImplicit hit;
    
    // Raymarching loop
    for(int i=0; i<MAX_STEPS; i++) {
        pos = ro + t*rd;
        hit = mapColor(pos);
        if(hit.Distance < precis || t > MAX_DIST) break;
        t += hit.Distance * 0.35; // Use smaller step size for better quality
    }
    
    RayHit result;
    result.distance = t;
    result.position = pos;
    result.color = hit.Color;
    
    // Calculate normal using central differences
    vec2 e = vec2(SURFACE_DIST, 0.0);
    result.normal = normalize(vec3(
        mapColor(pos + e.xyy).Distance - mapColor(pos - e.xyy).Distance,
        mapColor(pos + e.yxy).Distance - mapColor(pos - e.yxy).Distance,
        mapColor(pos + e.yyx).Distance - mapColor(pos - e.yyx).Distance
    ));
    
    return result;
}

#endif // RENDER_RAYMARCHING_GLSL

