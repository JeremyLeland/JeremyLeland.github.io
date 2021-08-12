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

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.addEventListener( 'change', () => this.render() );
    this.controls.minDistance = 0;
    this.controls.maxDistance = 20;

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
    
    this.update = ( dt ) => {};
  }

  render() {
    requestAnimationFrame( ( ) => this.draw() );
  }

  animate( now ) {
    this.lastTime ??= now;  // for first call only
    this.update( now - this.lastTime );
    this.lastTime = now;

    this.draw();

    requestAnimationFrame( ( time ) => this.animate( time ) );
  }

  draw() {
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
    this.stats.update();
  }

  addToGui(uniform) {
    if ( uniform.value != null && ( uniform.showInGUI ?? true ) ) {
      if ( uniform.value instanceof THREE.Vector3 ) {
        [ 'x', 'y', 'z' ].forEach( e => {
          this.gui.add( uniform.value, e ).min( -10 ).max( 10 ).name( e ).onChange( () => this.render() );
        });
      }
      else if ( uniform.value instanceof Object ) {
        for ( let e in uniform.value ) {
          this.gui.add( uniform.value, e ).min( -10 ).max( 10 ).name( e ).onChange( () => this.render() );
        }
      }
      else {
        this.gui.add( uniform, 'value' ).
          min( uniform.min ?? 0 ).
          max( uniform.max ?? Math.pow( 10, Math.ceil( Math.log10( uniform.value ) ) ) * 0.5 ).
          step( uniform.step ?? 0.01 ).
          name( uniform.name ?? 'moo' ).
          onChange( () => this.render() );
      }
    }
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