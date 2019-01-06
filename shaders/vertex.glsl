attribute vec3 position;
attribute vec4 color;
uniform mat4 transformation;
uniform mat4 perspective;
varying vec4 vColor;

void main() {
    gl_Position = transformation * perspective * vec4(position, 1);
    gl_PointSize = (position[0] + 1.0) * 20.0;
    vColor = color;
}