import * as THREE from "./libs/three.module.js" //'https://unpkg.com/three/build/three.module.js'

export class Game {
   static VERSION = 0

   constructor() {
      this.initGraphics()
      this.initPhysics()

      this.prepareUI()

      this.keyBindings = {}
      this.keyDown = {}
      document.onkeydown = (e) => this.keyDownCallback(e)
      document.onkeyup = (e) => this.keyUpCallback(e)
   }

   initGraphics() {
      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setSize( window.innerWidth, window.innerHeight )
      document.body.appendChild( this.renderer.domElement )

      this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

      window.addEventListener('resize', () => this.resize(), false)
   }

   initPhysics() {
      const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
      const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration )
      const broadphase = new Ammo.btDbvtBroadphase()
      const solver = new Ammo.btSequentialImpulseConstraintSolver()
      this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration )
      this.physicsWorld.setGravity( new Ammo.btVector3( 0, -9.8, 0 ) )
   }

   prepareUI() {
      this.fpsUI = document.createElement('div')
      this.fpsUI.style = "position: absolute; left: 100%; top: 100%; transform: translate(-14px, -14px); font: 10px sans-serif"
      document.body.appendChild(this.fpsUI)
      this.frames = 0
      setInterval(() => this.updateFPS(), 1000)

      this.versionUI = document.createElement('div')
      this.versionUI.textContent = "Version: " + Game.VERSION
      this.versionUI.style = "position: absolute; left: 2px; top: 100%; transform: translate(0, -14px); font: 10px sans-serif"
      document.body.appendChild(this.versionUI)
   }

   startGame() {
      this.lastTime = new Date().getTime()
      this.animate()
   }

   keyDownCallback(e) {
      for (var k in this.keyBindings) {
         if (e.keyCode == this.keyBindings[k]) {
            this.keyDown[k] = true
         }
      }
   }

   keyUpCallback(e) {
      for (var k in this.keyBindings) {
         if (e.keyCode == this.keyBindings[k]) {
            this.keyDown[k] = false
         }
      }
   }

   resize() {
      this.renderer.setSize( window.innerWidth, window.innerHeight )
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
   }

   animate() {
      requestAnimationFrame( () => this.animate() )

      const MAX_DT = 20

      let now = new Date().getTime()

      // Do multiple updates for long delays (so we don't miss things)
      for (let dt = now - this.lastTime; dt > 0; dt -= MAX_DT) {
         this.update(Math.min(dt, MAX_DT))
      }

      this.lastTime = now

      this.render(this.renderer)
      this.frames ++
   }

   updateFPS() {
      this.fpsUI.textContent = this.frames
      this.frames = 0
   }

   update(dt) {}
   render(renderer) {}
}
