#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

// fbm
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void generateBG(vec2 pos, out float off) {
  pos /= 2.0;
  pos += vec2(0.5, 0.0);
  off = fbm(pos);
  off *= 1.5;
}

float lambert(vec4 N, vec3 L)
{
    vec3 nn = N.xyz;
    vec3 nrmN = normalize(nn);
    vec3 nrmL = normalize(L);
    float result = dot(nrmN, nrmL);
    return max(result, 0.0);
}

void main()
{
    vec3 lightPos = vec3(2.0, 1.0, 4.0);
    vec3 lightdiffuse = vec3(1.0);
    vec4 col = vec4(lightdiffuse * lambert(fs_Nor, lightPos), 1.0);

    col *= fs_Col;
    out_Col = col;

    // float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    // out_Col = vec4(dist) * fs_Col;
}