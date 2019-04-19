#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

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
