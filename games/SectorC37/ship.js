import { Actor } from "./actor.js"
import { Bullet } from "./bullet.js"
import { FireParticle, DebrisParticle } from "./particles.js"

export class Ship extends Actor {
   constructor({x, y, radius, health, damage, speed, turnSpeed, 
                timeBetweenShots, bulletSpeed, bulletDamage, 
                color, level}) {
      super(x, y, 0, 0, 0, 0, radius, health, damage)

      this.goalX = x
      this.goalY = y

      this.speed = speed
      this.turnSpeed = turnSpeed

      this.timeBetweenShots = timeBetweenShots
      this.bulletSpeed = bulletSpeed
      this.bulletDamage = bulletDamage

      this.shootDelay = this.timeBetweenShots
      this.isShooting = false

      this.color = color
      this.level = level
   }

   isAlive() {
      return this.health > 0
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
   }

   turnToward(towardX, towardY, dt) {
      const towardAngle = Math.atan2(towardY - this.y, towardX - this.x)

      // Adjust our angle so we can use towardAngle
      if (towardAngle - this.angle > Math.PI) {
         this.angle += Math.PI * 2
      }
      else if (this.angle - towardAngle > Math.PI) {
         this.angle -= Math.PI * 2
      }

      if (towardAngle < this.angle) {
         this.angle = Math.max(towardAngle, this.angle - this.turnSpeed * dt)
      }
      else if (towardAngle > this.angle) {
         this.angle = Math.min(towardAngle, this.angle + this.turnSpeed * dt)
      }

      this.dx = Math.cos(this.angle) * this.speed
      this.dy = Math.sin(this.angle) * this.speed
   }

   turnAwayFrom(avoidX, avoidY, dt) {
      const avoidAngle = Math.atan2(avoidY - this.y, avoidX - this.x)

      // Adjust our angle so we can use goalAngle
      if (avoidAngle - this.angle > Math.PI) {
         this.angle += Math.PI * 2
      }
      else if (this.angle - avoidAngle > Math.PI) {
         this.angle -= Math.PI * 2
      }

      if (avoidAngle <= this.angle) {
         this.angle += this.turnSpeed * dt
      }
      else if (avoidAngle > this.angle) {
         this.angle -= this.turnSpeed * dt
      }

      this.dx = Math.cos(this.angle) * this.speed
      this.dy = Math.sin(this.angle) * this.speed
   }

   startShooting() {
      this.isShooting = true
   }

   stopShooting() {
      this.isShooting = false
   }

   shoot() {
      const sinAng = Math.sin(this.angle), cosAng = Math.cos(this.angle)
      const frontDist = this.radius * 2
      const frontX = this.x + cosAng * frontDist
      const frontY = this.y + sinAng * frontDist
      const dx = cosAng * this.bulletSpeed
      const dy = sinAng * this.bulletSpeed

      const bullet = new Bullet(frontX, frontY, dx, dy, this.bulletDamage, this.color)
      this.level.addBullet(bullet)
   }

   hitWith(entity) {
      super.hitWith(entity)
   }

   die() {
      for (let i = 0; i < 50; i ++) {
         this.level.addParticle(FireParticle.fromExplosionAt(this.x, this.y))
      }

      for (let i = 0; i < 50; i ++) {
         this.level.addParticle(DebrisParticle.fromExplosionAt(this.x, this.y, this.radius, this.color))
      }
   }

   update(dt) {
      this.shootDelay = Math.max(0, this.shootDelay - dt)
      if (this.shootDelay == 0 && this.isShooting) {
         this.shoot()
         this.shootDelay = this.timeBetweenShots
      }

      super.update(dt)
   }

   drawTriangle(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)
      ctx.scale(this.radius, this.radius)  // at angle 0, "forward" is in x axis

      // Unit triangle centered at 0,0
      ctx.beginPath()
      ctx.moveTo(-1, -1)
      ctx.lineTo( 1,  0)
      ctx.lineTo(-1,  1)
      ctx.closePath()

      ctx.fillStyle = this.color
      ctx.fill()
      
      ctx.restore()
   }

   draw(ctx) {
      this.drawTriangle(ctx)

      // // DEBUG
      // ctx.beginPath()
      // ctx.moveTo(this.goalX, this.goalY)
      // ctx.lineTo(this.x, this.y)

      // ctx.setLineDash([1, 8])
      // ctx.strokeStyle = "yellow"
      // ctx.stroke()

      // ctx.beginPath()
      // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      // ctx.stroke()
   }
}