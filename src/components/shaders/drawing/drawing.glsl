#ifndef DRAWING_GLSL
#define DRAWING_GLSL

#include "../utils/constants.glsl"
#include "../implicits/implicit.glsl"
#include "../implicits/colorImplicit.glsl"

//======================================
// DRAWING FUNCTIONS
//======================================

// Simple SDF functions for mesh mode
float sdfGyroid(vec3 p, float scale) {
    p *= scale;
    return abs(sin(p.x)*cos(p.y) + sin(p.y)*cos(p.z) + sin(p.z)*cos(p.x)) - u_thickness;
}

float sdfSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdfBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdfTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float sdfWaves(vec3 p, float scale) {
    p *= scale;
    return 0.5 * (
        sin(p.x) * sin(p.z) * 0.5 +
        sin(p.x * 0.4 + p.z * 0.5) * 0.7 +
        sin(length(p.xz) * 0.5) * 0.2
    );
}

// Mesh mode SDF function
float mapSdf(vec3 p) {
    // Apply time-based animation
    float timeOffset = u_time * 0.0;
    p.x += sin(timeOffset) * 0.2;
    p.y += cos(timeOffset) * 0.2;

    // Apply position offset
    p.x -= u_posX;
    p.y -= u_posY;
    p.z -= u_posZ;

    if (u_sdfType == 0) {
        return sdfGyroid(p, 5.0 * u_scale);
    } else if (u_sdfType == 1) {
        return sdfSphere(p, u_scale * 0.5);
    } else if (u_sdfType == 2) {
        return sdfBox(p, vec3(u_scale * 0.4));
    } else if (u_sdfType == 3) {
        return sdfTorus(p, vec2(0.5 * u_scale, 0.2 * u_scale));
    } else {
        return sdfWaves(p, 6.0 * u_scale);
    }
}

float mix11(float a, float b, float t) {
    return mix(a, b, t * 0.5 + 0.5);
}

float Dot(vec3 a, vec3 b) {
float _Dot_002 = a.x * b.x + a.y * b.y;
return _Dot_002 + a.z * b.z;
}

mat3 RotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, -s, 0.0),
        vec3(s, c, 0.0),
        vec3(0.0, 0.0, 1.0)
    );
}

vec3 RotateX(vec3 p, float a) {
    float sa = sin(a);
    float ca = cos(a);
    return vec3(p.x, -sa * p.y + ca * p.z, ca * p.y + sa * p.z);
}
vec3 RotateY(vec3 p, float a) {
    float sa = sin(a);
    float ca = cos(a);
    return vec3(ca * p.x + sa * p.z, p.y, -sa * p.x + ca * p.z);
}
vec3 RotateZ(vec3 p, float a) {
    float sa = sin(a);
    float ca = cos(a);
    return vec3(ca * p.x + sa * p.y, -sa * p.x + ca * p.y, p.z);
}

// Helper function to get just the SDF distance for raymarching mode
float getRaymarchDistance(vec3 p) {
    return map(p).Distance;
}

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

vec4 DrawVectorField(vec3 p, ColorImplicit iImplicit, float iSpacing, float iLineHalfThick, vec4 iColor)
{
    vec2 spacingVec = vec2(iSpacing);
    vec2 param = mod(p.xy, spacingVec);
    vec2 center = p.xy - param + 0.5 * spacingVec;
    vec2 toCenter = p.xy - center;

    float gradParam = dot(toCenter, iImplicit.Gradient.xy) / length(iImplicit.Gradient);
    float gradLength = length(iImplicit.Gradient);

    float circleSizeFactor = max(length(iImplicit.Gradient.xy) / gradLength, 0.2);
    bool isInCircle = length(p.xy - center) < iSpacing * 0.45 * circleSizeFactor;
    bool isNearLine = abs(dot(toCenter, vec2(-iImplicit.Gradient.y, iImplicit.Gradient.x))) / gradLength < iLineHalfThick + (-gradParam + iSpacing * 0.5) * 0.125;

    if (isInCircle && isNearLine)
        return vec4(iColor.rgb * 0.5, 1.0);

    return iColor;
}

vec4 strokeImplicit(ColorImplicit a, float width, vec4 base) {
    float interp = clamp(width * 0.5 - abs(a.Distance) / length(a.Gradient), 0.0, 1.0);
    return mix(base, a.Color, a.Color.a * interp);
}

vec4 drawImplicit(ColorImplicit a, vec4 base) {
    vec4 colorWarm = vec4(1.0, 0.4, 0.2, 1.0);
    vec4 colorCool = vec4(0.2, 0.4, 1.0, 1.0);
    float falloff = 100.0;
    float bandWidth = 20.0;
    float widthThin = 2.0;
    float widthThick = 4.0;

    vec4 color = a.Distance > 0.0 ? colorWarm : colorCool;
    vec4 opColor = mix(base, color, 0.1);
    ColorImplicit wave = TriangleWaveEvenPositive(a, bandWidth);

    wave.Color.a = max(0.2, 1.0 - abs(a.Distance) / falloff);
    opColor = strokeImplicit(wave, widthThin, opColor);
    opColor = strokeImplicit(a, widthThick, opColor);

    return opColor;
}

// Helper function for turboImplicit
vec4 breeze4(float t) {
    vec3 c0 = vec3(0.0, 0.0, 0.0);
    vec3 c1 = vec3(0.0, 0.0, 1.0);
    vec3 c2 = vec3(0.0, 1.0, 1.0);
    vec3 c3 = vec3(0.0, 1.0, 0.0);
    vec3 c4 = vec3(1.0, 1.0, 0.0);
    vec3 c5 = vec3(1.0, 0.0, 0.0);

    float x = clamp(t, 0.0, 1.0);
    float x2 = x * 5.0;
    int i = int(x2);
    float f = fract(x2);

    vec3 color;
    if (i == 0) color = mix(c0, c1, f);
    else if (i == 1) color = mix(c1, c2, f);
    else if (i == 2) color = mix(c2, c3, f);
    else if (i == 3) color = mix(c3, c4, f);
    else color = mix(c4, c5, f);

    return vec4(color, 1.0);
}

vec4 turboImplicit(ColorImplicit a, float range) {
    float widthThin = 2.0;
    float halfrange = range * 0.5;
    vec4 opColor = breeze4(abs(mod(a.Distance, range) - halfrange) / halfrange);

    ColorImplicit wave = TriangleWaveEvenPositive(a, range * 0.05);
    opColor = strokeImplicit(wave, widthThin, opColor);

    return opColor;
}

vec4 colorDerivative(ColorImplicit a, vec4 base) {
    vec4 colorWarm = vec4(1.0, 0.4, 0.2, 1.0);
    vec4 colorCool = vec4(0.2, 0.4, 1.0, 1.0);
    float widthThin = 2.0;

    vec4 opColor = mix(base, mix(colorCool, colorWarm, -a.Distance), 0.1);
    ColorImplicit wave = TriangleWaveEvenPositive(a, 0.1);

    opColor = strokeImplicit(wave, widthThin, opColor);

    return opColor;
}

vec4 drawLine(ColorImplicit a, vec4 base) {
ColorImplicit line = a;
line.Color.a = 0.75;
return strokeImplicit(line, 2.0, base);
}

vec4 fillImplicit(ColorImplicit a, vec4 base) {
    float interp = 0.5 - clamp(a.Distance / length(a.Gradient), -0.5, 0.5);
    return mix(base, a.Color, a.Color.a * interp);
}

// Arrow visualization constants
float arrowRadius = 8.0;
float arrowSize = 30.0;

vec4 drawArrow(vec2 p, vec2 startPt, vec2 endPt, vec4 color, vec4 base) {
    vec2 delta = startPt - endPt;
    vec2 arrowNormal = vec2(delta.y, -delta.x);
    Implicit arrowSpine = Plane(p, endPt, arrowNormal);
    mat2 arrowSideRotation = Rotate2D(PI / 12.0);

    Implicit tip1 = Plane(p, endPt, -arrowNormal * arrowSideRotation);
    Implicit tip2 = Plane(p, endPt, arrowNormal * inverse(arrowSideRotation));
    Implicit tipMax = Max(tip1, tip2);

    vec2 spineDir = normalize(delta);
    vec2 arrowBackPt = endPt + arrowSize * spineDir;
    vec2 arrowTailPt = startPt;

    Implicit backPlane = Plane(p, arrowBackPt, delta);
    tipMax = Max(tipMax, backPlane);

    Implicit spineBound = Shell(Plane(p, 0.5 * (arrowBackPt + arrowTailPt), spineDir), length(arrowBackPt - arrowTailPt), 0.0);

    // Convert to ColorImplicit before stroking/filling
    ColorImplicit spineColor = ColorImplicit(arrowSpine.Distance, arrowSpine.Gradient, color);
    ColorImplicit tipColor = ColorImplicit(tipMax.Distance, tipMax.Gradient, color);

    if (spineBound.Distance < 0.0 && dot(spineDir, arrowBackPt - arrowTailPt) < 0.0)
        base = strokeImplicit(spineColor, 4.0, base);

    return fillImplicit(tipColor, base);
}

//======================================
// SDF SLICER
//======================================

// Helper function to convert degrees to radians
float degToRad(float degrees) {
    return degrees * PI / 180.0;
}

// Get rotation matrices
mat3 rotationMatrixX(float angle) {
    float rad = degToRad(angle);
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

mat3 rotationMatrixY(float angle) {
    float rad = degToRad(angle);
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

mat3 rotationMatrixZ(float angle) {
    float rad = degToRad(angle);
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

// Calculate plane normal based on rotation angles
vec3 calculatePlaneNormal(float rotX, float rotY, float rotZ) {
    // Start with default normal (0,0,1)
    vec3 normal = vec3(0.0, 0.0, 1.0);
    
    // Apply rotations in Z-Y-X order
    normal = rotationMatrixZ(rotZ) * normal;
    normal = rotationMatrixY(rotY) * normal;
    normal = rotationMatrixX(rotX) * normal;
    
    return normalize(normal);
}

// Check if a point is beyond the cutting plane
bool isBeyondCuttingPlane(vec3 p, vec3 planeNormal, float cutPosition) {
    float dotProduct = dot(p, normalize(planeNormal));
    return dotProduct < cutPosition;
}

// Distance to cutting plane (signed)
float distanceToCuttingPlane(vec3 p, vec3 planeNormal, float cutPosition) {
    return dot(p, normalize(planeNormal)) - cutPosition;
}

// Calculate normal using the gradient of the SDF
vec3 getNormal(vec3 p, bool isInside) {
    const float h = 0.001;
    vec2 k = vec2(1.0, -1.0);
    
    // For exterior points, calculate normal as usual
    if (!isInside) {
        float px = map(p + vec3(h, 0.0, 0.0));
        float nx = map(p - vec3(h, 0.0, 0.0));
        float py = map(p + vec3(0.0, h, 0.0));
        float ny = map(p - vec3(0.0, h, 0.0));
        float pz = map(p + vec3(0.0, 0.0, h));
        float nz = map(p - vec3(0.0, 0.0, h));
        
        return normalize(vec3(
            px - nx,
            py - ny,
            pz - nz
        ));
    } 
    // For interior points, invert the normal
    else {
        float px = map(p + vec3(h, 0.0, 0.0));
        float nx = map(p - vec3(h, 0.0, 0.0));
        float py = map(p + vec3(0.0, h, 0.0));
        float ny = map(p - vec3(0.0, h, 0.0));
        float pz = map(p + vec3(0.0, 0.0, h));
        float nz = map(p - vec3(0.0, 0.0, h));
        
        return -normalize(vec3(
            px - nx,
            py - ny,
            pz - nz
        ));
    }
}

// Apply Phong shading
vec3 phongShading(vec3 point, vec3 normal, vec3 viewDirection, bool isInside) {
    // Light position
    vec3 lightPosition = vec3(2.0, 2.0, 2.0);

    // Light parameters
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    float ambientStrength = 0.2;
    float specularStrength = 0.5;
    float shininess = 32.0;

    // Material colors
    vec3 outsideColor = vec3(0.8, 0.6, 0.2); // gold
    vec3 insideColor = vec3(0.4, 0.3, 0.1);   // Dark gold

    vec3 materialColor = isInside ? insideColor : outsideColor;

    // Ambient light
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse light
    vec3 lightDirection = normalize(lightPosition - point);
    float diff = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = diff * lightColor;

    // Specular light
    vec3 reflectDir = reflect(-lightDirection, normal);
    float spec = pow(max(dot(viewDirection, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;

    // Combine all lighting components
    vec3 result = (ambient + diffuse + specular) * materialColor;
    return result;
}

// Calculate plane color with enhanced edge highlight
vec3 getPlaneColor(vec3 p, vec3 planeNormal, float cutPosition) {
    // Base plane color (semi-transparent gold to match torus)
    vec3 baseColor = vec3(0.8, 0.6, 0.2) * 0.3;
    
    // Calculate distance to the shape
    float shapeDist = map(p);
    
    // Highlight edges - create a glow effect near the intersection
    float edgeHighlight = smoothstep(0.05, 0.0, abs(shapeDist));
    vec3 highlightColor = vec3(1.0, 0.9, 0.5); // Brighter gold for highlight
    
    // Mix base color with highlight
    return mix(baseColor, highlightColor, edgeHighlight * 0.7);
}

// Structure for storing march results
struct MarchResult {
    float Distance;
    bool isInside;
    bool hitSomething;
    bool hitPlane;
    float planeSurfaceDistance; // Distance to the nearest surface at plane intersection
};

// Binary search refinement for exact plane intersection
float refineIntersection(vec3 ro, vec3 rd, float t0, float t1, vec3 planeNormal, float cutPosition) {
    float t = t0;
    // Binary search for more accurate intersection
    for (int i = 0; i < BINARY_SEARCH_STEPS; i++) {
        float mid = (t0 + t1) * 0.5;
        vec3 p = ro + rd * mid;
        if (isBeyondCuttingPlane(p, planeNormal, cutPosition)) {
            t0 = mid;
        } else {
            t1 = mid;
        }
    }
    return (t0 + t1) * 0.5;
}

// Adaptive step size based on distance to cutting plane
float getAdaptiveStepSize(float dist, float planeDist) {
    float baseStep = abs(dist) * 0.9; // Original step calculation
    float maxStep = 0.1; // Maximum allowed step size
    float planeProximity = exp(-abs(planeDist) * 10.0); // Exponential falloff near plane
    
    // Reduce step size when near the cutting plane
    return mix(baseStep, min(baseStep, 0.01), planeProximity);
}

// Enhanced raymarch function with improved cutting plane precision
MarchResult raymarch(vec3 ro, vec3 rd, vec3 planeNormal, float cutPosition, bool showPlane) {
    float depth = 0.0;
    bool isInside = false;
    bool hitPlane = false;
    float planeSurfaceDist = MAX_DIST;
    
    // Initial values for plane intersection binary search
    float lastBeforePlane = 0.0;
    float firstAfterPlane = MAX_DIST;
    bool crossedPlane = false;
    
    // Variables to track the nearest shape point near the cut plane
    float minDistNearPlane = MAX_DIST;
    
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * depth;
        
        // Calculate distance to the shape
        float shapeDist = map(p);
        
        // Is point inside the shape?
        isInside = shapeDist < 0.0;
        
        // Calculate distance to the cutting plane
        float planeDist = distanceToCuttingPlane(p, planeNormal, cutPosition);
        bool beyondPlane = planeDist < 0.0;
        
        // Track plane crossing for binary search refinement
        if (!crossedPlane && i > 0) {
            if (!beyondPlane) {
                lastBeforePlane = depth;
            } else if (lastBeforePlane > 0.0) {
                firstAfterPlane = depth;
                crossedPlane = true;
            }
        }
        
        // Track closest approach to shape near the plane
        if (abs(planeDist) < 0.05 && abs(shapeDist) < minDistNearPlane) {
            minDistNearPlane = abs(shapeDist);
            planeSurfaceDist = abs(shapeDist);
        }
        
        // If we're showing the plane and we're beyond it
        if (showPlane && beyondPlane) {
            // More precise check for plane intersection
            float distToPlane = abs(planeDist);
            if (distToPlane < PLANE_SURF_DIST) {
                // Refine the intersection point if we've crossed the plane
                if (crossedPlane) {
                    depth = refineIntersection(ro, rd, lastBeforePlane, firstAfterPlane, planeNormal, cutPosition);
                }
                return MarchResult(depth, false, true, true, planeSurfaceDist);
            }
        }
        
        // If we're beyond the plane, we'll ignore the shape hit
        if (beyondPlane) {
            // Use smaller steps near the cutting plane for better accuracy
            depth += max(0.005, abs(planeDist) * 0.3);
            continue;
        }
        
        // Check if we hit the shape surface
        if (abs(shapeDist) < SURF_DIST) {
            return MarchResult(depth, isInside, true, false, 0.0);
        }
        
        // Calculate adaptive step size
        float stepSize = getAdaptiveStepSize(shapeDist, planeDist);
        depth += stepSize;
        
        if (depth > MAX_DIST) break;
    }
    
    return MarchResult(MAX_DIST, false, false, false, MAX_DIST);
}

#endif // DRAWING_GLSL
