export default `
    // Constants and basic types
    #define STANDALONE 0
    #define PI 3.14159265358979
    #define SQRT2 1.41421356237
    #define SQRT3 1.73205080757

    struct Implicit {
        float Distance;
        vec3 Gradient;
    };

    struct ColorImplicit {
        float Distance;
        vec3 Gradient;
        vec4 Color;
    };

    // Base uniforms
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform int u_mode;

    // Mesh mode uniforms
    uniform vec3 u_color;
    uniform float u_thickness;
    uniform int u_effectType;
    uniform int u_sdfType;
    uniform float u_effectStrength;
    uniform float u_contrast;
    uniform float u_scale;
    uniform float u_posX;
    uniform float u_posY;
    uniform float u_posZ;

    // Raymarching mode uniforms
    uniform vec3 u_cameraPos;
    uniform float u_raymarchSteps;
    uniform float u_raymarchEpsilon;
    uniform float u_count;
    uniform float u_size_x;
    uniform float u_size_y;
    uniform float u_size_z;
    uniform float u_sdf_thickness;
    uniform float u_bias;
    uniform float u_drop_yz;
    uniform float u_drop_zx;
    uniform float u_drop_xy;
    uniform int u_variantIndex;

    // Varyings
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

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

    // Raymarching mode structures and functions
    // Forward declarations
    Implicit map(vec3 p);

    // Basic construction functions
    Implicit CreateImplicit() { return Implicit(0.0, vec3(0.0)); }
    Implicit CreateImplicit(float iValue) { return Implicit(iValue, vec3(0.0)); }
    Implicit CreateImplicit(float iValue, vec3 iGradient){ return Implicit(iValue, iGradient); }

    ColorImplicit CreateColorImplicit(float iValue, vec3 iGradient, vec4 iColor) {
        return ColorImplicit(iValue, iGradient, iColor);
    }
    ColorImplicit CreateColorImplicit(Implicit iImplicit, vec4 iColor) {
        return ColorImplicit(iImplicit.Distance, iImplicit.Gradient, iColor);
    }


    Implicit Negate(Implicit iImplicit) {
        return Implicit(-iImplicit.Distance, -iImplicit.Gradient);
    }

    ColorImplicit Negate(ColorImplicit iColorImplicit) {
        return ColorImplicit(-iColorImplicit.Distance, -iColorImplicit.Gradient, iColorImplicit.Color);
    }

    Implicit Add(Implicit a, Implicit b) {
        return Implicit(a.Distance + b.Distance, a.Gradient + b.Gradient);
    }

    Implicit Add(Implicit a, float b) {
        return Implicit(a.Distance + b, a.Gradient);
    }


    ColorImplicit Add(Implicit a, Implicit b, vec4 colorA, vec4 colorB) {
        Implicit result = Add(a, b);
        return ColorImplicit(result.Distance, result.Gradient, mix(colorA, colorB, 0.5));
    }

    ColorImplicit Add(ColorImplicit a, float b) {
        return ColorImplicit(
            a.Distance + b,
            a.Gradient,
            a.Color
        );
    }

    Implicit Subtract(Implicit a, Implicit b, out float blendingRatio) {
        float total = a.Distance + b.Distance;
        blendingRatio = 0.5 + 0.5 * (b.Distance) / (total == 0.0 ? 1e-6 : total);
        return Implicit(a.Distance - b.Distance, a.Gradient - b.Gradient);
    }

    Implicit Subtract(Implicit a, Implicit b) {
        float unused;
        return Subtract(a, b, unused);
    }

    Implicit Subtract(Implicit a, float b) {
        return Implicit(a.Distance - b, a.Gradient);
    }

    Implicit Subtract(float a, Implicit b) {
        return Implicit(a - b.Distance, -b.Gradient);
    }

    ColorImplicit Subtract(Implicit a, Implicit b, vec4 colorA, vec4 colorB) {
        float blendingRatio;
        Implicit result = Subtract(a, b, blendingRatio);
        return ColorImplicit(result.Distance, result.Gradient, mix(colorA, colorB, blendingRatio));
    }

    Implicit Multiply(Implicit a, Implicit b) {
        return Implicit(a.Distance * b.Distance, a.Distance * b.Gradient + b.Distance * a.Gradient);
    }
    Implicit Multiply(float iT, Implicit iImplicit) {
        return Implicit(iT * iImplicit.Distance, iT * iImplicit.Gradient);
    }
    Implicit Multiply(Implicit iImplicit, float iT) { return Multiply(iT, iImplicit); }

    // NEW
    Implicit Square(Implicit iA) { return Multiply(iA, iA); }
    Implicit Square(float iA) { 
        Implicit a = CreateImplicit(iA);
        return Multiply(a, a); 
    }

    Implicit Divide(Implicit a, Implicit b) {
        return Implicit(a.Distance / b.Distance,
            (b.Distance * a.Gradient - a.Distance * b.Gradient) / (b.Distance * b.Distance));
    }
    Implicit Divide(Implicit a, float b) {
        return Implicit(a.Distance / b, a.Gradient / b);
    }
    Implicit Divide(float a, Implicit b) {
        return Divide(CreateImplicit(a), b);
    }

    // Min — standard overloads
    Implicit Min(Implicit a, Implicit b) {
        if (a.Distance <= b.Distance) {
            return a;
        } else {
            return b;
        }
    }

    Implicit Min(Implicit a, float b) { return Min(a, CreateImplicit(b)); }
    Implicit Min(float a, Implicit b) { return Min(CreateImplicit(a), b); }
    Implicit Min(Implicit a, Implicit b, Implicit c) { return Min(a, Min(b, c)); }
    Implicit Min(Implicit a, Implicit b, Implicit c, Implicit d) { return Min(a, Min(b, Min(c, d))); }

    // Min with color blend
    ColorImplicit Min(Implicit a, Implicit b, vec4 colorA, vec4 colorB) {
        float blendingRatio = a.Distance <= b.Distance ? 0.0 : 1.0;
        Implicit result = Min(a, b);
        return ColorImplicit(result.Distance, result.Gradient, mix(colorA, colorB, blendingRatio));
    }

    ColorImplicit Min(ColorImplicit a, ColorImplicit b) {
        if (a.Distance <= b.Distance)
            return a;

        return b;
    }

    // Max — standard overloads
    Implicit Max(Implicit a, Implicit b) {
        if (a.Distance >= b.Distance) {
            return a;
        } else {
            return b;
        }
    }

    Implicit Max(Implicit a, float b) { return Max(a, CreateImplicit(b)); }
    Implicit Max(float a, Implicit b) { return Max(CreateImplicit(a), b); }
    Implicit Max(Implicit a, Implicit b, Implicit c) { return Max(a, Max(b, c)); }
    Implicit Max(Implicit a, Implicit b, Implicit c, Implicit d) { return Max(a, Max(b, Max(c, d))); }

    // Max with color blend
    ColorImplicit Max(Implicit a, Implicit b, vec4 colorA, vec4 colorB) {
        float blendingRatio = a.Distance >= b.Distance ? 0.0 : 1.0;
        Implicit result = Max(a, b);
        return ColorImplicit(result.Distance, result.Gradient, mix(colorA, colorB, blendingRatio));
    }

    ColorImplicit Max(ColorImplicit a, ColorImplicit b) {
        if (a.Distance >= b.Distance)
            return a;

        return b;
    }

    Implicit Compare(Implicit iA, Implicit iB) {
        if (iA.Distance < iB.Distance) return CreateImplicit(-1.0);
        if (iA.Distance > iB.Distance) return CreateImplicit(1.0);
        return CreateImplicit(0.0);
    }

    Implicit Compare(Implicit iA, float iB) { return Compare(iA, CreateImplicit(iB)); }
    Implicit Compare(float iA, Implicit iB) { return Compare(CreateImplicit(iA), iB); }
    Implicit Compare(float iA, float iB) {
        return CreateImplicit(iA == iB ? 0.0 : (iA > iB ? 1.0 : -1.0));
    }

    Implicit Conditional(bool condition, Implicit shape1, Implicit shape2) {
        if (condition) {
            return shape1;
        } else {
            return shape2;
        }
    }
    // NEW
    float mix11(float a, float b, float t) {
        return mix(a, b, t * 0.5 + 0.5);
    }

    Implicit Exp(Implicit iImplicit) {
        float e = exp(iImplicit.Distance);
        return Implicit(e, e * iImplicit.Gradient);
    }
    Implicit Log(Implicit iImplicit) {
        return Implicit(log(iImplicit.Distance), iImplicit.Gradient / iImplicit.Distance);
    }
    Implicit Pow(Implicit iMantissa, Implicit iExponent) {
        float result = pow(iMantissa.Distance, iExponent.Distance);
        return Implicit(result, result * log(iMantissa.Distance) * iMantissa.Gradient);
    }
    Implicit Sqrt(Implicit iImplicit) {
        float s = sqrt(iImplicit.Distance);
        return Implicit(s, iImplicit.Gradient / (2.0 * s));
    }
    Implicit Abs(Implicit iImplicit) {
        return Implicit(abs(iImplicit.Distance), sign(iImplicit.Distance) * iImplicit.Gradient);
    }

    Implicit Mod(Implicit iImplicit, Implicit iM) {
        return Implicit(mod(iImplicit.Distance, iM.Distance), iImplicit.Gradient);  // TODO: fix gradient
    }
    Implicit Mod(Implicit iImplicit, float iM) {
        return Implicit(mod(iImplicit.Distance, iM), iImplicit.Gradient);  // TODO: fix gradient
    }

    Implicit Sin(Implicit iImplicit) {
        return Implicit(sin(iImplicit.Distance), cos(iImplicit.Distance) * iImplicit.Gradient);
    }

    Implicit Cos(Implicit iImplicit) {
        return Implicit(cos(iImplicit.Distance), -sin(iImplicit.Distance) * iImplicit.Gradient);
    }

    Implicit Tan(Implicit iImplicit) {
        float sec = 1. / cos(iImplicit.Distance);
        return Implicit(tan(iImplicit.Distance), sec * sec * iImplicit.Gradient);
    }

    Implicit Asin(Implicit iImplicit) {
        return Implicit(asin(iImplicit.Distance), iImplicit.Gradient / sqrt(1.0 - iImplicit.Distance * iImplicit.Distance));
    }

    Implicit Acos(Implicit iImplicit) {
        return Implicit(acos(iImplicit.Distance), -iImplicit.Gradient / sqrt(1.0 - iImplicit.Distance * iImplicit.Distance));
    }

    Implicit Atan(Implicit iImplicit) {
        return Implicit(atan(iImplicit.Distance), iImplicit.Gradient / (1.0 + iImplicit.Distance * iImplicit.Distance));
    }

    //NEW
    Implicit Atan(Implicit a, Implicit b) {
        float x = b.Distance;
        float y = a.Distance;
        float ir2 = 1.0 / (x * x + y * y);
        return Implicit(atan(y, x), vec3(-y * ir2, x * ir2, 0.0));
    }

    ColorImplicit Atan(ColorImplicit a, ColorImplicit b) {
        float x = b.Distance;
        float y = a.Distance;
        float ir2 = 1.0 / (x * x + y * y);

        float distance = atan(y, x);
        vec3 gradient = vec3(-y * ir2, x * ir2, 0.0);
        vec4 color = 0.5 * (a.Color + b.Color);

        return ColorImplicit(distance, gradient, color);
    }



    // Primitives

    // NEW

    Implicit Plane(vec3 p, vec3 origin, vec3 normal) {
        vec3 grad = normalize(normal);
        float v = dot(p - origin, grad);
        return Implicit(v, grad);
    }


    ColorImplicit Plane(vec3 p, vec3 origin, vec3 normal, vec4 color) {
        Implicit result = Plane(p, origin, normal);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }


    Implicit Plane(vec2 p, vec2 origin, vec2 normal) {
        return Plane(vec3(p, 0.0), vec3(origin, 0.0), vec3(normal, 0.0));
    }


    ColorImplicit Plane(vec2 p, vec2 origin, vec2 normal, vec4 color) {
        Implicit result = Plane(p, origin, normal);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }


    Implicit Circle(vec2 p, vec2 center, float iRadius)
    {
        vec2 centered = p - center;
        float len = length(centered);
        float length = len - iRadius;
        return Implicit(length, vec3(centered / len, 0.0));
    }

    mat2 Rotate2D(float theta) { // typo in other shadertoys
        float c = cos(theta);
        float s = sin(theta);
        return mat2(
            vec2(c, -s),
            vec2(s, c)
        );
    }
    // NEW
    Implicit LineSegment(vec2 p, vec2 start, vec2 end) {
        vec2 span = end - start;
        float length = length(span);
        vec2 dir = span / length;

        Implicit plane = Abs(Plane(p, start, vec2(dir.y, -dir.x)));
        vec2 center = (start + end) * 0.5;
        Implicit bounds = Subtract(Abs(Plane(p, center, dir)), length * 0.5);

        return Max(plane, bounds);
    }

    ColorImplicit LineSegment(vec2 p, vec2 start, vec2 end, vec4 color) {
        Implicit result = LineSegment(p, start, end);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }

    Implicit RectangleCentered(vec2 p, vec2 center, vec2 size) {
        vec2 centered = p - center;
        vec2 b = size * 0.5;
        vec2 d = abs(centered) - b;
        float dist = length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);

        vec2 grad = d.x > d.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        if (d.x > 0. && d.y > 0.)
            grad = d / length(d);

        grad *= -sign(centered);

        return Implicit(dist, vec3(grad, 0.0));
    }

    ColorImplicit RectangleCentered(vec2 p, vec2 center, vec2 size, vec4 color) {
        Implicit result = RectangleCentered(p, center, size);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }

    Implicit Rectangle(vec2 p, vec2 min, vec2 max) {
        vec2 center = (min + max) * 0.5;
        vec2 size = max - min;
        return RectangleCentered(p, center, size);
    }

    ColorImplicit Rectangle(vec2 p, vec2 min, vec2 max, vec4 color) {
        Implicit result = Rectangle(p, min, max);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }


    Implicit RectangleCenterRotated(vec2 p, vec2 center, vec2 size, float angle) {
        vec2 centered = p - center;
        mat2 rot = Rotate2D(-angle);
        centered = rot * centered;

        vec2 b = size * 0.5;
        vec2 d = abs(centered)-b;
        float dist = length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0);

        vec2 grad = d.x > d.y ? vec2(1.0, 0.0) : vec2 (0.0, 1.0);
        if (d.x > 0. && d.y > 0.)
            grad = d / length(d);

        grad *= -sign(centered);

        return Implicit(dist, vec3(grad * rot, 0.0));
    }

    // https://iquilezles.org/articles/smin/
    Implicit IntersectionExponential(Implicit a, Implicit b, float radius) {
    //    float res = exp2( -a/k ) + exp2( -b/k );
    //    return -k*log2( res );

        a = Exp(Divide(a, radius));
        b = Exp(Divide(b, radius));
        Implicit res = Add(a, b);
        
        return Multiply(Log(res), radius);
    }

    Implicit RectangleCenterRotatedExp(vec2 p, vec2 center, vec2 size, float angle) {
        vec2 centered = p - center;
        mat2 rot = Rotate2D(-angle);
        size = size * 0.5;

        Implicit xPlane = Subtract(Abs(Implicit(centered.x, vec3(1, 0, 0))), size.x);
        Implicit yPlane = Subtract(Abs(Implicit(centered.y, vec3(0, 1, 0))), size.y);

        return Add(xPlane, yPlane);
    }

    ColorImplicit RectangleCenterRotatedExp(vec2 p, vec2 center, vec2 size, float angle, vec4 color) {
        Implicit result = RectangleCenterRotatedExp(p, center, size, angle);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }

    // Implicit API not used by GCLS (mostly unused in LR)



    vec3 Boundary(vec3 iP, Implicit i) {
        return -i.Distance * i.Gradient;
    }

    Implicit Shell(Implicit iImplicit, float thickness, float bias) {
        thickness *= 0.5;
        return Subtract(Abs(Add(iImplicit, bias * thickness)), thickness);
    }

    Implicit EuclideanNorm(Implicit a, Implicit b) {
        return Sqrt(Add(Multiply(a, a), Multiply(b, b)));
    }
    Implicit EuclideanNorm(Implicit a, Implicit b, Implicit c) {
        return Sqrt(Add(Add(Multiply(a, a), Multiply(b, b)), Multiply(c, c)));
    }

    // https://mercury.sexy/hg_sdf/
    Implicit IntersectionEuclidean(Implicit a, Implicit b, float radius, out float blendingRatio) {

        Implicit maxab = Max(a, b);
        Implicit r = CreateImplicit(radius);
        
        Implicit ua = Implicit(Max(Add(a, r), CreateImplicit()).Distance, a.Gradient);
        Implicit ub = Implicit(Max(Add(b, r), CreateImplicit()).Distance, b.Gradient);
        
        Implicit op = Add(Min(Negate(r), maxab), EuclideanNorm(ua, ub));
        
        if (maxab.Distance <= 0.0) {
            op.Gradient = maxab.Gradient;
        }
        
        float sum = a.Distance + b.Distance;
        blendingRatio = (sum == 0.0) ? 0.5 : (0.5 + 0.5 * b.Distance / sum);
        
        return op;
    }

    Implicit IntersectionEuclidean(Implicit a, Implicit b, float radius) {
        float unusedBlendingRatio;
        return IntersectionEuclidean(a, b, radius, unusedBlendingRatio);
    }

    ColorImplicit IntersectionEuclidean(ColorImplicit a, ColorImplicit b, float radius) {
        float blendingRatio;
        Implicit result = IntersectionEuclidean(
            Implicit(a.Distance, a.Gradient),
            Implicit(b.Distance, b.Gradient),
            radius,
            blendingRatio
        );
        vec4 blendedColor = mix(a.Color, b.Color, blendingRatio);
        return ColorImplicit(result.Distance, result.Gradient, blendedColor);
    }


    Implicit RectangleUGFSDFCenterRotated(vec2 p, vec2 center, float size, float angle) {
        vec2 centered = p - center;
        mat2 rot = Rotate2D(-angle);
        size *= 0.5;

        Implicit x = Plane(centered, vec2(0.0), rot * vec2(-1.0, 0.0));
        Implicit y = Plane(centered, vec2(0.0), rot * vec2(0.0, -1.0));
        Implicit cornerA = Subtract(Max(x, y), size);
        Implicit cornerB = Subtract(Max(Negate(x), Negate(y)), size);

        return IntersectionEuclidean(cornerA, cornerB, 0.0);
    }

    ColorImplicit RectangleUGFSDFCenterRotated(vec2 p, vec2 center, float size, float angle, vec4 color) {
        Implicit result = RectangleUGFSDFCenterRotated(p, center, size, angle);
        return ColorImplicit(result.Distance, result.Gradient, color);
    }


    Implicit TriangleWaveEvenPositive(Implicit param, float period) {
        float halfPeriod = 0.5 * period;
        float wave = mod(param.Distance, period) - halfPeriod;
        float dist = halfPeriod - abs(wave);
        vec3 grad = -sign(wave) * param.Gradient;

        return Implicit(dist, grad);
    }

    ColorImplicit TriangleWaveEvenPositive(ColorImplicit param, float period) {
        Implicit base = TriangleWaveEvenPositive(Implicit(param.Distance, param.Gradient), period);
        return ColorImplicit(base.Distance, base.Gradient, param.Color);
    }




    Implicit BoxCenter(vec3 iP, vec3 iCenter, vec3 iSize) {
        vec3 p = iP - iCenter;
        vec3 b = iSize * 0.5;

        vec3 d = abs(p)-b;
        float dist = length(max(d, vec3(0.))) + min(max(d.x, max(d.y, d.z)), 0.);

        vec3 grad = (d.x > d.y) && (d.x > d.z) ? vec3(1., 0., 0.) :
            (d.y > d.z ? vec3(0., 1., 0.) : vec3(0., 0., 1.));

        if (d.x > 0. || d.y > 0. || d.z > 0.)
        {
            d = max(d, 0.);
            grad = d / length(d);
        }

        grad *= sign(p);

        return Implicit(dist, grad);
    }

    // Used by ScaledLattice() 

    Implicit SphereNative(vec3 iP, vec3 iCenter, float iRadius) {
        vec3 centered = iP - iCenter;
        float length = length(centered);
        float dist = length - iRadius;
        return Implicit(dist, centered / length);
    }

    const vec3 center = vec3(0.5); 

    #define STANDALONE 0
    float count = 1.50000000;
    float size_x = 10.00000000;
    float size_y = 10.00000000;
    float size_z = 10.00000000;
    float thickness = 0.80000000;
    float bias = -0.19000000;
    float drop_yz = 1.00000000;
    float drop_zx = 1.00000000;
    float drop_xy = 0.65000000;
    int variantIndex = 0;

    vec3 DirX = vec3(1.0, 0.0, 0.0);
    vec3 DirY = vec3(0.0, 1.0, 0.0);
    vec3 DirZ = vec3(0.0, 0.0, 1.0);

    float Dot(vec3 a, vec3 b) {
    float _Dot_002 = a.x * b.x + a.y * b.y;
    return _Dot_002 + a.z * b.z;
    }

    Implicit Dot(Implicit a_x, Implicit a_y, Implicit a_z, Implicit b_x, Implicit b_y, Implicit b_z) {
    Implicit _Dot_000 = Multiply(a_x, b_x);
    Implicit _Dot_001 = Multiply(a_y, b_y);
    Implicit _Dot_002 = Add(_Dot_000, _Dot_001);
    Implicit _Dot_003 = Multiply(a_z, b_z);
    return Add(_Dot_002, _Dot_003);
    }

    float Length(vec3 v) {
    float _Length_000 = Dot(v, v);
    return sqrt(_Length_000);
    }

    float AddVec(vec3 v) {
    float _AddVec_000 = v.x + v.y;
    return _AddVec_000 + v.z;
    }

    Implicit IntersectSharp3(Implicit a, Implicit b, Implicit c) {
    Implicit _IntersectSharp3_000 = Max(a, b);
    return Max(_IntersectSharp3_000, c);
    }

    Implicit Sphere(vec3 p, vec3 center, float radius) {
    vec3 c = p - center;
    float len = Length(c);
    float dist = len - radius;
    vec3 _Sphere_000 = c / len;
    return Implicit(dist, _Sphere_000);
    }

    Implicit BoxCenteredSharp(Implicit p_x, Implicit p_y, Implicit p_z, vec3 center, vec3 size) {
    Implicit _planes_000_x = Subtract(p_x, center.x);
    Implicit _planes_001_x = Abs(_planes_000_x);
    vec3 _planes_002 = size * 0.5;
    Implicit planes_x = Subtract(_planes_001_x, _planes_002.x);
    Implicit _planes_000_y = Subtract(p_y, center.y);
    Implicit _planes_001_y = Abs(_planes_000_y);
    Implicit planes_y = Subtract(_planes_001_y, _planes_002.y);
    Implicit _planes_000_z = Subtract(p_z, center.z);
    Implicit _planes_001_z = Abs(_planes_000_z);
    Implicit planes_z = Subtract(_planes_001_z, _planes_002.z);
    return IntersectSharp3(planes_x, planes_y, planes_z);
    }

    Implicit TPMS_Gyroid(Implicit p_x, Implicit p_y, Implicit p_z, vec3 period, vec3 drop) {
    vec3 frequency = 2.0 * PI / period;
    Implicit xyz_x = Multiply(p_x, frequency.x);
    Implicit xyz_y = Multiply(p_y, frequency.y);
    Implicit xyz_z = Multiply(p_z, frequency.z);
    Implicit _TPMS_Gyroid_003_x = Sin(xyz_x);
    Implicit _TPMS_Gyroid_004_x = Multiply(drop.x, _TPMS_Gyroid_003_x);
    Implicit _TPMS_Gyroid_003_y = Sin(xyz_y);
    Implicit _TPMS_Gyroid_004_y = Multiply(drop.y, _TPMS_Gyroid_003_y);
    Implicit _TPMS_Gyroid_003_z = Sin(xyz_z);
    Implicit _TPMS_Gyroid_004_z = Multiply(drop.z, _TPMS_Gyroid_003_z);
    Implicit _TPMS_Gyroid_005_x = Cos(xyz_y);
    Implicit _TPMS_Gyroid_005_y = Cos(xyz_z);
    Implicit _TPMS_Gyroid_005_z = Cos(xyz_x);
    Implicit _TPMS_Gyroid_006 = Dot(_TPMS_Gyroid_004_x, _TPMS_Gyroid_004_y, _TPMS_Gyroid_004_z, _TPMS_Gyroid_005_x, _TPMS_Gyroid_005_y, _TPMS_Gyroid_005_z);
    float _TPMS_Gyroid_007 = AddVec(period);
    Implicit _TPMS_Gyroid_008 = Multiply(_TPMS_Gyroid_006, _TPMS_Gyroid_007);
    return Divide(_TPMS_Gyroid_008, 18.0);
    }

    Implicit indexedLattice(vec3 p, int index, out Implicit solid) {
    vec3 size = vec3(u_size_x, u_size_y, u_size_z);
    vec3 drop = vec3(u_drop_xy, u_drop_yz, u_drop_zx);
    Implicit p_x = Implicit(p.x, DirX);
    Implicit p_y = Implicit(p.y, DirY);
    Implicit p_z = Implicit(p.z, DirZ);
    Implicit _lattice_000 = TPMS_Gyroid(p_x, p_y, p_z, size, drop);
    Implicit lattice = Subtract(_lattice_000, u_bias);
    solid = lattice;
    if (index == 0) return solid;
    Implicit inverse = Multiply(-1.0, lattice);
    if (index == 1) return inverse;
    Implicit _thin_000 = Abs(lattice);
    Implicit thin = Subtract(_thin_000, u_sdf_thickness * 0.5);
    if (index == 2) return thin;
    Implicit twin = Multiply(-1.0, thin);
    if (index == 3) return twin;
    return Sphere(p, vec3(0.0), 0.5);
    }

    Implicit scaledLattice(vec3 scaledP, int index, out Implicit scaledBase) {
    vec3 p = (scaledP - center) * 10.0;
    Implicit base;
    Implicit indexed = indexedLattice(p, index, base);
    scaledBase = Divide(base, 10.0);
    return Divide(indexed, 10.0);
    }

    // Booleans NEW

    Implicit UnionEuclidean(Implicit a, Implicit b, float radius, out float blendingRatio) {
        Implicit ab = Min(a, b);
        Implicit r = CreateImplicit(radius);

        Implicit ua = Max(Subtract(r, a), CreateImplicit(0.0));
        Implicit ub = Max(Subtract(r, b), CreateImplicit(0.0));

        Implicit op = Subtract(Max(r, ab), EuclideanNorm(ua, ub));

        if (ab.Distance > 0.0) {
            op.Gradient = ab.Gradient;
        }
        
        float sum = a.Distance + b.Distance;
        blendingRatio = (sum == 0.0) ? 0.5 : (0.5 + 0.5 * b.Distance / sum);

        return op;
    }

    Implicit UnionEuclidean(Implicit a, Implicit b, float radius) {
        float unused;
        return UnionEuclidean(a, b, radius, unused);
    }

    Implicit UnionEuclidean(Implicit a, Implicit b, Implicit c, float radius) {
        Implicit zero = CreateImplicit(0.0);
        Implicit r = CreateImplicit(radius);
        Implicit ua = Max(Subtract(r, a), zero);
        Implicit ub = Max(Subtract(r, b), zero);
        Implicit uc = Max(Subtract(r, c), zero);
        
        Implicit abc = Min(a, Min(b, c));
        Implicit op = Subtract(Max(r, abc), EuclideanNorm(ua, ub, uc));
        
        if (abc.Distance > 0.0) {
            op.Gradient = abc.Gradient;
        }
        
        return op;
    }

    ColorImplicit UnionEuclidean(ColorImplicit a, ColorImplicit b, float radius) {
        float blendingRatio;
        Implicit base = UnionEuclidean(
            Implicit(a.Distance, a.Gradient),
            Implicit(b.Distance, b.Gradient),
            radius,
            blendingRatio
        );
        vec4 color = mix(a.Color, b.Color, blendingRatio);
        return ColorImplicit(base.Distance, base.Gradient, color);
    }

    ColorImplicit UnionEuclidean(ColorImplicit a, ColorImplicit b, ColorImplicit c, float radius) {
        Implicit base = UnionEuclidean(
            Implicit(a.Distance, a.Gradient),
            Implicit(b.Distance, b.Gradient),
            Implicit(c.Distance, c.Gradient),
            radius
        );
        vec4 color = (a.Color + b.Color + c.Color) / 3.0;
        return ColorImplicit(base.Distance, base.Gradient, color);
    }


    Implicit UnionChamfer(Implicit iA, Implicit iB, float k, out float param) {
        Implicit h = Multiply(Max(Subtract(CreateImplicit(k), Abs(Subtract(iA, iB))), CreateImplicit()), 1.0 / k);
        Implicit h2 = Multiply(h, 0.5);
        Implicit result = Subtract(Min(iA, iB), Multiply(h2, k * 0.5));
        param = h2.Distance;
        param = iA.Distance < iB.Distance ? param : (1.0 - param);

        return result;
    }
    Implicit UnionChamfer(Implicit iA, Implicit iB, float k) {
        float param;
        return UnionChamfer(iA, iB, k, param);
    }

    Implicit UnionRound(Implicit iA, Implicit iB, float k, out float param)
    {
        Implicit h = Multiply(Max(Subtract(CreateImplicit(k), Abs(Subtract(iA, iB))), CreateImplicit()), 1.0 / k);
        Implicit h2 = Multiply(Multiply(h, h), 0.5);
        Implicit result = Subtract(Min(iA, iB), Multiply(h2, k * 0.5));
        param = 0.5 + 0.5 * (iA.Distance - iB.Distance) / (iA.Distance + iB.Distance);

        return result;
    }
    Implicit UnionRound(Implicit iA, Implicit iB, float k) {
        float param;
        return UnionRound(iA, iB, k, param);
    }

    //NEW

    // Polynomial Smooth Min 2 from https://iquilezles.org/articles/smin/ and https://iquilezles.org/articles/distgradfunctions2d/
    Implicit UnionSmoothMedial(Implicit a, Implicit b, float k, out float blendingRatio) {
        float h = max(k - abs(a.Distance - b.Distance), 0.0);
        float m = 0.25 * h * h / k;
        float n = 0.5 * h / k;

        float dist = min(a.Distance, b.Distance) - m;
        blendingRatio = (a.Distance < b.Distance) ? n : 1.0 - n;
        vec3 grad = mix(a.Gradient, b.Gradient, blendingRatio);

        return Implicit(dist, grad);
    }

    Implicit UnionSmoothMedial(Implicit a, Implicit b, float k) {
        float unused;
        return UnionSmoothMedial(a, b, k, unused);
    }

    ColorImplicit UnionSmoothMedial(ColorImplicit a, ColorImplicit b, float k) {
        float blendingRatio;
        Implicit base = UnionSmoothMedial(
            Implicit(a.Distance, a.Gradient),
            Implicit(b.Distance, b.Gradient),
            k,
            blendingRatio
        );
        vec4 color = mix(a.Color, b.Color, blendingRatio);
        return ColorImplicit(base.Distance, base.Gradient, color);
    }


    Implicit UnionSmooth(Implicit a, Implicit b, float k){
        a.Distance -= k;
        b.Distance -= k;

    //   if (min(a.Distance, b.Distance) >= 0.)
    //       return (Min(a, b));

        return Add(UnionSmoothMedial(a, b, abs(a.Distance + b.Distance) * abs(1.-dot(a.Gradient, b.Gradient))), k);
    }


    Implicit IntersectionSmoothMedial(Implicit iA, Implicit iB, float k){
        return Negate(UnionSmoothMedial(Negate(iA), Negate(iB), k));
    }


    Implicit IntersectionSmooth(Implicit iA, Implicit iB, float k){
        return Negate(UnionSmooth(Negate(iA), Negate(iB), k));
    }



    // R0 fro, https://www.cambridge.org/core/journals/acta-numerica/article/abs/semianalytic-geometry-with-rfunctions/3F5E061C35CA6A712BE338FE4AD1DB7B
    Implicit UnionRvachev(Implicit iA, Implicit iB, float k)
    {
        Implicit result = Subtract(Add(iA, iB), Sqrt(Add(Square(iA), Square(iB))));
    //  float param = 0.5;
    //  result.Color = mix(iA.Color, iB.Color, iA.Distance < iB.Distance ? param : (1.0 - param));

        return result;
    }

    Implicit IntersectionRvachev(Implicit iA, Implicit iB, float k) {
        return Negate(UnionRvachev(Negate(iA), Negate(iB), k));
    }



    Implicit PlaneNative(vec3 p, vec3 origin, vec3 normal)
    {
        vec3 grad = normalize(normal);
        float v = dot(p - origin, grad);
        return Implicit(v, grad);
    }
    Implicit PlaneNative(vec2 p, vec2 origin, vec2 normal)
    {
        return PlaneNative(vec3(p, 0.0), vec3(origin, 0.0), vec3(normal, 0.0));
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





    /////////////////////////////////////////////////////////////////////////////////////////////
    //
    // LatticeRobot Renderer v0.1
    //
    // This renderer is similar to the one used by LatticeRobot, derived from IQ and related ShaderToys as commented below.  
    //
    /////////////////////////////////////////////////////////////////////////////////////////////

    #if STANDALONE

    // Renderer uniforms

    uniform vec2 resolution;
    uniform float time;
    uniform float fov;
    uniform vec3 camera;
    uniform float count;

    // LatticeRobot uniforms

    uniform vec3 color_primary;
    uniform vec3 color_secondary;
    uniform vec3 color_boundingbox;
    uniform vec3 color_background;

    #else 

    const float cHigh = 0.8;
    const float cMed = 0.7;
    const float cLow = 0.3;
    const vec3 color_primary = vec3(cMed, cMed, cHigh);
    const vec3 color_secondary = vec3(cHigh, cMed, cMed);
    const vec3 color_boundingbox = vec3(cHigh, cHigh, cHigh);
    const vec3 color_background = vec3(1.0, 1.0, 1.0);

    #endif

    // Helper function to get just the SDF distance for raymarching mode
    float getRaymarchDistance(vec3 p) {
        return map(p).Distance;
    }

    // Tree root
    Implicit map(vec3 p) {
        #if (STANDALONE==0)
            float time = u_time;
            vec2 resolution = u_resolution;
        #endif

        float amp = 0.05;
        vec3 pOrig = p * vec3(1. + amp * cos(time), 1. + amp * cos(time), 1. + amp * sin(time));
        p = pOrig * u_count;

        // Bounds
        vec3 size = vec3(u_size_x, u_size_y, u_size_z);
        float thickness = u_sdf_thickness;
        float bias = u_bias;

        // Drop factors
        float drop_yz = u_drop_yz;
        float drop_zx = u_drop_zx;
        float drop_xy = u_drop_xy;

        // Variant selection
        int variantIndex = u_variantIndex;

        Implicit base;
        Implicit scaled = Divide(scaledLattice(p, variantIndex, base), u_count);
        Implicit merged = scaled;
        
        Implicit bounds = BoxCenter(pOrig + center, center, 0.1 * vec3(u_size_x, u_size_y, u_size_z));
        
        // Apply bump effect (distance only)
        float bumpOffset = 0.05;
        float bump = pow(abs(cos((1.5 * time + p.z) * 0.4)), 400.);
        merged.Distance -= bump * bumpOffset;

        // Combine with bounds (distance only)
        return Max(merged, bounds);
    }

    vec3 calcNormal(in vec3 pos) {
        vec2 e = vec2(1.0,-1.0)*0.5773;
        const float eps = 0.0005;
        return normalize(e.xyy*map(pos + e.xyy*eps).Distance +
                        e.yyx*map(pos + e.yyx*eps).Distance +
                        e.yxy*map(pos + e.yxy*eps).Distance +
                        e.xxx*map(pos + e.xxx*eps).Distance);
    }

    float calcSoftshadow(in vec3 ro, in vec3 rd, float mint, float tmax) {
        float res = 1.0;
        float t = mint;
        for(int i=0; i<64; i++) {
            float h = getRaymarchDistance(ro + rd*t);
            res = min(res, 8.0*h/t);
            t += clamp(h, 0.02, 0.10);
            if(res < 0.005 || t > tmax) break;
        }
        return clamp(res, 0.0, 1.0);
    }

    float calcOcclusion(in vec3 pos, in vec3 nor) {
        float occ = 0.0;
        float sca = 1.0;
        for(int i=0; i<5; i++) {
            float hr = 0.01 + 0.15*float(i)/4.0;
            vec3 aopos = nor * hr + pos;
            float dd = getRaymarchDistance(aopos);
            occ += -(dd-hr)*sca;
            sca *= 0.95;
        }
        return clamp(1.0 - occ*1.5, 0.0, 1.0);
    }

    void main() {
        if (u_mode == 0) { // Raymarching Mode
            vec2 resolution = u_resolution;
            vec2 p = (-resolution.xy + 2.0*gl_FragCoord.xy)/resolution.y;
            float rad = 1.25;
            vec3 ro = vec3(rad*cos(0.0), rad*sin(0.0), 0.7);
            vec3 ta = vec3(0.0);
            
            // Camera matrix
            vec3 ww = normalize(ta - ro);
            vec3 uu = normalize(cross(ww, vec3(0.0, 0.0, 1.0)));
            vec3 vv = normalize(cross(uu, ww));

            // Create view ray
            vec3 rd = normalize(p.x*uu + p.y*vv + 1.5*ww);

            // Raymarch
            const float tmax = 2.5;
            float t = 0.0;
            Implicit hit;
            for(int i=0; i<256; i++) {
                vec3 pos = ro + t*rd;
                hit = map(pos);
                if(hit.Distance < 0.0001 || t > tmax) break;
                t += hit.Distance * 0.45;
            }

            vec3 col = vec3(0.2); // Default background
            if(t < tmax) {
                vec3 pos = ro + t*rd;
                vec3 nor = calcNormal(pos);
                vec3 lig = normalize(vec3(0.6, 0.0, 0.4));
                
                float dif = clamp(dot(nor, lig), 0.0, 1.0);
                float occ = calcOcclusion(pos, nor);
                if(dif > 0.001) dif *= calcSoftshadow(pos, lig, 0.001, 1.0);
                
                // Simple material shading
                col = vec3(0.8) * dif * occ;
            }

            gl_FragColor = vec4(col, 1.0);
        } else { // Mesh Mode
            vec3 viewDir = normalize(-vPosition);
            vec3 normal = normalize(vNormal);
            float rim = 0.0;

            if (u_effectType == 0) { // Bump
                float eps = 0.01;
                vec3 p = vWorldPosition;

                float center = mapSdf(p);
                float dx = mapSdf(p + vec3(eps, 0, 0)) - center;
                float dy = mapSdf(p + vec3(0, eps, 0)) - center;
                float dz = mapSdf(p + vec3(0, 0, eps)) - center;

                vec3 sdfNormal = normalize(vec3(dx, dy, dz));
                center = tanh(center * u_contrast);
                normal = normalize(normal + sdfNormal * u_effectStrength * center);
            } else { // Displacement
                float eps = 0.001;
                vec3 p = vWorldPosition;

                float center = mapSdf(p);
                float dx = mapSdf(p + vec3(eps, 0, 0)) - center;
                float dy = mapSdf(p + vec3(0, eps, 0)) - center;
                float dz = mapSdf(p + vec3(0, 0, eps)) - center;

                normal = normalize(vec3(dx, dy, dz));
                rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
            }

            // Lighting
            vec3 lightDir1 = normalize(vec3(2.0, 2.0, 2.0));
            vec3 lightDir2 = normalize(vec3(-2.0, 1.0, 1.0));
            vec3 lightDir3 = normalize(vec3(1.0, 0.0, 5.0));

            float diff1 = max(dot(normal, lightDir1), 0.0);
            float diff2 = max(dot(normal, lightDir2), 0.0);
            float diff3 = max(dot(normal, lightDir3), 0.0);

            vec3 ambient = vec3(0.3);
            vec3 diffuse = u_color * (diff1 * 1.0 + diff2 * 0.7 + diff3 * 0.8);

            if (u_effectType == 1) {
                diffuse += u_color * rim * 0.7;
            }

            vec3 reflectDir1 = reflect(-lightDir1, normal);
            float spec1 = pow(max(dot(viewDir, reflectDir1), 0.0), 32.0);
            vec3 specular = vec3(0.5) * spec1;

            vec3 color = ambient + diffuse + specular;
            gl_FragColor = vec4(color, 1.0);
        }
    }
`;