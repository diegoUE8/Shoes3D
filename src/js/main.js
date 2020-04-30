/* jshint esversion: 6 */
/* global window, document, TweenMax, THREE, WEBVR */

// import * as THREE from 'three';
//import { threadId } from 'worker_threads';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import InteractiveMesh from './interactive/interactive.mesh';

class webvr {

	constructor() {
		this.i = 0;
		this.mouse = { x: 0, y: 0 };
		this.parallax = { x: 0, y: 0 };
		this.size = { width: 0, height: 0, aspect: 0 };
		this.cameraDirection = new THREE.Vector3();
		this.init();
	}

	init() {
		this.render = this.render.bind(this);

		const section = this.section = document.querySelector('.webvr');
		const container = this.container = section.querySelector('.webvr__container');
		const debugInfo = this.debugInfo = section.querySelector('.debug__info');

		const scene = this.scene = new THREE.Scene();

		const camera = this.camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
		camera.position.set(-1.8, 0.6, 2.7);
		camera.target = new THREE.Vector3();

		const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setClearColor(0x666666, 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.offsetWidth, container.offsetHeight);
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.8;
		renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild(renderer.domElement);

		const controls = this.controler = new OrbitControls(camera, renderer.domElement);
		controls.addEventListener('change', this.render); // use if there is no animation loop
		controls.minDistance = 2;
		controls.maxDistance = 10
		controls.target.set(0, 0, -0.2);
		controls.update();

		const pivot = this.pivot = new THREE.Group();
		this.scene.add(pivot);

		this.loadRgbeBackground('/Shoes3D/textures/equirectangular/', 'leadenhall_market_2k.hdr', (envMap) => {
			this.render();
			this.loadGltfModel('/Shoes3D/models/gltf/model/gltf/', 'worn_brown_boots.gltf', (model) => {
				pivot.scale.set(1.5, 1.5, 1.5);
				pivot.position.set(0, -0.2, 0); //-0.5
				pivot.add(model);
				this.render();
			});
		});

		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	loadRgbeBackground(path, file, callback) {
		const scene = this.scene;
		const renderer = this.renderer;
		const pmremGenerator = new THREE.PMREMGenerator(renderer);
		pmremGenerator.compileEquirectangularShader();
		const loader = new RGBELoader();
		loader
			.setDataType(THREE.UnsignedByteType)
			.setPath(path)
			.load(file, function (texture) {
				const envMap = pmremGenerator.fromEquirectangular(texture).texture;
				scene.background = envMap;
				scene.environment = envMap;
				texture.dispose();
				pmremGenerator.dispose();
				if (typeof callback === 'function') {
					callback(envMap);
				}
			});
		return loader;
	}

	loadGltfModel(path, file, callback) {
		const renderer = this.renderer;
		const roughnessMipmapper = new RoughnessMipmapper(renderer); // optional
		const loader = new GLTFLoader().setPath(path);
		loader.load(file, function (gltf) {
			gltf.scene.traverse(function (child) {
				if (child.isMesh) {
					roughnessMipmapper.generateMipmaps(child.material);
				}
			});
			if (typeof callback === 'function') {
				callback(gltf.scene);
			}
			roughnessMipmapper.dispose();
		});
	}

	updateRaycaster() {
		try {
			/*
			const controllers = this.controllers;
			const controller = controllers.controller;
			if (controller) {
				const raycaster = this.raycaster;
				const position = controller.position;
				const rotation = controller.getWorldDirection(controllers.controllerDirection).multiplyScalar(-1);
				raycaster.set(position, rotation);
				const hit = InteractiveMesh.hittest(raycaster, controllers.gamepads.button);
			}
			*/
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	render(delta) {
		try {
			// this.updateOld();
			const renderer = this.renderer;
			renderer.render(this.scene, this.camera);
			this.i++;
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	animate() {
		const renderer = this.renderer;
		renderer.setAnimationLoop(() =>
			this.render());
	}

	onWindowResize() {
		try {
			const container = this.container,
				renderer = this.renderer,
				camera = this.camera;
			const size = this.size;
			size.width = container.offsetWidth;
			size.height = container.offsetHeight;
			size.aspect = size.width / size.height;
			if (renderer) {
				renderer.setSize(size.width, size.height);
			}
			if (camera) {
				camera.aspect = size.width / size.height;
				camera.updateProjectionMatrix();
			}
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	initOld__() {
		const loader = new THREE.TextureLoader();
		//plane
		/*
		const material3 = new THREE.MeshLambertMaterial({
			map: loader.load('img/examples/360_world.jpg')
			//'https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/cat.jpg'
		});
		const geometry3 = new THREE.PlaneGeometry(300, 200);
		//1, 1 * .75
		// combine our image geometry and material into a mesh
		const meshPlane = new THREE.Mesh(geometry3, material3);
		// set the position of the image mesh in the x,y,z dimensions
		meshPlane.position.set(0, 0, -110)
		// add the image to the scene
		scene.add(meshPlane);
		*/
		const light2 = new THREE.PointLight(0xffffff, 1, 0);
		// Specify the light's position
		light2.position.set(1, 1, 100);
		// Add the light to the scene
		scene.add(light2)
		const materialLoader1 = new THREE.MTLLoader().load('models/valagro/valagro.mtl', (materials1) => {
			console.log(materials1);
			materials1.preload();
			this.materials1 = materials1;
		});
		const materialLoader2 = new THREE.MTLLoader().load('models/oil/oilbottle.mtl', (materials2) => {
			console.log(materials2);
			materials2.preload();
			this.materials2 = materials2;
			this.loadObjects__();
		});
	}

	loadObjects__() {

		//object 3d obj
		const meshtest1 = new THREE.Object3D();
		const meshtest2 = new THREE.Object3D();
		const meshtest3 = new THREE.Object3D();
		const meshTest4 = new THREE.Object3D();

		const textureObj = new THREE.TextureLoader().load('img/floor.jpg');
		const materialObj1 = new THREE.MeshMatcapMaterial({
			color: 0x00ffff,
			//matcap: textureObj,
			transparent: true,
			opacity: 1,
		});

		const loaderObj1 = new THREE.OBJLoader();
		loaderObj1.load(
			'models/logo/logo_ws.obj',

			(object) => {

				object.traverse((child) => {
					// console.log(child);
					if (child instanceof THREE.Mesh) {
						child.material = materialObj1;
						child.geometry.translate(0, 0, -10);
					}
				});

				meshtest1.add(object);
			},
			(xhr) => {
				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			(error) => {
				console.log('An error happened');
			}
		);

		/*const loaderObj2 = new THREE.OBJLoader();
		loaderObj2.setMaterials(this.materials1);
		loaderObj2.load(
			'models/valagro/valagro.obj',

			(object) => {

				object.traverse((child) => {
					// console.log(child);
					if (child instanceof THREE.Mesh) {
						// child.material = materialObj2;
						child.geometry.translate(0, 0, -100);
					}
				});

				object.onBeforeRender = () => {

				}

				this.object2 = object;

				meshtest2.add(object);
			},
			(xhr) => {
				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			(error) => {
				console.log('An error happened');
			}
		);

		const loaderObj3 = new THREE.OBJLoader();
		loaderObj3.setMaterials(this.materials2);
		loaderObj3.load(
			'models/oil/oilbottle.obj',

			(object) => {

				object.traverse((child) => {

					if (child instanceof THREE.Mesh) {

						child.geometry.translate(0, 0, -80);
					}
				});

				object.onBeforeRender = () => {

				}

				this.object3 = object;

				meshtest3.add(object);
			},
			(xhr) => {
				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			(error) => {
				console.log('An error happened');
			}
		);

		const loaderFBX = new THREE.FBXLoader();
		loaderFBX.load(
			'models/oil/objects.fbx',
			(object) => {
				object.setMaterials(materialObj1);
				object.position(0, 0, -50);

				object.onBeforeRender = () => {

					},
					this.object4 = object;
				meshTest4.add(object);
			},
			(xhr) => {
				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			(error) => {
				console.log('An error happened');
			}
		);*/

		const loaderGLTF = new GLTFLoader();
		loaderGLTF.load(
			'models/GLTF/tau-marin.gltf',
			(object) => {

				object.traverse((child) => {

					if (child instanceof THREE.Mesh) {

						child.geometry.translate(0, 0, -80);
					}
				});

				object.onBeforeRender = () => {

				}

				this.object3 = object;

				meshTest4.add(object);
			},
			(xhr) => {
				// called while loading is progressing
				//console.log(`${( xhr.loaded / xhr.total * 100 )}% loaded`);
			},
			(error) => {
				// called when loading has errors
				console.error('An error happened', error);
			},
		);

		this.scene.add(meshtest1);
		//this.scene.add(meshtest2);
		//this.scene.add(meshtest3);
		this.scene.add(meshTest4);

		//oggetto1
		const geometry = new THREE.BoxGeometry(0.5, 0.3, 0.3);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
		//oggetto2
		const material2 = new THREE.MeshLambertMaterial({ color: 0xe4059 });
		const geometry2 = new THREE.DodecahedronGeometry(0.5, 0)

		const cube = this.cube = new InteractiveMesh(geometry, material);
		//cube.geometry.vertices[0].Vector3(2, 1, 1);
		cube.geometry.verticesNeedUpdate = true;

		const prisme = this.prisme = new InteractiveMesh(geometry2, material2);

		cube.position.set(-3, 1, -5);
		prisme.position.set(3, 1, -5);

		cube.on('over', () => {
			cube.material.color.setHex(0xff0000);
		});
		cube.on('out', () => {
			cube.material.color.setHex(0x00ff00);
		});
		cube.on('down', () => {
			cube.material.color.setHex(0xffffff);
		});
		cube.on('up', () => {
			cube.material.color.setHex(0x0000ff);
		});
		this.scene.add(cube, prisme);

		const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
		this.scene.add(light);

		const raycaster = this.raycaster = new THREE.Raycaster();

	}

	updateOld__() {
		const s = 1 + Math.cos(this.i * 0.1) * 0.5;
		if (this.cuber) {
			this.cube.rotation.y += Math.PI / 180 * 5;
			this.cube.rotation.x += Math.PI / 180 * 1;
			this.cube.scale.set(s, s, s);
		}
		if (this.prisme) {
			this.prisme.rotation.y += Math.PI / 180 * 5;
			this.prisme.rotation.x += Math.PI / 180 * 1;
			this.prisme.scale.set(s, s, s);
		}
		//this.object2.rotation.z += Math.PI / 180 * 1;
		//this.object3.rotation.z -= Math.PI / 180 * 1;
		//this.prisme.position.x += 0.001;
		//this.prisme.position.y += 0.002;
		if (this.controllers) {
			this.controllers.update();
		}
		// this.updateRaycaster();
	}

}

const tour = new webvr();
// tour.animate();
