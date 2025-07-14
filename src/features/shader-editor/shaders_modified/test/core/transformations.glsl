// Functions: 12 functions

// From: drawing.glsl:85 - fixed sign error
vec3 RotateX(vec3 p, float a) {
    float sa = sin(a);
    float ca = cos(a);
    return vec3(p.x, ca * p.y - sa * p.z, sa * p.y + ca * p.z);
}

// From: drawing.glsl:90
vec3 RotateY(vec3 p, float a) {
    float sa = sin(a);
    float ca = cos(a);
    return vec3(ca * p.x + sa * p.z, p.y, -sa * p.x + ca * p.z);
}

// From: drawing.glsl:95
vec3 RotateZ(vec3 p, float a) {
    float sa = sin(a);
    float ca = cos(a);
    return vec3(ca * p.x + sa * p.y, -sa * p.x + ca * p.y, p.z);
}

// From: implicit.glsl:608
vec3 rotateX(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(
        p.x,
        c * p.y - s * p.z,
        s * p.y + c * p.z
    );
}

// From: implicit.glsl:618
vec3 rotateY(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(
        c * p.x + s * p.z,
        p.y,
        -s * p.x + c * p.z
    );
}

// From: implicit.glsl - Missing rotateZ to match rotateX and rotateY style
vec3 rotateZ(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(
        c * p.x - s * p.y,
        s * p.x + c * p.y,
        p.z    
    );
}

// From: constants.glsl:63
mat2 Rotate2D(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}


// From: drawing.glsl - Missing RotateX and RotateY matrix versions to match RotateZ
mat3 RotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, c, -s),
        vec3(0.0, s, c)
    );
} 

mat3 RotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, 0.0, s),
        vec3(0.0, 1.0, 0.0),
        vec3(-s, 0.0, c)
    );
} 

// From: drawing.glsl:75
mat3 RotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, -s, 0.0),
        vec3(s, c, 0.0),
        vec3(0.0, 0.0, 1.0)
    );
}

// NEW: Quaternions

// Quaternion-based rotation (more efficient for multiple rotations)
vec3 rotateByQuaternion(vec3 v, vec4 q) {
    vec3 qvec = q.xyz;
    vec3 uv = cross(qvec, v);
    vec3 uuv = cross(qvec, uv);
    return v + 2.0 * (q.w * uv + uuv);
}

// Convert Euler angles to quaternion
vec4 eulerToQuaternion(vec3 euler) {
    vec3 c = cos(euler * 0.5);
    vec3 s = sin(euler * 0.5);

    return vec4(
        s.x * c.y * c.z - c.x * s.y * s.z,    
        c.x * s.y * c.z + s.x * c.y * s.z,    
        c.x * c.y * s.z - s.x * s.y * c.z,    
        c.x * c.y * c.z + s.x * s.y * s.z    
    );
}
