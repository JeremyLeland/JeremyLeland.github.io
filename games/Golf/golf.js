import * as THREE from "./libs/three.module.js" //'https://unpkg.com/three/build/three.module.js'
import { OrbitControls } from './libs/OrbitControls.js'
import { Game } from "./game.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.01

      super()

      this.keyBindings = { }

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color( 0xbfd1e5 )

      this.camera.position.y = 40
      this.camera.position.z = 40
      this.camera.lookAt(0, 0, 0)

      const controls = new OrbitControls( this.camera, this.renderer.domElement )

      this.prepareTerrain()
      this.prepareLights()

      this.startGame()
   }

   prepareLights() {
      const light = new THREE.DirectionalLight( 0xffffff, 1 );
      light.position.set( 100, 100, 50 );
      light.castShadow = true;
      const dLight = 200;
      const sLight = dLight * 0.25;
      light.shadow.camera.left = - sLight;
      light.shadow.camera.right = sLight;
      light.shadow.camera.top = sLight;
      light.shadow.camera.bottom = - sLight;

      light.shadow.camera.near = dLight / 30;
      light.shadow.camera.far = dLight;

      light.shadow.mapSize.x = 1024 * 2;
      light.shadow.mapSize.y = 1024 * 2;

      this.scene.add( light );
   }

   prepareTerrain() {
      const LEVEL_WIDTH = 100, LEVEL_HEIGHT = 100
      const LEVEL_WIDTH_SEGMENTS = 128, LEVEL_HEIGHT_SEGMENTS = 128

      const geometry = new THREE.PlaneBufferGeometry( LEVEL_WIDTH, LEVEL_HEIGHT, LEVEL_WIDTH_SEGMENTS - 1, LEVEL_HEIGHT_SEGMENTS - 1 )
      geometry.rotateX( -Math.PI / 2 )

      const heightData = this.generateHeight( LEVEL_WIDTH_SEGMENTS, LEVEL_HEIGHT_SEGMENTS, -2, 8 )

      const vertices = geometry.attributes.position.array
      for (let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3) {
         // j + 1 because we are modifying the Y component
         vertices[ j + 1 ] = heightData[ i ]
      }
      geometry.computeVertexNormals()

      const groundMaterial = new THREE.MeshPhongMaterial( { color: 0xC7C7C7 } );
      const terrainMesh = new THREE.Mesh( geometry, groundMaterial );
      terrainMesh.receiveShadow = true;
      terrainMesh.castShadow = true;

      this.scene.add( terrainMesh )

      const textureLoader = new THREE.TextureLoader()
      textureLoader.load( "textures/Seamless_golf_green_grass_texture.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         texture.repeat.set(10, 10)
         groundMaterial.map = texture
         groundMaterial.needsUpdate = true
      })

      textureLoader.load( "textures/Seamless_golf_green_grass_texture_DISP.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         texture.repeat.set(10, 10)
         groundMaterial.displacementMap = texture
         groundMaterial.displacementScale = 0.4
         groundMaterial.needsUpdate = true
      })

      textureLoader.load( "textures/Seamless_golf_green_grass_texture_NORMAL.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         texture.repeat.set(10, 10)
         groundMaterial.normalMap = texture
         groundMaterial.needsUpdate = true
      })
   }

   generateHeight(width, depth, minHeight, maxHeight) {
      const size = width * depth;
      const data = new Float32Array( size );

      const hRange = maxHeight - minHeight;
      const w2 = width / 2;
      const d2 = depth / 2;
      const phaseMult = 12;

      let p = 0;

      for ( let j = 0; j < depth; j ++ ) {
         for ( let i = 0; i < width; i ++ ) {
            const radius = Math.sqrt(
               Math.pow( ( i - w2 ) / w2, 2.0 ) +
                  Math.pow( ( j - d2 ) / d2, 2.0 ) );
            const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;
            data[ p ] = height;
            p ++;
         }
      }

      return data;
   }

   update(dt) {
   }

   render(renderer) {
      renderer.render( this.scene, this.camera )
   }
}
