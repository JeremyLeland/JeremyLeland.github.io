import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor(x, y, level) {
      super({radius: 10, 
             health: 50, 
             damage: 50, 
             speed: 0.15, 
             turnSpeed: 0.003,
             timeBetweenShots: 100,
             bulletSpeed: 0.3,
             bulletDamage: 5,
             color: "blue",
             level: level})

      this.targetEntity = null
      this.avoidEntity = null

      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5

      this.spawn(x, y)
   }

   update(dt) {
      // Pursue our goals
      if (this.distanceFrom(this.level.player.x, this.level.player.y) < 1000) {
         this.targetEntity = this.level.player
      }
      else {
         this.targetEntity = null
      }

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

      if (this.targetEntity != null) {
         // this.setGoal(this.targetEntity.x, this.targetEntity.y)

         // For now, shoot if we are close to target and it is in front of us
         if (this.distanceFrom(this.targetEntity.x, this.targetEntity.y) < this.SHOOT_DISTANCE && 
             Math.abs(this.angleTo(this.targetEntity.x, this.targetEntity.y)) < this.SHOOT_ANGLE) {
            this.startShooting()
         }
         else {
            this.stopShooting()
         }
      }

      super.update(dt)
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