uniform vec3 diffuse;
varying vec3 vPos;
varying vec3 vNormal;

struct PointLight {
	vec3 position;
	vec3 color;
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main() {
	vec4 addedLights = vec4(0.2, 0.0, 0.5, 0.6);

	for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
		vec3 adjustedLight = pointLights[l].position + cameraPosition;
		vec3 lightDirection = normalize(vPos - adjustedLight);
		addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * pointLights[l].color;
	}

	// gl_FragColor = addedLights;
	gl_FragColor = mix(vec4(diffuse.x, diffuse.y, diffuse.z, 1.0), addedLights, addedLights);
}