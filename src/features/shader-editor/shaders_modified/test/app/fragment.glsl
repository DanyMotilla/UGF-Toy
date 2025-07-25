#ifndef FRAGMENT_GLSL
#define FRAGMENT_GLSL

// 1. Base definitions (no dependencies)
#include "../implicit/types.glsl"
#include "../core/constants.glsl"
#include "../core/math.glsl"
#include "uniforms.glsl"

// 2. Level 1 (depends on base)
#include "../implicit/operations.glsl"
#include "../color_implicit/types.glsl"

// 3. Level 2 (depends on level 1)
#include "../implicit/primitives.glsl"
#include "../render/raymarching.glsl"

// 4. Level 3 (depends on level 2)
#include "../implicit/modifiers.glsl"
#include "../color_implicit/visualization.glsl"

// 5. High-level features
#include "../implicit/evaluation.glsl"
#include "../render/camera.glsl"
#include "../render/lighting.glsl"
#include "../render/effects.glsl"
#include "../render/cutting_plane.glsl"

// Drawing mode handler
vec4 handleDrawingMode(vec2 fragCoord) {
    vec3 p = vec3(fragCoord.xy / u_resolution.xy, 0.0);
    p = p * 2.0 - 1.0; // Convert to [-1,1] range
    p.x *= u_resolution.x/u_resolution.y; // Aspect ratio correction
    
    // Get the implicit field
    ColorImplicit field = mapColor(vec3(p.xy * u_scale, 0.0));
    
    // Base color
    vec4 baseColor = vec4(0.1, 0.1, 0.1, 1.0);
    
    // Apply visualization based on mode
    if (u_visualMode == 0) { // Normal
        return drawImplicit(field, baseColor);
    } else if (u_visualMode == 1) { // Turbo
        return turboImplicit(field, 0.1);
    } else if (u_visualMode == 2) { // Derivative
        return colorDerivative(field, baseColor);
    } else { // Vector field
        return DrawVectorField(vec3(p.xy, 0.0), field, 0.2, 0.002, baseColor);
    }
}

// Handle raymarching mode
vec4 handleRaymarchingMode(vec2 fragCoord) {
    // Create camera from uniforms
    Camera camera = createCameraFromUniforms();
    
    // Get ray direction for this pixel
    vec3 rd = getRayDirection(camera, fragCoord);
    
    // Default background color (Gruvbox dark)
    vec4 col = vec4(0.156862745, 0.156862745, 0.156862745, 1.0);
    
    // Cutting plane setup
    vec3 planeN = getPlaneNormal(u_plane_rotX, u_plane_rotY, u_plane_rotZ);
    float planeD = u_plane_dist;
    
    // Check for plane intersection
    float t = intersectPlane(camera.position, rd, planeN, planeD);
    
    if (t > 0.0) {
        vec3 p = camera.position + rd * t;
        
        // Plane-local basis
        vec3 u = normalize(cross(planeN, vec3(0.0, 1.0, 0.0)));
        if (length(u) < 0.01) u = normalize(cross(planeN, vec3(1.0, 0.0, 0.0)));
        vec3 v = cross(planeN, u);
        vec2 localPlanePos = vec2(dot(p, u), dot(p, v));
        
        // Rectangle bounds
        vec2 planeBounds = vec2(1.5, 1.0); // half-width and half-height
        if (abs(localPlanePos.x) <= planeBounds.x && abs(localPlanePos.y) <= planeBounds.y) {
            // Get field value and visualize with cutting plane
            ColorImplicit field = mapColor(p);
            col = getCuttingPlaneColor(p, field);
        }
    }
    
    // Raymarch for the object
    RayHit hit = castRay(camera.position, rd);
    
    // If we hit something
    if(hit.distance < MAX_DIST) {
        vec4 objectCol = hit.color;
        
        // Basic lighting
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        float diff = clamp(dot(hit.normal, light), 0.1, 1.0);
        
        // Apply lighting to RGB components
        objectCol.rgb *= diff;
        
        // Mix with plane color if it exists
        if (t > 0.0) {
            col = mix(col, objectCol, 0.3);
        } else {
            col = objectCol;
        }
    }
    
    return col;
}

// Handle mesh mode
vec4 handleMeshMode() {
    vec3 viewDir = normalize(-vPosition);
    vec3 normal = normalize(vNormal);
    
    // Basic lighting
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float diff = clamp(dot(normal, light), 0.1, 1.0);
    
    // Material properties
    vec3 albedo = vec3(0.8, 0.2, 0.2); // Red color
    
    // Final color
    vec3 col = albedo * diff;
    return vec4(col, 1.0);
}

void main() {
    if (u_mode == 0) { // Raymarching Mode
        gl_FragColor = handleRaymarchingMode(gl_FragCoord.xy);
    }
    else if (u_mode == 1) { // Mesh Mode
        gl_FragColor = handleMeshMode();
    }
    else { // Drawing Mode
        gl_FragColor = handleDrawingMode(gl_FragCoord.xy);
    }
}

#endif // FRAGMENT_GLSL
