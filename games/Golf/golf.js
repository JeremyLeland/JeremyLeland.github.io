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
      this.addBall()

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
      const LEVEL_WIDTH = 100, LEVEL_DEPTH = 100
      const LEVEL_WIDTH_SEGMENTS = 128, LEVEL_DEPTH_SEGMENTS = 128
      const LEVEL_MIN_HEIGHT = -2, LEVEL_MAX_HEIGHT = 8

      const geometry = new THREE.PlaneBufferGeometry( LEVEL_WIDTH, LEVEL_DEPTH, LEVEL_WIDTH_SEGMENTS - 1, LEVEL_DEPTH_SEGMENTS - 1 )
      geometry.rotateX( -Math.PI / 2 )

      const heightData = this.generateHeight( LEVEL_WIDTH_SEGMENTS, LEVEL_DEPTH_SEGMENTS, LEVEL_MIN_HEIGHT, LEVEL_MAX_HEIGHT )

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

      const groundShape = this.createTerrainShape(LEVEL_WIDTH, LEVEL_DEPTH, LEVEL_WIDTH_SEGMENTS, LEVEL_DEPTH_SEGMENTS, LEVEL_MIN_HEIGHT, LEVEL_MAX_HEIGHT, heightData);
      const groundTransform = new Ammo.btTransform();
      groundTransform.setIdentity();
      // Shifts the terrain, since bullet re-centers it on its bounding box.
      groundTransform.setOrigin( new Ammo.btVector3( 0, ( LEVEL_MAX_HEIGHT + LEVEL_MIN_HEIGHT ) / 2, 0 ) );
      const groundMass = 0;
      const groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
      const groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
      const groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
      this.physicsWorld.addRigidBody( groundBody );

      this.transformAux1 = new Ammo.btTransform();
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

   createTerrainShape(width, depth, widthSegments, depthSegments, minHeight, maxHeight, heightData) {
      // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
      const heightScale = 1;

      // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
      const upAxis = 1;

      // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
      const hdt = "PHY_FLOAT";

      // Set this to your needs (inverts the triangles)
      const flipQuadEdges = false;

      // Creates height data buffer in Ammo heap
      const ammoHeightData = Ammo._malloc( 4 * widthSegments * depthSegments );

      // Copy the javascript height data array to the Ammo one.
      let p = 0;
      let p2 = 0;

      for ( let j = 0; j < depthSegments; j ++ ) {
         for ( let i = 0; i < widthSegments; i ++ ) {
            // write 32-bit float data to memory
            Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];

            p ++;

            // 4 bytes/float
            p2 += 4;
         }
      }

      // Creates the heightfield physics shape
      const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
         widthSegments,
         depthSegments,
         ammoHeightData,
         heightScale,
         minHeight,
         maxHeight,
         upAxis,
         hdt,
         flipQuadEdges
      );

      // Set horizontal scale
      const scaleX = width / ( widthSegments - 1 );
      const scaleZ = depth / ( depthSegments - 1 );
      heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

      heightFieldShape.setMargin( 0.05 );

      return heightFieldShape;
   }

   addBall() {
      const margin = 0.05
      const radius = 2.0
      const threeObject = new THREE.Mesh( new THREE.SphereBufferGeometry( radius, 20, 20 ), new THREE.MeshPhongMaterial( { color: "white" } ) );
      const physicsShape = new Ammo.btSphereShape( radius );
      physicsShape.setMargin( margin );

      threeObject.position.set( -20, 10, 10);

      const mass = 5;
      const localInertia = new Ammo.btVector3( 0, 0, 0 );
      physicsShape.calculateLocalInertia( mass, localInertia );
      const transform = new Ammo.btTransform();
      transform.setIdentity();
      const pos = threeObject.position;
      transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
      const motionState = new Ammo.btDefaultMotionState( transform );
      const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
      const body = new Ammo.btRigidBody( rbInfo );

      threeObject.userData.physicsBody = body;

      threeObject.receiveShadow = true;
      threeObject.castShadow = true;

      this.ball = threeObject

      this.scene.add( threeObject );
      this.physicsWorld.addRigidBody( body );
   }

   update(dt) {
      // TODO: use three.js clock for dt?

      this.physicsWorld.stepSimulation( dt, 10 )

      const objThree = this.ball
      const objPhys = objThree.userData.physicsBody
      const ms = objPhys.getMotionState()

      if (ms) {
         ms.getWorldTransform( this.transformAux1 )
         const p = this.transformAux1.getOrigin()
         const q = this.transformAux1.getRotation()
         objThree.position.set( p.x(), p.y(), p.z() )
         objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() )
      }
   }

   render(renderer) {
      renderer.render( this.scene, this.camera )
   }
}
