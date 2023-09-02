// Discoteq 2
// https://www.shadertoy.com/view/DtXfDr
// 创建自 supah 内 2023-08-23
AFRAME.registerShader("discoteq2", {
  schema: {
    iTime: { type: "time", is: "uniform" },
  },
  vertexShader: `
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `,
  fragmentShader: `
  #define S smoothstep
  uniform float iTime;

  varying vec3 vWorldPosition;

  vec4 Line(vec2 uv, float speed, float height, vec3 col) {
    uv.y += S(1., 0., abs(uv.x)) * sin(iTime * speed + uv.x * height) * .2;
    return vec4(S(.06 * S(.2, .9, abs(uv.x)), 0., abs(uv.y) - .004) * col, 1.0) * S(1., .3, abs(uv.x));
  }

  void main() {
    vec2 uv = vWorldPosition.xy / vWorldPosition.y;
    vec4 O = vec4 (0.);
    for (float i = 0.; i <= 5.; i += 1.) {
        float t = i / 5.;
        O += Line(uv, 1. + t, 4. + t, vec3(.2 + t * .7, .2 + t * .4, 0.3));
    }
    gl_FragColor = O;
  }
  `,
});
