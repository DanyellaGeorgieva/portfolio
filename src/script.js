import './style.css';
import * as THREE from 'three';
import { ShaderChunk } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import displacement from './shaders/displacement.glsl';
import headers from './shaders/headers.glsl';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0400c9');

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('white', 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('hotpink', 0.1);
directionalLight.angle = 0.6;
directionalLight.distance = 18.2;
directionalLight.position.set(2.2, 2.7, 1.8);

scene.add(directionalLight);

/**
 * Blob
 */
// Geometry
const blobGeometry = new THREE.SphereGeometry(1.6, 256, 256);

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('Rectangle7.png');

const blobMaterial = new THREE.MeshPhysicalMaterial({
	map: gradientTexture,
	roughness: 0.1,
	transparent: true,
	opacity: 1,
});

const customUniforms = {
	uTime: { value: 0 },
	uSpeed: { value: 0.3 },
	uFrequency: { value: 1.2 },
	uDistort: { value: 0.4 },
	uFixNormals: { value: true },
};

gui
	.add(customUniforms.uDistort, 'value')
	.min(0)
	.max(10)
	.step(0.01)
	.name('uDistort');
gui
	.add(customUniforms.uSpeed, 'value')
	.min(0)
	.max(10)
	.step(0.01)
	.name('uSpeed');
gui
	.add(customUniforms.uFrequency, 'value')
	.min(0)
	.max(10)
	.step(0.01)
	.name('uFrequency');

blobMaterial.onBeforeCompile = (shader) => {
	shader.uniforms.uTime = customUniforms.uTime;
	shader.uniforms.uDistort = customUniforms.uDistort;
	shader.uniforms.uFrequency = customUniforms.uFrequency;
	shader.uniforms.uSpeed = customUniforms.uSpeed;
	shader.uniforms.uFixNormals = customUniforms.uFixNormals;

	shader.vertexShader = `
      ${headers}
      ${shader.vertexShader}
    `;

	shader.vertexShader = shader.vertexShader.replace(
		'void main() {',
		`
        void main() {
          ${displacement}
      `
	);

	shader.vertexShader = shader.vertexShader.replace(
		'#include <displacementmap_vertex>',
		`transformed = displacedPosition;`
	);

	// fix normals
	// http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
	// https://codepen.io/marco_fugaro/pen/xxZWPWJ?editors=1010
	shader.vertexShader = shader.vertexShader.replace(
		'#include <defaultnormal_vertex>',
		ShaderChunk.defaultnormal_vertex.replace(
			'vec3 transformedNormal = objectNormal;',
			`vec3 transformedNormal = displacedNormal;`
		)
	);
};

// Mesh
const blob = new THREE.Mesh(blobGeometry, blobMaterial);
scene.add(blob);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);

camera.position.set(0, 0, 3.8);
camera.lookAt(scene.position);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
let mouse = {
	x: 0,
	y: 0,
};

let pointLight = new THREE.PointLight('#7ceaff', 6.2, 3.2, 2);
scene.add(pointLight);

document.addEventListener('mousemove', (event) => {
	// normalize mouse position
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	const vector = new THREE.Vector3(mouse.x, mouse.y, 0.02);
	vector.unproject(camera);
	const dir = vector.sub(camera.position).normalize();
	const distance = -camera.position.z / dir.z;
	const pos = camera.position.clone().add(dir.multiplyScalar(distance));
	pointLight.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z + 2));
});

const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Update shader material
	customUniforms.uTime.value = elapsedTime;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();