import './style.css';
import * as THREE from 'three';
import { ShaderChunk } from 'three';

import displacement from './shaders/displacement.glsl';
import headers from './shaders/headers.glsl';

import { toggleModal } from './modal';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('white', 0.8);
scene.add(ambientLight);

/**
 * Blob
 */
// Geometry
const blobGeometry = new THREE.SphereBufferGeometry(1.6, 200, 200);

const loadingManager = new THREE.LoadingManager();

const loadingBarElement = document.querySelector('.loader');

loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) => {
	console.log('loading progressing');

	const progressRatio = itemsLoaded / itemsTotal;
	loadingBarElement.style.transform = `scaleX(${progressRatio})`;

	if (progressRatio == 1) {
		loadingBarElement.style.display = 'none';
	}
};

const textureLoader = new THREE.TextureLoader(loadingManager);

const chillingTexture = textureLoader.load('gradients/chilling.png');
const hypedTexture = textureLoader.load('gradients/hyped.png');

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const environmentMapTexture = cubeTextureLoader.load([
	'/environmentMaps/0/px.jpg',
	'/environmentMaps/0/nx.jpg',
	'/environmentMaps/0/py.jpg',
	'/environmentMaps/0/ny.jpg',
	'/environmentMaps/0/pz.jpg',
	'/environmentMaps/0/nz.jpg',
]);

const blobMaterial = new THREE.MeshPhysicalMaterial({
	map: chillingTexture,
	envMap: environmentMapTexture,
	roughness: 0.1,
	metalness: 0.05,
	transparent: true,
	opacity: 1,
});

const customUniforms = {
	uTime: { value: 0 },
	uSpeed: { value: 0.24 },
	uFrequency: { value: 2.9 },
	uDistort: { value: 0.1 },
	uFixNormals: { value: true },
};

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
blob.rotation.x = 4.2;
blob.rotation.y = 1.4;
blob.rotation.z = 5.2;

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

if (sizes.width < 786) {
	camera.fov = 90;
	camera.updateProjectionMatrix();
}

camera.position.set(0, 0, 3.6);
camera.lookAt(scene.position);

scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0xffffff, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
let mouse = {
	x: 0,
	y: 0,
};

let pointLight = new THREE.PointLight('lightblue', 2.6, 1.82, 2);
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

	// Update the blob to follow the mouse
	blob.rotation.x = -Math.sin(mouse.y) * Math.PI * 0.1 - 1;
	blob.rotation.y = Math.sin(mouse.x) * Math.PI * 0.1 - 1;

	// Update shader material
	customUniforms.uTime.value = elapsedTime;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();

// DOM interactions
const buttons = document.querySelectorAll('.nav-button');

for (let button of buttons) {
	let typeOfBtn = button.getAttribute('data-type');

	button.addEventListener('click', () => {
		for (let button of buttons) {
			button.classList.remove('selected');
		}

		button.classList.add('selected');
		toggleModal(`modal-${typeOfBtn}`);
	});
}

// Horizontal Scrolling
const scrollContainer = document.querySelector(
	'.modal-projects-cards-container'
);

scrollContainer.addEventListener('wheel', function (e) {
	if (e.deltaY > 0) scrollContainer.scrollLeft += e.deltaY;
	else scrollContainer.scrollLeft -= -e.deltaY;
});

const checkbox = document.getElementById('checkbox');
const body = document.querySelector('body');

// Change theme
let counter = 0;

checkbox.addEventListener('click', () => {
	body.classList.remove('hyped');

	if (checkbox.checked == true) {
		body.classList.add('hyped');
		blobMaterial.map = hypedTexture;
		blobMaterial.clearcoat = 0.8;

		const id = setInterval(expandFrame, 33);

		function expandFrame() {
			if (counter == 5) {
				clearInterval(id);
			} else {
				counter++;
				customUniforms.uDistort.value += 0.1;
			}
		}
	} else {
		blobMaterial.map = chillingTexture;

		const id = setInterval(expandFrame, 33);
		function expandFrame() {
			if (counter == 0) {
				clearInterval(id);
			} else {
				counter--;
				customUniforms.uDistort.value -= 0.1;
			}
		}
	}
});
