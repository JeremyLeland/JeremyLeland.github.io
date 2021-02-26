import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor(x, y, level) {
      super({x: x, y: y, 
             radius: 10, 
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
   }

   checkForGoal() {
      // TODO: also change this after time, in case the goal is somewhere we must avoid?
      if (this.distanceFromPoint(this.goalX, this.goalY) < this.radius * 2) {
         this.setGoal(Math.random() * this.level.width, Math.random() * this.level.height)
      }
   }

   checkForTarget() {
      if (this.player.isAlive() && this.distanceFrom(this.level.player) < 1000) {
         this.targetEntity = this.level.player
      }
      else {
         this.targetEntity = null
      }
   }

   checkForAvoid() {
      const nearby = this.level.getEntitiesNear(this)

      let closestEntity = null, closestTime = Number.POSITIVE_INFINITY
      nearby.forEach(n => {
         const time = this.timeUntilHit(n, 10)

         if (time < closestTime) {
            closestEntity = n
            closestTime = time
         }
      })

      this.avoidEntity = closestTime < 2000 ? closestEntity : null
   }

   update(dt) {
      this.checkForGoal()
      this.checkForTarget()
      this.checkForAvoid()

      // TODO: Flocking?
      // - https://www.red3d.com/cwr/boids/
      // - https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444

      if (this.avoidEntity != null) {
         this.turnAwayFrom(this.avoidEntity, dt)
      }
      else if (this.targetEntity != null) {
         this.turnToward(this.targetEntity, dt)
      }
      else {
         this.turnTowardPoint(this.goalX, this.goalY, dt)
      }

      if (this.targetEntity != null && 
          this.distanceFrom(this.targetEntity) < this.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetEntity)) < this.SHOOT_ANGLE) {
         this.startShooting()
      }
      else {
         this.stopShooting()
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