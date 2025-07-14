#ifndef RENDER_LIGHTING_GLSL
#define RENDER_LIGHTING_GLSL

#include "../core/math.glsl"
#include "../implicit/types.glsl"
#include "raymarching.glsl"

// Lighting data structure
struct Light {
    vec3 position;
    vec3 color;
    float intensity;
};

// Create a directional light
Light createLight(vec3 direction, vec3 color, float intensity) {
    Light light;
    light.position = normalize(direction);  // For directional lights, position is the direction
    light.color = color;
    light.intensity = intensity;
    return light;
}

// Calculate normal at a point using central differences
vec3 calcNormal(in vec3 pos) {
    const float eps = 0.0002;  // Smaller epsilon for more precise normals
    const vec2 h = vec2(eps, 0.0);
    
    // Use central differences for more accurate normals
    return normalize(vec3(
        map(pos + h.xyy).Distance - map(pos - h.xyy).Distance,
        map(pos + h.yxy).Distance - map(pos - h.yxy).Distance,
        map(pos + h.yyx).Distance - map(pos - h.yyx).Distance
    ));
}

// From: drawing.glsl:138
float calcOcclusion(in vec3 pos, in vec3 nor) {
    float occ = 0.0;
    float sca = 1.0;
    
    // Increased samples and adjusted parameters
    for(int i=0; i<8; i++) {
        float hr = 0.02 + 0.2*float(i)/7.0;
        vec3 aopos = nor * hr + pos;
        float dd = getRaymarchDistance(aopos);
        occ += -(dd-hr)*sca;
        sca *= 0.85;  // Slower falloff
    }
    return clamp(1.0 - occ*1.0, 0.0, 1.0);  // Reduced strength multiplier
}

// From: drawing.glsl:118
float calcSoftshadow(in vec3 ro, in vec3 rd, float mint, float tmax) {
    float res = 1.0;
    float t = mint;
    float ph = 1e10; // Previous height
    
    for(int i=0; i<128; i++) {
        float h = getRaymarchDistance(ro + rd*t);
        
        // Improved shadow softness calculation
        float y = h*h/(2.0*ph);
        float d = sqrt(h*h-y*y);
        res = min(res, 10.0*d/max(0.0,t-y));
        ph = h;
        
        t += h * 0.5;  // Smaller step size for better quality
        if(res < 0.0001 || t > tmax) break;
    }
    return clamp(res, 0.0, 1.0);
}

// Apply lighting to a surface point
vec3 applyLighting(vec3 position, vec3 normal, vec3 viewDir, vec3 albedo, Light lights[3]) {
    vec3 ambient = vec3(0.3) * albedo;
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);
    
    for(int i = 0; i < 3; i++) {
        vec3 lightDir = lights[i].position;  // Already normalized for directional lights
        float diff = max(dot(normal, lightDir), 0.0);
        
        // Add diffuse contribution
        diffuse += lights[i].color * lights[i].intensity * diff * albedo;
        
        // Add specular contribution
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        specular += lights[i].color * lights[i].intensity * spec * 0.5;
        
        // Add soft shadows if enabled
        if (u_raymarchSteps > 0.0) {  // Use as a flag for shadow quality
            float shadow = calcSoftshadow(position + normal * 0.001, lightDir, 0.001, 2.0);
            diffuse *= shadow;
            specular *= shadow;
        }
    }
    
    // Add ambient occlusion if enabled
    float ao = 1.0;
    if (u_raymarchSteps > 0.0) {  // Use as a flag for AO quality
        ao = calcOcclusion(position, normal);
    }
    
    return (ambient + diffuse + specular) * ao;
}

#endif // RENDER_LIGHTING_GLSL
