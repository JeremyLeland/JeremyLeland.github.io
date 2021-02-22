import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor(x, y, level) {
      super(x, y, level)

      this.accel = 0.0001
      this.minSpeed = 0
      this.maxSpeed = 0.15
      this.turnSpeed = 0.003

      this.TIME_BETWEEN_SHOTS = 100
      this.BULLET_SPEED = 0.3
      this.BULLET_DAMAGE = 5

      this.damage = 50  // ramming damage

      this.radius = 10
      this.color = "blue"

      this.targetEntity = null
      this.avoidEntity = null

      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5

      this.MAX_HEALTH = 50

      this.spawn(x, y)
   }

   think(dt) {
      // Pursue our goals
      if (this.distanceFrom(this.goalX, this.goalY) < this.radius * 2) {
         this.setGoal(Math.random() * this.level.width, Math.random() * this.level.height)
      }

      //
      // Avoid nearby entities
      //
      const nearby = this.level.getEntitiesNear(this)
      let closestEntity = null, closestTime = Number.POSITIVE_INFINITY
      nearby.forEach(n => {
         const time = this.timeUntilHit(n)

         if (time < closestTime) {
            closestEntity = n
            closestTime = time
         }
      })

      this.avoidEntity = closestTime < 2000 ? closestEntity : null

      // TODO: Flocking?
      // - https://www.red3d.com/cwr/boids/
      // - https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444

      if (this.avoidEntity != null) {
         this.turnAwayFrom(this.avoidEntity.x, this.avoidEntity.y, dt)
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

      super.think(dt)
   }

   draw(ctx) {
      super.draw(ctx)

      // // DEBUG
      // if (this.avoidEntity != null) {
      //    ctx.beginPath()
      //    ctx.moveTo(this.avoidEntity.x, this.avoidEntity.y)
      //    ctx.lineTo(this.x, this.y)

      //    ctx.setLineDash([1, 8])
      //    ctx.strokeStyle = "red"
      //    ctx.stroke()
      // }
   }
}