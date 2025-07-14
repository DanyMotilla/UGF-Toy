#ifndef FRAGMENT_GLSL
#define FRAGMENT_GLSL

#include "./drawing/drawing.glsl"

// Raymarching structure to hold both distance and color
struct RayHit {
    float distance;
    vec4 color;
    vec3 position;
    vec3 normal;
};

const float MAX_DIST = 20.0;

// Cast ray and return hit information
RayHit castRay(vec3 ro, vec3 rd) {
    float t = 0.0;
    float precis = 0.0001;
    
    vec3 pos;
    ColorImplicit hit;
    
    for(int i=0; i<256; i++) {
        pos = ro + t*rd;
        hit = mapColor(pos);
        if(hit.Distance < precis || t > MAX_DIST) break;
        t += hit.Distance * 0.35;
    }
    
    RayHit result;
    result.distance = t;
    result.position = pos;
    result.color = hit.Color;
    
    // Calculate normal
    float eps = 0.0001;
    vec3 e = vec3(eps, 0.0, 0.0);
    vec3 normal = vec3(
        mapColor(pos + e.xyz).Distance - mapColor(pos - e.xyz).Distance,
        mapColor(pos + e.yxz).Distance - mapColor(pos - e.yxz).Distance,
        mapColor(pos + e.yzx).Distance - mapColor(pos - e.yzx).Distance
    );
    result.normal = normalize(normal);
    
    return result;
}

void main() {
    if (u_mode == 0) { // Raymarching Mode
        vec2 resolution = u_resolution;
        // Normalize coordinates to [-1, 1] range, maintaining aspect ratio
        vec2 p = (2.0 * gl_FragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);
        
        // Camera controls with mouse rotation
        float camDist = 2.0;  // Increased distance for better view
        float camFOV = 1.5;
        
        // Convert mouse coordinates to spherical coordinates
        float theta = u_mouse_X;  // Horizontal rotation around Y axis
        float phi = u_mouse_Y;    // Vertical rotation
        phi = clamp(phi, -1.57, 1.57);  // Clamp to [-π/2, π/2] to prevent flipping
        
        // Camera position using spherical coordinates
        // We swap Y and Z to get a side view by default
        vec3 ro = vec3(
            camDist * cos(phi) * sin(theta),  // x = r * cos(φ) * sin(θ)
            camDist * cos(phi) * cos(theta),  // y = r * cos(φ) * cos(θ)
            camDist * sin(phi)                // z = r * sin(φ)
        );

        // Look at origin
        vec3 ta = vec3(0.0, 0.0, 0.0);
        
        // Camera matrix construction
        vec3 ww = normalize(ta - ro);
        vec3 uu = normalize(cross(ww, vec3(0.0, 0.0, 1.0)));
        vec3 vv = normalize(cross(uu, ww));

        // Create view ray
        vec3 rd = normalize(p.x*uu + p.y*vv + camFOV*ww);

        // Raymarch
        RayHit hit = castRay(ro, rd);
        
        vec4 col = vec4(0.156862745); // Default background color
        
        // If we hit something
        if(hit.distance < MAX_DIST) {
            // Get the color from the hit
            col = hit.color;
            
            // Basic lighting
            vec3 light = normalize(vec3(1.0, 1.0, 1.0));
            float diff = clamp(dot(hit.normal, light), 0.1, 1.0);
            
            // Apply lighting to RGB components
            col.rgb *= diff;
        }
        
        gl_FragColor = col;
    }
    else if (u_mode == 1) { // Mesh Mode
        vec3 viewDir = normalize(-vPosition);
        vec3 normal = normalize(vNormal);
        
        // Basic lighting
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        float diff = clamp(dot(normal, light), 0.1, 1.0);
        
        // Material properties
        vec3 albedo = vec3(0.8, 0.2, 0.2); // Red color
        
        // Final color
        vec3 col = albedo * diff;
        gl_FragColor = vec4(col, 1.0);
    }
    else { // Drawing Mode
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}

#endif // FRAGMENT_GLSL
