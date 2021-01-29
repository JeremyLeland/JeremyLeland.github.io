import * as THREE from "./libs/three.module.js"

export class Level {

   static SEGMENT_SIZE = 4
   static MAX_HEIGHT = 60

   constructor(scene, physicsWorld, src) {
      this.isReady = false

      const image = new Image()
      image.src = src
      image.onload = () => this.loadFromImage(scene, physicsWorld, image)
   }

   loadFromImage(scene, physicsWorld, image) {
      this.width = image.width
      this.depth = image.height
      this.heightData = new Float32Array( this.width * this.depth )

      const levelCanvas = document.createElement('canvas')
      levelCanvas.width = image.width
      levelCanvas.height = image.height
      const levelContext = levelCanvas.getContext('2d')
      levelContext.drawImage(image, 0, 0)
      const imageData = levelContext.getImageData(0, 0, levelCanvas.width, levelCanvas.height)

      let heightNdx = 0, imageNdx = 0
      for (let z = 0; z < this.depth; z ++) {
         for (let x = 0; x < this.width; x ++) {
            this.heightData[ heightNdx ] = (imageData.data[ imageNdx ] / 256) * Level.MAX_HEIGHT
            heightNdx ++
            imageNdx += 4 // skip green, blue, and alpha for now
         }
      }

      this.initGraphics( scene )
      this.initPhysics( physicsWorld )

      this.isReady = true
   }

   initGraphics(scene) {
      const geometry = new THREE.PlaneBufferGeometry( this.width * Level.SEGMENT_SIZE, 
                                                      this.depth * Level.SEGMENT_SIZE, 
                                                      this.width - 1, this.depth - 1 )
      geometry.rotateX( -Math.PI / 2 )

      const vertices = geometry.attributes.position.array
      for (let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3) {
         // j + 1 because we are modifying the Y component
         vertices[ j + 1 ] = this.heightData[ i ]
      }
      geometry.computeVertexNormals()

      const groundMaterial = new THREE.MeshPhongMaterial( { color: 0xC7C7C7 } );
      this.terrainMesh = new THREE.Mesh( geometry, groundMaterial );
      this.terrainMesh.receiveShadow = true;
      this.terrainMesh.castShadow = true;

      const REPEAT_S = 10, REPEAT_T = 10

      const textureLoader = new THREE.TextureLoader()
      textureLoader.load( "textures/Seamless_golf_green_grass_texture.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         texture.repeat.set(REPEAT_S, REPEAT_T)
         groundMaterial.map = texture
         groundMaterial.needsUpdate = true
      })

      textureLoader.load( "textures/Seamless_golf_green_grass_texture_DISP.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         texture.repeat.set(REPEAT_S, REPEAT_T)
         groundMaterial.displacementMap = texture
         groundMaterial.displacementScale = 0.4
         groundMaterial.needsUpdate = true
      })

      textureLoader.load( "textures/Seamless_golf_green_grass_texture_NORMAL.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         texture.repeat.set(REPEAT_S, REPEAT_T)
         groundMaterial.normalMap = texture
         groundMaterial.needsUpdate = true
      })

      scene.add( this.terrainMesh )
   }

   initPhysics(physicsWorld) {
      const groundShape = this.createTerrainShape(this.width * Level.SEGMENT_SIZE, this.depth * Level.SEGMENT_SIZE, 
                                                  this.width, this.depth, 0, Level.MAX_HEIGHT, this.heightData);
      const groundTransform = new Ammo.btTransform();
      groundTransform.setIdentity();
      // Shifts the terrain, since bullet re-centers it on its bounding box.
      groundTransform.setOrigin( new Ammo.btVector3( 0, Level.MAX_HEIGHT / 2, 0 ) );
      const groundMass = 0;
      const groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
      const groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
      this.groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
     
      physicsWorld.addRigidBody( this.groundBody );
   }

   release(scene, physicsWorld) {
      scene.remove( this.terrainMesh )
      physicsWorld.removeRigidBody( this.groundBody )
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
}