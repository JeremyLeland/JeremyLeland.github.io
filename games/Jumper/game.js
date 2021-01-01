import * as THREE from "./three.module.js" //'https://unpkg.com/three/build/three.module.js'

export class Game {
   constructor() {
      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setSize( window.innerWidth, window.innerHeight )
      document.body.appendChild( this.renderer.domElement )
      
      this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 )

      window.addEventListener('resize', () => this.resize(), false)

      this.fpsUI = document.createElement('div')
      this.fpsUI.style = "position: absolute; top: 10px; font: 18px sans-serif"
      this.fpsUI.style.left = (window.innerWidth - 50) + "px"
      document.body.appendChild(this.fpsUI)
      this.frames = 0
      setInterval(() => this.updateFPS(), 1000)

      this.keyBindings = {}
      this.keyDown = {}
      document.onkeydown = (e) => this.keyDownCallback(e)
      document.onkeyup = (e) => this.keyUpCallback(e)
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

      this.fpsUI.style.left = (window.innerWidth - 50) + "px"
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