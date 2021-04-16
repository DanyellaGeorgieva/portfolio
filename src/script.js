import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import blobVertexShader from './shaders/blob/blobVertexShader.glsl';
import blobFragmentShader from './shaders/blob/blobFragmentShader.glsl';

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
scene.background = new THREE.Color('hotpink');

const axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);
// gui.add(ambientLight, 'intensity').min(0).max(10).step(0.001);

// const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
// scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xfff000, 0.5, 10, 2);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
scene.add(rectAreaLight);

/**
 * Blob
 */
// Geometry
const blobGeometry = new THREE.SphereGeometry(2, 32, 64);

// Material
const blobMaterial = new THREE.ShaderMaterial({
	vertexShader: blobVertexShader,
	fragmentShader: blobFragmentShader,
	uniforms: THREE.UniformsUtils.merge([
		THREE.UniformsLib['lights'],
		{
			diffuse: { type: 'c', value: new THREE.Color(0xff00ff) },
			uWavesElevation: { value: 10 },
			uWavesSpeed: { value: 0.14 },
			uFrequency: { value: 2 },
			uNoiseStrength: { value: 2.2 },
			uNoiseDensity: { value: 0.2 },
			uTime: { value: 0 },
		},
	]),
	// wireframe: true,
	// transparent: true,
	lights: true,
});

// Mesh
const blob = new THREE.Mesh(blobGeometry, blobMaterial);
scene.add(blob);

gui.add(blobMaterial.uniforms.uWavesElevation, 'value').min(0).max(20).step(0.1).name('uWavesElevation');
gui.add(blobMaterial.uniforms.uWavesSpeed, 'value').min(0).max(1).step(0.001).name('uWavesSpeed');
gui.add(blobMaterial.uniforms.uFrequency, 'value').min(0).max(10).step(0.001).name('uFrequency');
gui.add(blobMaterial.uniforms.uNoiseStrength, 'value').min(0).max(10).step(0.001).name('uNoiseStrength');
gui.add(blobMaterial.uniforms.uNoiseDensity, 'value').min(0).max(1).step(0.001).name('uNoiseDensity');

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
camera.position.set(1, 1, 8);
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
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Update shader material
	blobMaterial.uniforms.uTime.value = elapsedTime;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
