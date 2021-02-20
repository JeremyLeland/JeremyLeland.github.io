import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor(x, y) {
      super()

      this.accel = 0.0001
      this.minSpeed = 0
      this.maxSpeed = 0.15
      this.turnSpeed = 0.003

      this.timeBetweenShots = 100
      this.bulletSpeed = 0.3

      this.width = 30
      this.length = 15
      this.color = "blue"

      this.targetShip = null
      this.followShip = null
      this.avoidShip = null

      this.SHOOT_DISTANCE = 100
      this.SHOOT_ANGLE = 0.5

      this.spawn(x, y)
   }

   setTargetShip(ship) {
      this.targetShip = ship
   }

   setFollowShip(ship) {
      this.followShip = ship
   }

   setAvoidShip(ship) {
      this.avoidShip = ship
   }

   update(dt) {
      if (this.avoidShip != null) {
         const cx = this.avoidShip.x - this.x
         const cy = this.avoidShip.y - this.y
         const dist = Math.sqrt(cx*cx + cy*cy)

         const normX = -cy / dist
         const normY =  cx / dist

         // TODO: Radius instead of width?
         const offset = this.width + this.avoidShip.width

         this.setGoal(this.avoidShip.x + normX * offset, this.avoidShip.y + normY * offset)
      }

      else if (this.targetShip != null) {
         this.setGoal(this.targetShip.x, this.targetShip.y)

         // For now, shoot if we are close to target and it is in front of us
         if (this.distanceFrom(this.targetShip.x, this.targetShip.y) < this.SHOOT_DISTANCE && 
             this.angleTo(this.targetShip.x, this.targetShip.y) < this.SHOOT_ANGLE) {
            this.startShooting()
         }
         else {
            this.stopShooting()
         }
      }

      super.update(dt)
   }
}