import * as THREE from "./three.module.js" //'https://unpkg.com/three/build/three.module.js'
import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Jumper extends Game {
   static CAMERA_FOLLOW_Y = 3
   static CAMERA_FOLLOW_Z = 4

   static VERSION = 0.81

   static GameState = {
      LEVEL_LOADING: 0,
      LEVEL_START: 1,
      LEVEL_PLAYING: 2,
      LEVEL_END: 3
   }

   static LEVELS = [
      { title: "Red", src: "./levels/easy1.png"},
      { title: "A Colorful Intro", src: "./levels/03.png"},
      { title: "Yellow", src: "./levels/easy3.png"},
      { title: "Blue", src: "./levels/easy5.png"},
      { title: "Thin Ice", src: "./levels/ice.png"},
      { title: "Green", src: "./levels/easy4.png"},
      { title: "Purple", src: "./levels/easy6.png"},
      { title: "Taste the Rainbow", src: "./levels/windy.png"},
      { title: "Orange", src: "./levels/easy2.png"},
      { title: "Jump Training", src: "./levels/jump-training.png"},
      { title: "Islands", src: "./levels/islands.png"},
      { title: "Ant thing?", src: "./levels/ant-thing.png"},
      { title: "Fruity", src: "./levels/fruit.png"},
      { title: "Jumps and Waves", src: "./levels/04.png"},
      { title: "Taste the Rainbow 2", src: "./levels/rainbow2.png"},
      { title: "Quicksilver", src: "./levels/quicksilver.png"},
      { title: "Bombed Road", src: "./levels/road.png"},
      { title: "Bendy Lines", src: "./levels/lines.png"},
      { title: "Branches", src: "./levels/tree.png"},
      { title: "Multi-threading", src: "./levels/threads.png"},
      { title: "Stepping Stones", src: "./levels/stones.png"},
      { title: "More Lines", src: "./levels/morelines.png"},
      { title: "A Different Slant", src: "./levels/slant.png"},
      { title: "Red Light, Green Light", src: "./levels/stopngo.png"},
      { title: "Bubbles!", src: "./levels/bubbles.png"},
   ]


   constructor() {
      super()

      this.keyBindings = { "left": 37, "up": 38, "right": 39, "down": 40, "jump": 32 }

      this.prepareUI()

      this.levelNdx = 0
      this.nextLevel()

      this.lastTime = new Date().getTime()
      this.animate()
   }

   prepareUI() {
      let speedDiv = document.createElement('div')
      speedDiv.style = "position: absolute; left: 4px; top: 4px; font: 18px sans-serif"
      speedDiv.textContent = "Speed: "
      this.speedUI = document.createElement('span')
      speedDiv.appendChild(this.speedUI)
      document.body.appendChild(speedDiv)

      this.levelUI = document.createElement('div')
      this.levelUI.style = "position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font: 28px sans-serif"
      document.body.appendChild(this.levelUI)

      this.versionUI = document.createElement('div')
      this.versionUI.textContent = "Version: " + Jumper.VERSION
      this.versionUI.style = "position: absolute; left: 2px; top: 100%; transform: translate(0, -14px); font: 10px sans-serif"
      document.body.appendChild(this.versionUI)
   }

   nextLevel() {
      this.gameState = Jumper.GameState.LEVEL_LOADING

      let nextLevel = Jumper.LEVELS[this.levelNdx ++]

      if (nextLevel != undefined) {
         this.level = new Level(nextLevel.title, nextLevel.src)
      }
   }

   anyKeyPressed() {
      for (let key in this.keyDown) {
         if (this.keyDown[key]) {
            return true
         }
      }
      return false
   }

   clearKeyPressed() {
      for (let key in this.keyDown) {
         this.keyDown[key] = false
      }
   }

   levelLoading(dt) {
      this.levelUI.style.visibility = 'visible'
      this.levelUI.textContent = "Loading..."

      if (this.level.isReady) {
         this.player = new Player(this.level)

         // Look at a point a little in front of the ball
         this.camera.position.x = this.player.x
         this.camera.position.y = Jumper.CAMERA_FOLLOW_Y
         this.camera.position.z = this.player.z + Jumper.CAMERA_FOLLOW_Z
         this.camera.lookAt( this.player.x, 0, this.player.z - 3 )

         this.gameState = Jumper.GameState.LEVEL_PLAYING
      }
   }

   levelEnd(dt) {
      this.levelUI.style.visibility = 'visible'
      this.levelUI.textContent = "Level Complete!"

      if (this.anyKeyPressed()) {
         this.clearKeyPressed()
         this.nextLevel()
      }
   }

   updatePlayerControls() {
      if (this.keyDown["left"]) {
         this.player.moveLeft()
      }
      else if (this.keyDown["right"]) {
         this.player.moveRight()
      }
      else {
         this.player.holdSteady()
      }

      if (this.keyDown["up"]) {
         this.player.speedUp()
      }
      else if (this.keyDown["down"]) {
         this.player.slowDown()
      }
      else {
         this.player.maintainSpeed()
      }

      if (this.keyDown["jump"]) {
         this.player.jump()
      }
   }

   playLevel(dt) {
      if (this.player.justSpawned) {
         this.levelUI.style.visibility = 'visible'
         this.levelUI.textContent = this.level.title
      }
      else {
         this.levelUI.style.visibility = 'hidden'
      }

      this.updatePlayerControls()
      this.player.update(dt)

      this.speedUI.textContent = this.player.speed
      this.camera.position.z = this.player.z + Jumper.CAMERA_FOLLOW_Z

      if (this.player.z <= Level.BLOCK_LENGTH && this.player.isOnSolidGround()) {
         this.gameState = Jumper.GameState.LEVEL_END
      }
   }

   update(dt) {
      switch (this.gameState) {
         case Jumper.GameState.LEVEL_LOADING:
            this.levelLoading(dt)
            break;
         case Jumper.GameState.LEVEL_END:
            this.levelEnd(dt)
            break;
         case Jumper.GameState.LEVEL_PLAYING:
            this.playLevel(dt)
            break;
      }
   }

   render(renderer) {
      if (this.level.isReady) {
         renderer.render( this.level.scene, this.camera )
      }
   }
}
