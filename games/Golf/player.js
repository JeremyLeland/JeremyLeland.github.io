import * as THREE from "./libs/three.module.js"

export class Player {
   constructor(scene, physicsWorld) {
      this.radius = 2.0

      this.initGraphics( scene )
      this.initPhysics( physicsWorld )
   }

   initGraphics(scene) {
      const SEGMENTS = 20

      const golfGeo = new THREE.SphereBufferGeometry( this.radius, SEGMENTS, SEGMENTS )
      const golfMaterial = new THREE.MeshPhongMaterial( { color: "white" } )
      this.threeObject = new THREE.Mesh( golfGeo, golfMaterial );

      this.threeObject.receiveShadow = true
      this.threeObject.castShadow = true

      const textureLoader = new THREE.TextureLoader()
      textureLoader.load( "textures/Seamless_Aegean_Marble_Texture.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         golfMaterial.map = texture
         golfMaterial.needsUpdate = true
      })

      textureLoader.load( "textures/Seamless_Aegean_Marble_Texture_NORMAL.jpg", function ( texture ) {
         texture.wrapS = THREE.RepeatWrapping
         texture.wrapT = THREE.RepeatWrapping
         golfMaterial.normalMap = texture
         golfMaterial.needsUpdate = true
      })

      scene.add( this.threeObject );
   }

   initPhysics(physicsWorld) {
      const margin = 0.05

      const physicsShape = new Ammo.btSphereShape( this.radius )
      physicsShape.setMargin( margin )

      const transform = new Ammo.btTransform()
      transform.setIdentity()
      const motionState = new Ammo.btDefaultMotionState( transform )
      
      const mass = 5
      const localInertia = new Ammo.btVector3( 0, 0, 0 )
      physicsShape.calculateLocalInertia( mass, localInertia )

      const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia )
      this.physicsBody = new Ammo.btRigidBody( rbInfo )

      this.physicsBody.setFriction( 0.5 )
      
      physicsWorld.addRigidBody( this.physicsBody );

      this.transformAux1 = new Ammo.btTransform()
   }

   spawn(x, y, z) {
      const worldTransform = this.physicsBody.getWorldTransform()
      worldTransform.setOrigin( new Ammo.btVector3( x, y, z ) )
      worldTransform.setRotation( new Ammo.btVector3( 1, 0, 0, 1 ) )

      this.physicsBody.setLinearVelocity( new Ammo.btVector3( 0, 0, 0 ) )
      this.physicsBody.setAngularVelocity( new Ammo.btVector3( 0, 0, 0 ) )
   }

   update(dt) {
      const ms = this.physicsBody.getMotionState()

      if (ms) {
         ms.getWorldTransform( this.transformAux1 )
         const p = this.transformAux1.getOrigin()
         const q = this.transformAux1.getRotation()
         this.threeObject.position.set( p.x(), p.y(), p.z() )
         this.threeObject.quaternion.set( q.x(), q.y(), q.z(), q.w() )
      }
   }
}