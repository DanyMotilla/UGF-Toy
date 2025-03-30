export default `
    uniform float u_time;
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
    uniform vec2 u_resolution;
    uniform vec3 u_cameraPos;
    uniform float u_raymarchSteps;
    uniform float u_raymarchEpsilon;

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

    void main() {
        if (u_mode == 0) { // Raymarching Mode
            // Normalized pixel coordinates (from -1 to 1)
            vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;

            // Camera setup
            vec3 ro = u_cameraPos;
            vec3 rd = normalize(vec3(uv, -1.0)); // Adjusted focal length

            // Raymarching
            float t = 0.0;
            vec3 p = ro;
            bool hit = false;

            for (int i = 0; i < 100; i++) {
                if (i >= int(u_raymarchSteps)) break;

                p = ro + rd * t;
                float d = mapSdf(p);

                if (d < u_raymarchEpsilon) {
                    hit = true;
                    break;
                }

                if (t > 20.0) break;
                t += d;
            }

            if (hit) {
                vec3 normal = calculateNormal(p);

                // Lighting
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 color = u_color * (0.3 + 0.7 * diff);

                // Rim lighting
                vec3 viewDir = normalize(ro - p);
                float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
                color += u_color * rim * 0.7;

                // Distance fog
                float fog = exp(-0.1 * t);
                color = mix(vec3(0.1), color, fog);

                gl_FragColor = vec4(color, 1.0);
            } else {
                // Background with distance fog
                float fog = exp(-0.1 * t);
                gl_FragColor = vec4(mix(vec3(0.1), u_color * 0.2, fog), 1.0);
            }
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