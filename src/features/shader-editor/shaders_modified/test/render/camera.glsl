#ifndef RENDER_CAMERA_GLSL
#define RENDER_CAMERA_GLSL

#include "../app/uniforms.glsl"

// Camera data structure
struct Camera {
    vec3 position;
    vec3 target;
    mat3 matrix;
};

// Create a camera from uniform values
Camera createCameraFromUniforms() {
    Camera camera;
    float camDist = 2.0;
    float camFOV = 1.5;
    
    // Convert mouse coordinates to spherical coordinates
    float theta = u_mouse_X;  // Horizontal rotation around Y axis
    float phi = u_mouse_Y;    // Vertical rotation
    phi = clamp(phi, -1.57, 1.57);  // Clamp to [-π/2, π/2] to prevent flipping
    
    // Camera position using spherical coordinates
    camera.position = vec3(
        camDist * cos(phi) * sin(theta),  // x = r * cos(φ) * sin(θ)
        camDist * cos(phi) * cos(theta),  // y = r * cos(φ) * cos(θ)
        camDist * sin(phi)                // z = r * sin(φ)
    );
    
    // Look at origin
    camera.target = vec3(0.0);
    
    // Camera matrix construction
    vec3 ww = normalize(camera.target - camera.position);
    vec3 uu = normalize(cross(ww, vec3(0.0, 0.0, 1.0)));
    vec3 vv = normalize(cross(uu, ww));
    camera.matrix = mat3(uu, vv, ww);
    
    return camera;
}

// Get ray direction for a pixel
vec3 getRayDirection(Camera camera, vec2 pixel) {
    vec2 p = (2.0 * pixel - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    return normalize(p.x * camera.matrix[0] + p.y * camera.matrix[1] + 1.5 * camera.matrix[2]);
}

#endif // RENDER_CAMERA_GLSL
