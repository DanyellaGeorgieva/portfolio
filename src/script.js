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
			uWavesSpeed: { value: 0.08 },
			uFrequency: { value: 0.6 },
			uNoiseStrength: { value: 2.2 },
			uNoiseDensity: { value: 0.05 },
			uTime: { value: 0 },
		},
	]),
	// wireframe: true,
	transparent: true,
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
camera.position.set(0, 0, 8);
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

// Custom global variables
var mouse = {
  x: 0,
  y: 0
};

let light = new THREE.PointLight(0xffffff);
  light.position.set(0, 0, 0);
  scene.add(light);

  // Create a circle around the mouse and move it
  // The sphere has opacity 0
  var mouseGeometry = new THREE.SphereGeometry(0.02, 2, 2);
  var mouseMaterial = new THREE.MeshLambertMaterial({});
  let mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);

  mouseMesh.position.set(0, 0, 0);
  scene.add(mouseMesh);

  // When the mouse moves, call the given function
  document.addEventListener('mousemove', onMouseMove, false);

	function onMouseMove(event) {

		// Update the mouse variable
		event.preventDefault();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	
		// Make the sphere follow the mouse
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.2);
		vector.unproject(camera);
		var dir = vector.sub(camera.position).normalize();
		var distance = -camera.position.z / dir.z;
		var pos = camera.position.clone().add(dir.multiplyScalar(distance));
		//mouseMesh.position.copy(pos);
	
		light.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z + 1));
	};
	

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
