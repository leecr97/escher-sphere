#version 300 es
precision highp float;

uniform mat4 u_ViewProj;
uniform float u_Time;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color

// instance rendering
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;
in vec4 vs_Transform4;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;

void main() {
  fs_Col = vs_Col;
  fs_Pos = vs_Pos;
  fs_Nor = vs_Nor;

  gl_Position = u_ViewProj * vs_Pos;
}
