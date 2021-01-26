import * as THREE from "./libs/three.module.js" //'https://unpkg.com/three/build/three.module.js'
import { OrbitControls } from './libs/OrbitControls.js'
import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.02

      super()

      this.keyBindings = { }

      this.renderer.shadowMap.enabled = true

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color( 0xbfd1e5 )

      this.camera.position.y = 100
      this.camera.position.z = 140
      this.camera.lookAt(0, 0, 0)

      const controls = new OrbitControls( this.camera, this.renderer.domElement )

      this.loadLevel("./levels/test1.png")

      this.prepareLights()

      this.startGame()
   }

   loadLevel(src) {
      if (this.level) {
         this.level.release(this.scene, this.physicsWorld)
      }
      if (this.player) {
         this.player.release(this.scene, this.physicsWorld)
      }

      this.level = new Level(this.scene, this.physicsWorld, src)
      this.player = new Player(this.scene, this.physicsWorld)

      this.player.spawn(0, 50, 0)
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

   update(dt) {
      // TODO: use three.js clock for dt?

      this.physicsWorld.stepSimulation( dt, 10 )

      this.player.update(dt)
   }

   render(renderer) {
      renderer.render( this.scene, this.camera )
   }
}
