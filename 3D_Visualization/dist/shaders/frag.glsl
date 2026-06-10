#version 300 es
precision highp float;

in vec2 v_position; // Pixel coords
out vec4 fragColor;

uniform float u_time;
uniform float window_width;
uniform float window_height;
uniform float zoom;
uniform vec3 color;
uniform mat4 u_model;
uniform int iteration;

// Distance for base cube
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Distance for sponge
float deMengerSponge(vec3 p) {
    float d = sdBox(p, vec3(1.0));
    float s = 1.0;
    int m;
    
    for (m = 0; m < 5; m++) {
        if (m >= iteration)
            break;
        vec3 a = mod(p * s, 2.0) - 1.0;
        s *= 3.0;
        
        vec3 r = abs(1.0 - 3.0 * abs(a));
        
        float da = max(r.x, r.y);
        float db = max(r.y, r.z);
        float dc = max(r.z, r.x);
        float c = (min(da, min(db, dc)) - 1.0) / s;
        
        d = max(d, c);
        }
    
    return d;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    float d = deMengerSponge(p);
    vec3 n = d - vec3(
        deMengerSponge(p - e.xyy),
        deMengerSponge(p - e.yxy),
        deMengerSponge(p - e.yyx)
    );
    return normalize(n);
}

// dist for horizontal plane
float sdPlane(vec3 p, float h) {
    return p.y - h;
}

void main() {
    float aspect = window_width / window_height;
    vec2 uv = v_position;
    uv.x *= aspect;

    // Ray origin - the start point of ray(position of virtual camera)
    vec3 ro = vec3(0.0, 0.0, -10.0 * zoom);
    // Ray direction - for pixel uv
    vec3 rd = normalize(vec3(uv, 1.5));

    // make geometry rotate
    mat3 rotation = mat3(u_model);
    ro = rotation * ro;
    rd = rotation * rd;

    float t = 0.0;
    int maxSteps = 128; // count of iterations
    bool hit = false;
    vec3 hitPoint = vec3(0.0);

    bool hitSponge = false;
    bool hitPlane = false;

    for (int i = 0; i < maxSteps; i++) {
        vec3 p = ro + rd * t;
        float dSponge = deMengerSponge(p), dPlane = sdPlane(p, -2.0);

        float d = min(dSponge, dPlane);

        if (d < 0.001) 
        {
            hit = true;
            hitPoint = p;
            
            if (dSponge < dPlane) hitSponge = true;
            else hitPlane = true;
            
            break;
        }

        t += d;
        
        if (t > 10.0)
            break;
    }

    if (hit)
    {
        if (hitSponge) 
        {
            vec3 normal = getNormal(hitPoint);
            vec3 lightDir = normalize(ro - hitPoint); // Свет из камеры
            float diff = max(dot(normal, lightDir), 0.1); 
            
            vec3 objectColor = color * diff; 
            fragColor = vec4(objectColor, 1.0);
        } 
        else if (hitPlane) 
        {
            vec3 planeColor = vec3(0.12, 1.0, 0.16); 
            fragColor = vec4(planeColor, 1.0);
        }
    }
    else
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
}