import { Ship } from "./ship.js"
import { Gun } from "./gun.js"

class EnemyGun extends Gun {
   constructor(frontOffset, sideOffset, level) {
      super({
         frontOffset: frontOffset,
         sideOffset: sideOffset,
         timeBetweenShots: 100,
         bulletSpeed: 0.3,
         bulletDamage: 5,
         bulletColor: Enemy.COLOR,
         level: level
      })
   }
}

export class Enemy extends Ship {
   static COLOR = "blue"

   constructor(x, y, level) {
      super({
         x: x, y: y, 
         radius: 10, 
         health: 50, 
         damage: 50, 
         speed: 0.15, 
         turnSpeed: 0.003,
         color: Enemy.COLOR,
         level: level
      })

      this.setGuns(new EnemyGun(this.radius * 2, 0, level))

      this.targetActor = null
      this.avoidActor = null

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
      if (this.level.player.isAlive() && this.distanceFrom(this.level.player) < 1000) {
         this.targetActor = this.level.player
      }
      else {
         this.targetActor = null
      }
   }

   checkForAvoid() {
      const nearby = this.level.getActorsNear(this)

      let closestActor = null, closestTime = Number.POSITIVE_INFINITY
      nearby.forEach(n => {
         const time = this.timeUntilHit(n, 10)

         if (time < closestTime) {
            closestActor = n
            closestTime = time
         }
      })

      this.avoidActor = closestTime < 2000 ? closestActor : null
   }

   update(dt) {
      this.checkForGoal()
      this.checkForTarget()
      this.checkForAvoid()

      // TODO: Flocking?
      // - https://www.red3d.com/cwr/boids/
      // - https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444

      if (this.avoidActor != null) {
         this.turnAwayFrom(this.avoidActor, dt)
      }
      else if (this.targetActor != null) {
         this.turnToward(this.targetActor, dt)
      }
      else {
         this.turnTowardPoint(this.goalX, this.goalY, dt)
      }

      if (this.targetActor != null && 
          this.distanceFrom(this.targetActor) < this.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetActor)) < this.SHOOT_ANGLE) {
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