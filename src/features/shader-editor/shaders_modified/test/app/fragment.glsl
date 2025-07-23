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
    
    // Raymarch
    RayHit hit = castRay(camera.position, rd);
    
    vec4 col = vec4(0.156862745, 0.156862745, 0.156862745, 1.0); // Default background color (Gruvbox dark)
    
    // If we hit something
    if(hit.distance < MAX_DIST) {
        col = hit.color;
        
        // Basic lighting
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        float diff = clamp(dot(hit.normal, light), 0.1, 1.0);
        
        // Apply lighting to RGB components
        col.rgb *= diff;
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
