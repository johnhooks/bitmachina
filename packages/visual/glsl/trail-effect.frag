// Pass in time
uniform float time;

// Pass in normalised mouse coordinates
uniform vec2 mousePos;

// Declare our texture input as a "sampler" variable
uniform sampler2D sampler;

// Consume the correct UVs from the vertex shader to use
// when displaying the generated texture
varying vec2 v_uv;

#include "lygia/generative/snoise.glsl"

void main() {
      float a = snoise(vec3(v_uv * 1.0, time * 0.1)) * 0.0032;
      float b = snoise(vec3(v_uv * 1.0, time * 0.1 + 100.0)) * 0.0032;
      // Sample the correct color from the generated texture
      vec4 inputColor = texture2D(sampler, v_uv + vec2(a, b) + mousePos * 0.005);
      // Set the correct color of each pixel that makes up the plane
      gl_FragColor = vec4(inputColor * 0.975);
}
