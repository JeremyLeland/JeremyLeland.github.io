import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor(x, y) {
      super()

      this.accel = 0.0001
      this.minSpeed = 0
      this.maxSpeed = 0.15
      this.turnSpeed = 0.003

      this.TIME_BETWEEN_SHOTS = 100
      this.BULLET_SPEED = 0.3
      this.BULLET_DAMAGE = 5

      this.damage = 50  // ramming damage

      this.width = 30
      this.length = 15
      this.radius = 30
      this.color = "blue"

      this.targetShip = null
      this.followShip = null
      this.avoidShip = null

      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5

      this.MAX_HEALTH = 50

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
         this.turnAwayFrom(this.avoidShip.x, this.avoidShip.y, dt)
      }
      else {
         this.turnToward(this.goalX, this.goalY, dt)
      }

      // else if (this.targetShip != null) {
      //    this.setGoal(this.targetShip.x, this.targetShip.y)

      //    // For now, shoot if we are close to target and it is in front of us
      //    if (this.distanceFrom(this.targetShip.x, this.targetShip.y) < this.SHOOT_DISTANCE && 
      //        Math.abs(this.angleTo(this.targetShip.x, this.targetShip.y)) < this.SHOOT_ANGLE) {
      //       this.startShooting()
      //    }
      //    else {
      //       this.stopShooting()
      //    }
      // }

      super.update(dt)
   }

   draw(ctx) {
      super.draw(ctx)

      // DEBUG
      if (this.avoidShip != null) {
         ctx.beginPath()
         ctx.moveTo(this.avoidShip.x, this.avoidShip.y)
         ctx.lineTo(this.x, this.y)

         ctx.setLineDash([1, 8])
         ctx.strokeStyle = "red"
         ctx.stroke()
      }
   }
}