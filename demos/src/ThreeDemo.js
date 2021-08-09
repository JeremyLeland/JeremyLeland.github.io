export * as THREE from '../lib/three.module.js';
export * as ShaderChunks from '../src/ShaderChunks.js';

import Stats from '../lib/stats.module.js';
import { GUI } from '../lib/dat.gui.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

export class ThreeDemo {
  constructor( { cameraPos: { x = 0, y = 0, z = 5 } } = {} ) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222255);

    this.light = new THREE.DirectionalLight(0xffffff);
    this.light.position.set(0, 1.0, 0.5);
    this.light.target.position.set(0, 0, 0);
    this.scene.add( this.light );

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 2);

    this.renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 1;
    controls.maxDistance = 10;

    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      requestAnimationFrame(animate);
    }
    window.onresize();

    // Other UI
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    
    this.gui = new GUI();
  }
}

function addGuiColor(part, gui) {
  const uniform = material.uniforms[`${part}Color`];
  gui.addColor(uniform, 'hex').name(`Color`).onChange((hexColor) => {
    uniform.value.set(...hexToRgb(hexColor));
    render();
  });
}

function hexToRgb(hex) {
  return [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(e => parseInt(e, 16) / 255);
}