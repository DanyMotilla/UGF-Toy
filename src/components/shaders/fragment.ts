export default `
    
    // Implicit library
    
    #define PI 3.14159265358979
    #define SQRT2 1.41421356237
    #define SQRT3 1.73205080757
        
    struct Implicit {
        float Distance;
        vec3 Gradient;
    };
    
    Implicit CreateImplicit() { return Implicit(0.0, vec3(0.0)); }
    Implicit CreateImplicit(float iValue) { return Implicit(iValue, vec3(0.0)); }
    
    Implicit Negate(Implicit iImplicit) {
        return Implicit(-iImplicit.Distance, -iImplicit.Gradient);
    }
    
    Implicit Add(Implicit a, Implicit b) {
        return Implicit(a.Distance + b.Distance, a.Gradient + b.Gradient);
    }
    Implicit Subtract(Implicit a, Implicit b)  {
        return Implicit(a.Distance - b.Distance, a.Gradient - b.Gradient);
    }
    
    Implicit Add(float iT, Implicit iImplicit) {
        return Implicit(iT + iImplicit.Distance, iImplicit.Gradient);
    }
    Implicit Add(Implicit iImplicit, float iT) { return Add(iT, iImplicit); }
    Implicit Subtract(float iT, Implicit iImplicit) { return Add(iT, Negate(iImplicit)); }
    Implicit Subtract(Implicit iImplicit, float iT) { return Add(-iT, iImplicit); }
    
    Implicit Multiply(Implicit a, Implicit b) {
        return Implicit(a.Distance * b.Distance, a.Distance * b.Gradient + b.Distance * a.Gradient);
    }
    Implicit Multiply(float iT, Implicit iImplicit) { return Implicit(iT * iImplicit.Distance, iT * iImplicit.Gradient); }
    Implicit Multiply(Implicit iImplicit, float iT) { return Multiply(iT, iImplicit); }
    
    Implicit Divide(Implicit a, Implicit b) {
        return Implicit(a.Distance / b.Distance, (b.Distance * a.Gradient - a.Distance * b.Gradient) / (b.Distance * b.Distance));
    }
    Implicit Divide(Implicit a, float b) { return Implicit(a.Distance / b, a.Gradient / b); }
    Implicit Divide(float a, Implicit b) { return Divide(CreateImplicit(a), b); }
    
    Implicit Min(Implicit a, Implicit b) {
        if (a.Distance <= b.Distance)
            return a;
    
        return b;
    }
    Implicit Min(Implicit a, float b) { return Min(a, CreateImplicit(b)); }
    Implicit Min(float a, Implicit b) { return Min(CreateImplicit(a), b); }
    Implicit Min(Implicit a, Implicit b, Implicit c) { return Min(a, Min(b, c)); }
    Implicit Min(Implicit a, Implicit b, Implicit c, Implicit d) { return Min(a, Min(b, Min(c, d))); }
    
    Implicit Max(Implicit a, Implicit b) {
        if (a.Distance >= b.Distance)
            return a;
    
        return b;
    }
    Implicit Max(Implicit a, Implicit b, Implicit c) { return Max(a, Max(b, c)); }
    Implicit Max(Implicit a, float b) { return Max(a, CreateImplicit(b)); }
    Implicit Max(float a, Implicit b) { return Max(CreateImplicit(a), b); }
    Implicit Max(Implicit a, Implicit b, Implicit c, Implicit d) { return Max(a, Max(b, Max(c, d))); }
    
    Implicit Compare(Implicit iA, Implicit iB) {
        if (iA.Distance < iB.Distance)
            return CreateImplicit(-1.0);
    
        if (iA.Distance > iB.Distance)
            return CreateImplicit(1.0);
    
        return CreateImplicit(0.0);
    }
    Implicit Compare(Implicit iA, float iB) { return Compare(iA, CreateImplicit(iB)); }
    Implicit Compare(float iB, Implicit iA) { return Compare(iA, CreateImplicit(iB)); }
    Implicit Compare(float iA, float iB) { return CreateImplicit(iA == iB ? 0. : (iA > iB ? 1. : -1.)); }
    
    Implicit Conditional(bool condition, Implicit shape1, Implicit shape2) {
      if (condition)
        return shape1;
    
      return shape2;
    }
    
    Implicit Exp(Implicit iImplicit) {
        float exp = exp(iImplicit.Distance);
        return Implicit(exp, exp * iImplicit.Gradient);
    }
    
    Implicit Log(Implicit iImplicit) {
        return Implicit(log(iImplicit.Distance), iImplicit.Gradient / iImplicit.Distance);
    }
    
    Implicit Pow(Implicit iMantissa, Implicit iExponent) {
        float result = pow(iMantissa.Distance, iExponent.Distance);
        return Implicit(result, result * log(iMantissa.Distance) * iMantissa.Gradient);
    }
    
    Implicit Sqrt(Implicit iImplicit) {
        float sqrt = sqrt(iImplicit.Distance);
        return Implicit(sqrt, iImplicit.Gradient / (2.0 * sqrt));
    }
    
    Implicit Abs(Implicit iImplicit) {
        return Implicit(abs(iImplicit.Distance), sign(iImplicit.Distance) * iImplicit.Gradient);
    }
    
    Implicit Mod(Implicit iImplicit, Implicit iM) {
        return Implicit(mod(iImplicit.Distance, iM.Distance), iImplicit.Gradient);  // TODO fix gradient
    }
    Implicit Mod(Implicit iImplicit, float iM) {
        return Implicit(mod(iImplicit.Distance, iM), iImplicit.Gradient);  // TODO fix gradient
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
    
    Implicit Atan(Implicit a, Implicit b) {  // this version is not correct, but avoids a shading issue.
        vec3 grad = (b.Distance * a.Gradient - a.Distance * b.Gradient);
        return Implicit(atan(a.Distance, b.Distance), grad);
    }
    
    // Primitives
    
    Implicit Circle(vec2 p, vec2 center, float iRadius)
    {
        vec2 centered = p - center;
        float len = length(centered);
        float length = len - iRadius;
        return Implicit(length, vec3(centered / len, 0.0));
    }
    
    mat2 Rotate2D(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat2(
            vec2(c, -s),
            vec2(s, c)
        );
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
    
    // Implicit API not used by GCLS (mostly unused in LR)

    Implicit Square(Implicit iImplicit) {
        float square = iImplicit.Distance * iImplicit.Distance ;
        return Implicit(square, 2. *  square * iImplicit.Gradient);
    }
    
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
    
    // Booleans
    
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
    
    // Smooth transition values
    float smoothRotate(float targetAngle, float currentAngle, float deltaTime, float speed) {
        return mix(currentAngle, targetAngle, 1.0 - exp(-speed * deltaTime));
    }
    
    // ColorImplicit
    
    struct ColorImplicit {
        float Distance;
        vec3 Gradient;
        vec4 Color;
    };
    
    ColorImplicit CreateColorImplicit(Implicit implicit, vec4 color) {
        return ColorImplicit(implicit.Distance, implicit.Gradient, color);
    }
    ColorImplicit CreateColorImplicit(float distance, vec4 color) {
        return CreateColorImplicit(CreateImplicit(distance), color);
    }
    
    ColorImplicit Min(ColorImplicit a, ColorImplicit b) {
        if (a.Distance <= b.Distance)
            return a;
    
        return b;
    }
    
    ColorImplicit Max(ColorImplicit a, ColorImplicit b) {
        if (a.Distance >= b.Distance)
            return a;
    
        return b;
    }
    
    ColorImplicit Add(ColorImplicit a, ColorImplicit b) {
        return ColorImplicit(
            a.Distance + b.Distance,
            a.Gradient + b.Gradient,
            0.5 * (a.Color + b.Color)
        );
    }
    ColorImplicit Add(ColorImplicit a, float b) { return CreateColorImplicit(Add(Implicit(a.Distance, a.Gradient), b), a.Color); }
    
    ColorImplicit Subtract(ColorImplicit a, ColorImplicit b) {
        return ColorImplicit(
            a.Distance - b.Distance,
            a.Gradient - b.Gradient,
            0.5 * (a.Color + b.Color)
        );
    }
    ColorImplicit Subtract(ColorImplicit a, float b) { return CreateColorImplicit(Subtract(Implicit(a.Distance, a.Gradient), b), a.Color); }
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    //
    // LatticeRobot Renderer v0.1
    //
    // This renderer is similar to the one used by LatticeRobot, derived from IQ and related ShaderToys as commented below.  
    //
    /////////////////////////////////////////////////////////////////////////////////////////////

    // temporal uniforms but used for now so this thing doesn't break -------------------------------
    
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec3 u_cameraPos;
        
    // temporal uniforms but used for now so this thing doesn't break -------------------------------
    
    // LatticeRobot uniforms -------------------------
    
    const float cHigh = 0.8;
    const float cMed = 0.7;
    const float cLow = 0.3;
    const vec3 color_primary = vec3(cMed, cMed, cHigh);
    const vec3 color_secondary = vec3(cHigh, cMed, cMed);
    const vec3 color_boundingbox = vec3(cHigh, cHigh, cHigh);
    const vec3 color_background = vec3(1.0, 1.0, 1.0);
    
    // LatticeRobot uniforms -------------------------
    
    // temporal uniforms -------------------------
    
    uniform float u_scale;
    uniform vec3 u_color;
    uniform float u_thickness;
    uniform int u_mode;
    uniform int u_effectType;
    uniform int u_sdfType;
    uniform float u_posX;
    uniform float u_posY;
    uniform float u_posZ;
    uniform float u_effectStrength;
    uniform float u_speed;
    uniform float u_contrast;
    uniform float u_raymarchSteps;
    uniform float u_raymarchEpsilon;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    // temporal uniforms -------------------------

    // MINE -------------------------
    
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

    float sdfGyroid(vec3 p, float scale) {
        p *= scale;
        return abs(sin(p.x)*cos(p.y) + sin(p.y)*cos(p.z) + sin(p.z)*cos(p.x)) - u_thickness;
    }

    float sdfWaves(vec3 p, float scale) {
        p *= scale;
        return 0.5 * (
            sin(p.x) * sin(p.z) * 0.5 +
            sin(p.x * 0.4 + p.z * 0.5) * 0.7 +
            sin(length(p.xz) * 0.5) * 0.2
        );
    }

    float mapSdf(vec3 p) {
        float timeOffset = u_time * u_speed;
        p.x += sin(timeOffset) * 0.2;
        p.y += cos(timeOffset) * 0.2;

        p.x -= u_posX;
        p.y -= u_posY;
        p.z -= u_posZ;

        if (u_sdfType == 0) {
            // Bounded gyroid
            float boundingSphere = sdfSphere(p, u_scale * 0.8);
            float gyroid = sdfGyroid(p, 8.0 * u_scale);
            return max(boundingSphere, gyroid);
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

    vec3 calculateNormal(vec3 p) {
        const float eps = 0.001;
        return normalize(vec3(
            mapSdf(vec3(p.x + eps, p.y, p.z)) - mapSdf(vec3(p.x - eps, p.y, p.z)),
            mapSdf(vec3(p.x, p.y + eps, p.z)) - mapSdf(vec3(p.x, p.y - eps, p.z)),
            mapSdf(vec3(p.x, p.y, p.z + eps)) - mapSdf(vec3(p.x, p.y, p.z - eps))
        ));
    }
    
    // MINE -------------------------
    
    ColorImplicit map(vec3 p) {
    
        vec4 colorCool = vec4(color_primary, 1.0);
        vec4 colorWarm = vec4(color_secondary, 1.0);
        vec4 colorLightGray = vec4(color_boundingbox, 1.0);
    
        vec3 pOrig = p;
        p = p * count + center;
    
        Implicit base;
        ColorImplicit merged = CreateColorImplicit(Divide(scaledLattice(p, variantIndex, base), count), colorLightGray);
        ColorImplicit bounds = CreateColorImplicit(BoxCenter(pOrig + center, center, 0.1 * vec3(size_x, size_y, size_z)), colorLightGray);
    
        float bumpOffset = 0.05;
        float bump = pow(abs(cos((1.5 * time + p.z) * 0.4)), 400.);
        // ColorImplicit colorField = Add(merged, -bump * bumpOffset);
        ColorImplicit colorField = merged;
    
    
        vec4 baseColor = variantIndex == 1 ? colorWarm : colorCool;
        colorField.Color = baseColor;
        if (variantIndex > 1) {
            colorField.Color = (base.Distance > 0.0) ? colorCool : colorWarm;
        }
    
        // colorField.Color = colorField.Color + vec4(bump * 0.2);
        return Max(colorField, bounds);
    
    }   
    // https://iquilezles.org/articles/normalsSDF
    vec3 calcNormal( in vec3 pos) {
        vec2 e = vec2(1.0,-1.0)*0.5773;
        const float eps = 0.0005;
        return normalize( e.xyy*map(pos + e.xyy*eps).Distance +
                     e.yyx*map(pos + e.yyx*eps).Distance +
                     e.yxy*map(pos + e.yxy*eps).Distance +
                     e.xxx*map(pos + e.xxx*eps).Distance );
    }
    
    // https://iquilezles.org/articles/rmshadows
    float calcSoftshadowBanding( in vec3 ro, in vec3 rd, in float mint, in float tmax ) {
        float res = 1.0;
        float t = mint;
        for( int i=0; i<16; i++ ) {
          float h = map( ro + rd*t ).Distance;
            res = min( res, 8.0*h/t );
            t += clamp( h, 0.02, 0.10 );
            if( res<0.005 || t>tmax ) break;
        }
        return clamp( res, 0.0, 1.0 );
    }
    
    float softshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float w ) {
        float res = 1.0;
        float t = mint;
        for( int i=0; i<256 && t<maxt; i++ ) {
            float h = map(ro + t*rd).Distance;
            res = min( res, h/(w*t) );
            t += clamp(h, 0.005, 0.50);
            if( res<-1.0 || t>maxt ) break;
        }
        res = max(res,-1.0);
        return 0.25*(1.0+res)*(1.0+res)*(2.0-res);
    }
    
    // advanced via https://www.shadertoy.com/view/lsKcDD
    float calcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax, int technique ) {
       float res = 1.0;
        float t = mint;
        float ph = 1e10; // big, such that y = 0 on the first iteration
    
        for( int i=0; i<32; i++ ) {
          float h = map( ro + rd*t ).Distance;
    
            // traditional technique
            if( technique==0 ) {
               res = min( res, 10.0*h/t );
            }
            // improved technique
            else {
                // use this if you are getting artifact on the first iteration, or unroll the
                // first iteration out of the loop
                float y = (i==0) ? 0.0 : h*h/(2.0*ph);
    
                // float y = h*h/(2.0*ph);
                float d = sqrt(h*h-y*y);
                res = min( res, 10.0*d/max(0.0,t-y) );
                ph = h;
            }
    
            t += h;
    
            if( res<0.0001 || t>tmax ) break;
    
        }
        res = clamp( res, 0.0, 1.0 );
        return res*res*(3.0-2.0*res);
    }
    
    float calcOcclusion( in vec3 pos, in vec3 nor ) {
       float occ = 0.0;
        float sca = 1.0;
        for( int i=0; i<5; i++ ) {
            float hr = 0.01 + 0.15*float(i)/4.0;
            vec3 aopos =  nor * hr + pos;
            float dd = map( aopos ).Distance;
            occ += -(dd-hr)*sca;
            sca *= 0.95;
        }
        return clamp( 1.0 - occ*1.5, 0.0, 1.0 );
    }

    void main() {
        if (u_mode == 0) { // Raymarching Mode
            // Normalized pixel coordinates (from -1 to 1)
            vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
            
            float rad = 1.25;   
            float lightAng = 0.0;
            vec3 ro = vec3( rad*cos(lightAng), rad*sin(lightAng), 0.7 );
            vec3 ta = vec3( 0.0, 0.0, 0.0 );
            // camera matrix
            vec3 ww = normalize( ta - ro );
            vec3 uu = normalize( cross(ww,vec3(0.0,0.0,1.0) ) );
            vec3 vv = normalize( cross(uu,ww));
            
            vec3 tot = vec3(0.0);
            
            // camera movement animation
            float an = 0.25*(time-10.0);
            mat3 rot = RotateY(an);
            
            // create view ray
            vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );
        
            // Create rotation matrices
            mat3 rotZ = RotateZ(radians(an));
            mat3 rotY = RotateY(radians(an));
        
            // Combine rotations
            mat3 combinedRot = rotZ * rotY;
            
            // raymarch
            const float tmax = 2.5;
            float t = 0.0;
            
            
            ColorImplicit hit;
            for( int i=0; i<256; i++ ) {
                vec3 pos = combinedRot * (ro + t*rd);
                hit = map(pos);
                if( hit.Distance < 0.0001 || t > tmax ) break;
                t += hit.Distance * 0.45;  // slow down to not miss sharp features and TPMS with Lipschitz > 1.  
            }
        
            if (t > tmax)
                tot = vec3(1.0);
                vec3 nor;
                
            // shading/lighting
            vec3 col = color_background;
            if( t<tmax ) {
                //vec3 pos = (ro + t*rd) * rot;  // test numeric gradient
                //vec3 nor = calcNormal(pos);
                nor = normalize(hit.Gradient);
        
                float dif = clamp( dot(nor, combinedRot * vec3(0.8, 0., 0.6)), 0.0, 1.0 );
                float amb = 0.5;
                col = vec3(0.6)*amb + vec3(1.)*dif;
                col = col * hit.Color.rgb;
            }
            
            tot += col;
            gl_FragColor = vec4(tot, 1.0);
            
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