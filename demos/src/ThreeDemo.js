import * as THREE from '../lib/three.module.js';
export * as ShaderChunks from '../src/ShaderChunks.js';

import Stats from '../lib/stats.module.js';
import { GUI } from '../lib/dat.gui.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

export class ThreeDemo {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222255);

    this.light = new THREE.DirectionalLight(0xffffff);
    this.light.position.set(0, 1.0, 0.5);
    this.light.target.position.set(0, 0, 0);
    this.scene.add( this.light );

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set( 0, 0, 2 );

    this.renderer = new THREE.WebGLRenderer();
    document.body.appendChild( this.renderer.domElement );

    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.addEventListener( 'change', () => this.render() );
    controls.minDistance = 1;
    controls.maxDistance = 10;

    window.onresize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.render();
    }
    window.onresize();

    // Other UI
    this.stats = new Stats();
    document.body.appendChild( this.stats.dom );
    
    this.gui = new GUI();
  }

  render() {
    requestAnimationFrame( ( time ) => this.animate( time ) );
  }

  animate( time ) {
    // requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.camera );
    this.stats.update();
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