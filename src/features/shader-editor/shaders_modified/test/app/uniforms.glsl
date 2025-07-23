#ifndef UNIFORMS_GLSL
#define UNIFORMS_GLSL

//======================================
// UNIFORMS
//======================================
// Base uniforms
uniform float u_time;
uniform float u_scale;
uniform float u_posX;
uniform float u_posY;
uniform float u_posZ;
uniform float u_effectStrength;
uniform float u_rotation_speed;
uniform float u_contrast;
uniform int u_effectType;
uniform int u_sdfType;
uniform int u_mode;
uniform int u_visualMode; // 0: Normal, 1: Turbo, 2: Derivative, 3: Vector Field
uniform float u_thickness;
uniform vec4 u_color;

// Modifiers uniforms
uniform float u_bias;
uniform float u_drop_xy;
uniform float u_drop_yz;
uniform float u_drop_zx;
uniform float u_sdf_thickness;
uniform float u_size_x;
uniform float u_size_y;
uniform float u_size_z;
uniform vec2 u_resolution;
uniform vec3 u_cameraPos;

// Mouse control uniforms
uniform float u_mouse_X;
uniform float u_mouse_Y;

// Raymarching uniforms
uniform float u_raymarchSteps;
uniform float u_raymarchEpsilon;
uniform float u_count;
uniform int u_variantIndex;

//======================================
// VARYINGS
//======================================
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

//======================================
// CONSTANTS
//======================================
#include "../core/constants.glsl"
const float SQRT2 = 1.41421356237;
const float SQRT3 = 1.73205080757;
const float MAX_DIST = 20.0;

#endif // UNIFORMS_GLSL
