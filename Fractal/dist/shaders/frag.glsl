#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform float window_height;
uniform float window_width;
uniform float movex;
uniform float movey;
uniform float scroll;
uniform vec3 color;
uniform float factortime;
uniform float factoradd;
uniform float MouseX;
uniform float MouseY;
uniform float coefX;
uniform float coefY;

float Norm2( vec2 Z )
{
    return (sqrt(Z.x * Z.x + Z.y * Z.y)) * (sqrt(Z.x * Z.x + Z.y * Z.y));
}

vec2 Add( vec2 Z1, vec2 Z2 )
{
    vec2 Z3;

    Z3.x = Z1.x + Z2.x;
    Z3.y = Z1.y + Z2.y; 
    return Z3;
}

vec2 Mul( vec2 Z1, vec2 Z2 )
{
    vec2 Z3;

    Z3.x = Z1.x * Z2.x - Z1.y * Z2.y;
    Z3.y = Z1.x * Z2.y + Z1.y * Z2.x;
    return Z3;
}

int MandColor( vec2 Z )
{
    vec2 Z0 = Z;
    int n = 0;

    while (Norm2(Z) < 4.0 && n < 255)
    {
        Z = Add(Mul(Z, Z), Z0);
        n++;
    }
    return n / 255;
}

vec3 PutMandel( float H, float W )
{
    float X0 = -2.0, Y0 = -2.0, X1 = 2.0, Y1 = 2.0, Xs = gl_FragCoord.x, Ys = gl_FragCoord.y;
    vec2 z;
    int n;

    z.x = Xs * (X1 - X0) / W + X0;
    z.y = Ys * (Y1 - Y0) / H + Y0;
    n = MandColor(z);
    return vec3(n, n / 30, n * 30);
}

int JuliaColor( vec2 Z, vec2 C )
{
    int n = 0;

    while (Norm2(Z) < 4.0 && n < 255)
    {
        Z = Add(Mul(Z, Z), C);
        n++;
    }
    return n;
}

vec3 PutJulia( float H, float W )
{            
    float X0 = -2.0, Y0 = -2.0, X1 = 2.0, Y1 = 2.0;
    
    float Xs = (gl_FragCoord.x - W * 0.5) * scroll + movex;
    float Ys = (gl_FragCoord.y - H * 0.5) * scroll + movey; 
    
    vec2 z, c;
    int n;

    c.x = factoradd + factortime * sin(u_time);
    c.y = factoradd + factortime * sin(u_time);
    
    z.x = Xs * (X1 - X0) / W;
    z.y = Ys * (Y1 - Y0) / H;
    
    n = abs(JuliaColor(z, c));
    
    float nF = float(n);
    return vec3(nF / 255.0, nF / 120.0, nF / 40.0);
}

void main() {
    //o_color = vec4(1, 0, 1, 1);
    //o_color = vec4(PutMandel(window_height, window_width), 1);
    o_color = vec4(PutJulia(window_height, window_width) * color, 1);
}