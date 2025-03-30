export default `
    uniform float u_time;
    uniform float u_scale;
    uniform float u_posX;
    uniform float u_posY;
    uniform float u_posZ;
    uniform float u_effectStrength;
    uniform float u_speed;
    uniform float u_contrast;
    uniform int u_effectType;
    uniform int u_sdfType;
    uniform int u_mode;
    uniform float u_thickness;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
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
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
    
        vec3 pos = position;
    
        if (u_mode == 1) {
            if (u_effectType == 1) {
                float sdfValue = mapSdf(vWorldPosition);
                sdfValue = tanh(sdfValue * u_contrast);
                pos += normal * sdfValue * u_effectStrength * 0.2;
            }
        }
    
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;