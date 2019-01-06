attribute vec3 position;
attribute vec4 color;

uniform mat4 translation;
uniform mat4 rotation;
uniform mat4 zoom;
uniform mat4 perspective;

varying vec4 vColor;

void main() {
    gl_Position = translation * rotation * zoom * perspective * vec4(position, 1);
    gl_PointSize = (position[0] + 1.0) * 20.0;
    vColor = color;
}