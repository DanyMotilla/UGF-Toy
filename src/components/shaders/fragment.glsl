#ifndef FRAGMENT_GLSL
#define FRAGMENT_GLSL

#include "./utils/constants.glsl"
#include "./drawing/drawing.glsl"

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

#endif // FRAGMENT_GLSL