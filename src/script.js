import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import blobVertexShader from './shaders/blob/blobVertexShader.glsl';
import blobFragmentShader from './shaders/blob/blobFragmentShader.glsl';
import common from './shaders/common.glsl';

/**
 * Base
 */
// Debug
// const gui = new dat.GUI({ width: 340 });
// const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f0f8ff');

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
directionalLight.angle = 0.63;
directionalLight.distance = 8.27;
directionalLight.position.set(-2.20, 2.73, -1.8);
scene.add(directionalLight);

const light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
light.angle = 0.1;
light.distance = 11.27;
light.position.set(-2.73, -3.73, 5.7);
scene.add( light );

const light2 = new THREE.DirectionalLight( 0xffffff, 1, 100 );
light.angle = 0.21;
light.distance = 1.27;
light2.position.set(2.73, 1.73, 6.7);
scene.add( light2 );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500;

const axesHelper = new THREE.AxesHelper(12);
// scene.add(axesHelper);

/**
 * Blob
 */
// Geometry
const blobGeometry = new THREE.IcosahedronGeometry(1, 164);

const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/4.png')

const blobMaterial = new THREE.MeshPhongMaterial({
	// roughness: 0.0,
	// metalness: 0.0,
	map: gradientTexture,
	shininess: 100,
	specular: 0xffffff,
	// blending: THREE.AdditiveBlending
	// opacity: 0.98,
	// transparent: true
	// wireframe: true
	// color: new THREE.Color('white'),
});

const customUniforms = {
	uTime: { value: 0 },
	uSpeed: { value: 0.2 },
	uNoiseDensity: { value: 0.6 },
	uNoiseStrength: { value: 0.8 },
	uFrequency: { value: 6.0 },
	uAmplitude: { value: 6.0 },
};

blobMaterial.onBeforeCompile = (shader) => {
	console.log(shader);

	shader.uniforms.uTime = customUniforms.uTime;
	shader.uniforms.uSpeed = customUniforms.uSpeed;
	shader.uniforms.uNoiseDensity = customUniforms.uNoiseDensity;
	shader.uniforms.uNoiseStrength = customUniforms.uNoiseStrength;
	shader.uniforms.uFrequency = customUniforms.uFrequency;
	shader.uniforms.uAmplitude = customUniforms.uAmplitude;

	shader.vertexShader = shader.vertexShader.replace(
		'#include <common>',
		`
				#include <common>
				uniform float uTime;
				uniform float uSpeed;
				uniform float uNoiseDensity;
				uniform float uNoiseStrength;
				uniform float uFrequency;
				uniform float uAmplitude;

				${common}
		`
	);

	shader.vertexShader = shader.vertexShader.replace(
		'#include <begin_vertex>',
		`
		#include <begin_vertex>
		${blobVertexShader}
		`
	);
};

// Mesh
const blob = new THREE.Mesh(blobGeometry, blobMaterial);
blob.castShadow = true;
blob.receiveShadow = true;
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
camera.position.set(2, 2, 1);
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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
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
