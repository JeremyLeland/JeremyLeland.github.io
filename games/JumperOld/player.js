import * as THREE from "./three.module.js" //'https://unpkg.com/three/build/three.module.js'
import { Level } from "./level.js"

export class Player {
   static SPEED = 0.01
   static MAX_SPEED = 8
   static ACCEL = 0.006
   static SIDE_SPEED = 0.008
   static JUMP_SPEED = 0.02
   static SIZE = 0.4
   static SPAWN_Y = 5.0
   static GRAVITY = -0.0001
   static COLLISION_FUDGE = 0.3
   static FALL_NO_RETURN = -0.4
   static FALL_END = -40

   constructor(level) {
      this.level = level

      const geometry = new THREE.SphereGeometry( Player.SIZE, 20, 20 )
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
      this.ball = new THREE.Mesh( geometry, material )
      this.level.scene.add( this.ball )

      const shadowGeo = new THREE.CircleGeometry( Player.SIZE, 20 )
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 })
      this.shadow = new THREE.Mesh( shadowGeo, shadowMat )
      this.shadow.rotation.x = -Math.PI / 2
      this.shadow.position.y = Level.BLOCK_HEIGHT / 2 + 0.01
      this.level.scene.add( this.shadow )

      this.spawn()
   }

   spawn() {
      this.x = (this.level.width / 2) * Level.BLOCK_WIDTH
      this.y = Player.SPAWN_Y
      this.z = (this.level.height - 0.5) * Level.BLOCK_LENGTH

      this.speed = this.partialSpeed = 0
      this.dx = this.dy = this.dz = 0

      this.justSpawned = true
   }

   moveLeft() {
      this.dx = -Player.SIDE_SPEED
      this.justSpawned = false
   }

   moveRight() {
      this.dx = Player.SIDE_SPEED
      this.justSpawned = false
   }

   holdSteady() {
      this.dx = 0
   }

   speedUp() {
      if (this.dSpeed == 0) {
         this.setSpeed(this.speed + 1)
      }

      this.dSpeed = Player.ACCEL
      this.justSpawned = false
   }

   slowDown() {
      if (this.dSpeed == 0) {
         this.setSpeed(this.speed - 1)
      }

      this.dSpeed = -Player.ACCEL
      this.justSpawned = false
   }

   maintainSpeed() {
      this.dSpeed = 0
      this.partialSpeed = 0
   }

   setSpeed(newSpeed) {
      this.speed = Math.max(0, Math.min(Player.MAX_SPEED, newSpeed))
   }

   jump() {
      if (this.isOnSolidGround()) {
         this.dy = Player.JUMP_SPEED
      }
   }

   isOnSolidGround() {
      //let col = Math.floor(this.x / Level.BLOCK_WIDTH)
      //let row = Math.floor(this.z / Level.BLOCK_LENGTH)

      // More generous collision
      let colLeft = Math.floor((this.x - Player.COLLISION_FUDGE) / Level.BLOCK_WIDTH)
      let colRight = Math.floor((this.x + Player.COLLISION_FUDGE) / Level.BLOCK_WIDTH)
      let rowFront = Math.floor((this.z - Player.COLLISION_FUDGE) / Level.BLOCK_LENGTH)
      let rowBack = Math.floor((this.z + Player.COLLISION_FUDGE) / Level.BLOCK_LENGTH)

      return this.y <= Player.SIZE && this.y > Player.FALL_NO_RETURN &&
             (this.level.isSolidAt(colLeft, rowFront) || this.level.isSolidAt(colRight, rowFront) ||
              this.level.isSolidAt(colLeft, rowBack)  || this.level.isSolidAt(colRight, rowBack))
   }

   update(dt) {
      this.partialSpeed += this.dSpeed * dt

      if (this.partialSpeed > 1) {
         this.setSpeed(this.speed + 1)
         this.partialSpeed --
      }
      else if (this.partialSpeed < -1) {
         this.setSpeed(this.speed - 1)
         this.partialSpeed ++
      }

      this.dy += Player.GRAVITY * dt
      this.dz = -Player.SPEED * this.speed

      this.x += this.dx * dt
      this.y += this.dy * dt
      this.z += this.dz * dt
    
      if (this.y < Player.SIZE && this.isOnSolidGround()) {
         this.y = Player.SIZE
         this.dy = 0
      }
      
      if (this.y < Player.FALL_NO_RETURN) {
         this.shadow.visible = false
      }
      else {
         const SHADOW_HEIGHT = 0.01
         this.shadow.visible = true
         this.shadow.position.set(this.x, SHADOW_HEIGHT, this.z)
      }

      if (this.y < Player.FALL_END) {
         this.spawn(this.level)
      }

      this.ball.position.set(this.x, this.y, this.z)
   }
}