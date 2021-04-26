float t = uTime * uSpeed;
float distortion = pnoise((normal + t) * uNoiseDensity, vec3(10.0)) * uNoiseStrength;

vec3 pos = position + (normal * distortion);
float angle = sin(uv.y * uFrequency + t) * uAmplitude;
pos = rotateY(pos, angle);

transformed = pos;
