import { Entity } from "./entity.js"
import { Bullet } from "./bullet.js"
import { FireParticle } from "./particles.js"
import { DebrisParticle } from "./particles.js"

export class Ship extends Entity {
   constructor(x, y, level) {
      super(x, y, 0, 0)

      this.level = level

      this.bullets = []
   }

   spawn(x, y) {
      this.x = x
      this.y = y
      this.dx = 0
      this.dy = 0
      this.angle = 0

      this.speed = this.maxSpeed

      this.goalX = x
      this.goalY = y

      this.shootDelay = this.TIME_BETWEEN_SHOTS
      this.isShooting = false

      this.health = this.MAX_HEALTH
   }

   isAlive() {
      return this.health > 0
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
   }

   timeUntilHit(other) {
      // See when ships would collide if continuing at their current direction and rate of speed
      // See https://stackoverflow.com/questions/33140999/at-what-delta-time-will-two-objects-collide
      // (Line-Line was http://www.jeffreythompson.org/collision-detection/line-line.php)
      const cx = this.x - other.x
      const cy = this.y - other.y

      const dx1 = this.dx
      const dy1 = this.dy
      const dx2 = other.dx
      const dy2 = other.dy
      const vx = dx1 - dx2
      const vy = dy1 - dy2

      const rr = this.radius + other.radius

      const a = vx*vx + vy*vy
      const b = 2 * (cx * vx + cy * vy)
      const c = cx*cx + cy*cy - rr*rr

      const disc = b*b - 4*a*c

      // If the objects don't collide, the discriminant will be negative
      if (disc < 0) {
         return Number.POSITIVE_INFINITY
      }
      else {
         const t0 = (-b - Math.sqrt(disc)) / (2*a)

         if (t0 < 0) {
            const t1 = (-b + Math.sqrt(disc)) / (2*a)

            if (t1 < 0) {
               return Number.POSITIVE_INFINITY
            }
            else {
               return t1
            }
         }
         else {
            return t0
         }

         

         // if (t0 < 0 && t1 < 0) {
         //    return Number.POSITIVE_INFINITY
         // }
         // else if (t0 < 0) {
         //    return t1
         // }
         // else {
         //    return Math.min(t0, t1)
         // }
      }
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
      const dx = cosAng * this.BULLET_SPEED
      const dy = sinAng * this.BULLET_SPEED

      const bullet = new Bullet(frontX, frontY, dx, dy, this.BULLET_DAMAGE, this.color)
      this.level.addBullet(bullet)
   }

   hitWith(entity) {
      super.hitWith(entity)

      // TODO: Sparks when hit

      if (this.health <= 0) {
         this.explode()
      }
   }

   explode() {
      for (let i = 0; i < 50; i ++) {
         this.level.addParticle(FireParticle.fromExplosionAt(this.x, this.y))
      }

      for (let i = 0; i < 50; i ++) {
         this.level.addParticle(DebrisParticle.fromExplosionAt(this.x, this.y, this.radius, this.color))
      }
   }

   think(dt) {
      this.shootDelay = Math.max(0, this.shootDelay - dt)
      if (this.shootDelay == 0 && this.isShooting) {
         this.shoot()
         this.shootDelay = this.TIME_BETWEEN_SHOTS
      }
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

      this.bullets.forEach(b => b.draw(ctx))

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