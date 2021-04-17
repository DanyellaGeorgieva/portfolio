uniform vec3 diffuse;
varying vec3 vPos;
varying vec3 vNormal;

struct PointLight {
	vec3 position;
	vec3 color;
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main() {
	vec4 addedLights = vec4(0.2, 0.0, 0.8, 1.0);

	for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
		vec3 adjustedLight = pointLights[i].position + cameraPosition;
		vec3 lightDirection = normalize(vPos - adjustedLight);
		addedLights.rgb -= clamp(dot(-lightDirection, vNormal), 0.04, 0.3) * pointLights[i].color;
	}

	// gl_FragColor = addedLights;
	gl_FragColor = mix(vec4(diffuse.x, diffuse.y, diffuse.z, 1.0), addedLights, addedLights);
}