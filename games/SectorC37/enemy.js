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

      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5

      this.spawn(x, y)
   }

   setTargetShip(ship) {
      this.targetShip = ship
   }

   distanceFromTargetShip() {
      return this.distanceFrom(this.targetShip.x, this.targetShip.y)
   }

   setFollowShip(ship) {
      this.followShip = ship
   }

   setAvoidShip(ship) {
      this.avoidShip = ship
   }

   update(dt) {
      if (this.avoidShip != null) {
         const offsetAngle = this.avoidShip.angle + Math.PI / 2
         
         // TODO: Radius instead of width?
         const offsetDist = this.width + this.avoidShip.width

         this.setGoal(this.avoidShip.x + Math.cos(offsetAngle) * offsetDist, 
                      this.avoidShip.y + Math.sin(offsetAngle) * offsetDist)
      }

      else if (this.targetShip != null) {
         this.setGoal(this.targetShip.x, this.targetShip.y)

         // For now, shoot if we are close to target and it is in front of us
         if (this.distanceFrom(this.targetShip.x, this.targetShip.y) < this.SHOOT_DISTANCE && 
             Math.abs(this.angleTo(this.targetShip.x, this.targetShip.y)) < this.SHOOT_ANGLE) {
            this.startShooting()
         }
         else {
            this.stopShooting()
         }
      }

      super.update(dt)
   }
}