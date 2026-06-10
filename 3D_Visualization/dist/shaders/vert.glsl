#version 300 es

layout(location = 0) in vec3 a_position;

out vec2 v_position;

void main() {
    v_position = a_position.xy;
    gl_Position = vec4(a_position, 1.0);
}