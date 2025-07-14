#ifndef MODELER_GLSL
#define MODELER_GLSL
//======================================
// UTILITY FUNCTIONS
//======================================
vec3 rotate(vec3 p, vec3 r) {
    float cosX = cos(r.x);
    float sinX = sin(r.x);
    float cosY = cos(r.y);
    float sinY = sin(r.y);
    float cosZ = cos(r.z);
    float sinZ = sin(r.z);
    vec3 pX = vec3(p.x, p.y * cosX - p.z * sinX, p.y * sinX + p.z * cosX);
    vec3 pXY = vec3(pX.x * cosY + pX.z * sinY, pX.y, -pX.x * sinY + pX.z * cosY);
    return vec3(pXY.x * cosZ - pXY.y * sinZ, pXY.x * sinZ + pXY.y * cosZ, pXY.z);
}
//======================================
// SDF PRIMITIVE FUNCTIONS
//======================================
ColorImplicit sdBox(vec3 p, vec3 size, vec4 color) {
    vec3 d = abs(p) - size * 0.5;
    float dist = min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
    return CreateColorImplicit(CreateImplicit(dist), color);
}
ColorImplicit sdBeveledBox(vec3 p, vec3 size, float r, vec4 color) {
    vec3 d = abs(p) - size * 0.5 + r;
    float dist = min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0)) - r;
    return CreateColorImplicit(CreateImplicit(dist), color);
}
ColorImplicit sdChamferedBox(vec3 p, vec3 size, float c, vec4 color) {
    vec3 d = abs(p) - size * 0.5;
    float dist = min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
    // Simple chamfer approximation
    dist = max(dist, -(max(max(d.x + d.y, d.x + d.z), d.y + d.z) - c));
    return CreateColorImplicit(CreateImplicit(dist), color);
}
ColorImplicit sdCylinder(vec3 p, float r, float h, vec4 color) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h * 0.5);
    float dist = min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
    return CreateColorImplicit(CreateImplicit(dist), color);
}
ColorImplicit sdSphere(vec3 p, float r, vec4 color) {
    return CreateColorImplicit(CreateImplicit(length(p) - r), color);
}
ColorImplicit sdf_base(vec3 p) {
    return sdBox(p - vec3(0, 0, 0), vec3(1, 1, 1), vec4(0.8, 0.2, 0.2, 1.0));
}
ColorImplicit sdf_step1(vec3 p) {
    ColorImplicit temp = sdf_base(p);
    // Chamfer operation on edge 1 with distance 0.3 using plane cut
    ColorImplicit chamfer_plane = CreateColorImplicit(CreateImplicit(0.707 * (p.y + p.z) + 0.407), vec4(1,1,1,1));
    temp = Subtract(temp, chamfer_plane);
    return temp;
}
ColorImplicit sdf_step2(vec3 p) {
    ColorImplicit temp = sdf_step1(p);
    // Chamfer operation on edge 3 with distance 0.3 using plane cut
    ColorImplicit chamfer_plane = CreateColorImplicit(CreateImplicit(0.707 * (-p.y + p.z) + 0.407), vec4(1,1,1,1));
    temp = Subtract(temp, chamfer_plane);
    return temp;
}
ColorImplicit sdf_step3(vec3 p) {
    ColorImplicit temp = sdf_step2(p);
    // Chamfer operation on edge 9 with distance 0.3 using plane cut
    ColorImplicit chamfer_plane = CreateColorImplicit(CreateImplicit(0.707 * (p.x + p.y) + 0.407), vec4(1,1,1,1));
    temp = Subtract(temp, chamfer_plane);
    return temp;
}
//======================================
// MAIN MODELING FUNCTION
//======================================
ColorImplicit modelSDF(vec3 p) {
    return sdf_step3(p);
}
// For raymarching
Implicit map(vec3 p) {
    return ToImplicit(modelSDF(p));
}
// For color
ColorImplicit mapColor(vec3 p) {
    return modelSDF(p);
}
#endif // MODELER_GLSL
