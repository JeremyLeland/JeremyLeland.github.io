import { Bullet } from "./bullet.js"

export class Ship {
   constructor() {
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
      this.goalAngle = 0

      this.shootDelay = this.TIME_BETWEEN_SHOTS

      this.health = this.MAX_HEALTH
   }

   isAlive() {
      return this.health > 0
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
   }

   distanceFrom(x, y) {
      const cx = x - this.x
      const cy = y - this.y
      return Math.sqrt(cx*cx + cy*cy)
   }

   angleTo(x, y) {
      return Math.atan2(y - this.y, x - this.x) - this.angle
   }

   timeUntilHitShip(other) {
      // See when ships would collide if continuing at their current direction and rate of speed
      // See https://stackoverflow.com/questions/33140999/at-what-delta-time-will-two-objects-collide
      const cx = this.x - other.x
      const cy = this.y - other.y

      const dx1 = Math.cos(this.angle) * this.speed
      const dy1 = Math.sin(this.angle) * this.speed
      const dx2 = Math.cos(other.angle) * other.speed
      const dy2 = Math.sin(other.angle) * other.speed
      const vx = dx1 - dx2
      const vy = dy1 - dy2

      // TODO: radius instead of width
      const rr = this.width + other.width

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
         const t1 = (-b + Math.sqrt(disc)) / (2*a)

         // if (t0 < 0 && t1 < 0) {
         //    return Number.POSITIVE_INFINITY
         // }
         // else if (t0 < 0) {
         //    return t1
         // }
         // else {
            return Math.min(t0, t1)
         // }
      }
   }

   moveTowardsGoal(dt) {
      const distFromGoal = this.distanceFrom(this.goalX, this.goalY)

      if (distFromGoal > 0) {

         this.turnTowardsGoal(dt)

         //this.speed = Math.min(this.maxSpeed, distFromGoal / dt)

         // if (distFromGoal > 200) {
         //    this.speed = Math.min(this.maxSpeed, this.speed + this.accel * dt)
         // }
         // else if (distFromGoal < 100) {
         //    this.speed = Math.max(this.minSpeed, this.speed - this.accel * dt)
         // }

         // TODO: make this "slidey" like Asteroids? or is that too hard to use?
         this.dx = Math.cos(this.angle) * this.speed
         this.dy = Math.sin(this.angle) * this.speed

         this.x += this.dx * dt
         this.y += this.dy * dt
      }
   }

   turnTowardsGoal(dt) {
      this.goalAngle = Math.atan2(this.goalY - this.y, this.goalX - this.x)

      // Adjust our angle so we can use goalAngle
      if (this.goalAngle - this.angle > Math.PI) {
         this.angle += Math.PI * 2
      }
      else if (this.angle - this.goalAngle > Math.PI) {
         this.angle -= Math.PI * 2
      }

      if (this.goalAngle < this.angle) {
         this.angle = Math.max(this.goalAngle, this.angle - this.turnSpeed * dt)
      }
      else if (this.goalAngle > this.angle) {
         this.angle = Math.min(this.goalAngle, this.angle + this.turnSpeed * dt)
      }
   }

   startShooting() {
      this.isShooting = true
   }

   stopShooting() {
      this.isShooting = false
   }

   shoot() {
      const sinAng = Math.sin(this.angle), cosAng = Math.cos(this.angle), halfLength = this.length / 2
      const frontX = this.x + cosAng * halfLength
      const frontY = this.y + sinAng * halfLength

      this.bullets.push(new Bullet(frontX, frontY, 
                                   cosAng * this.BULLET_SPEED, sinAng * this.BULLET_SPEED,
                                   this.BULLET_DAMAGE, this.color))
   }

   isCollidingWith(entity) {
      return this.distanceFrom(entity.x, entity.y) < this.radius + entity.radius
   }

   hitWith(entity) {
      this.health -= entity.damage
   }

   update(dt) {
      this.moveTowardsGoal(dt)

      this.shootDelay = Math.max(0, this.shootDelay - dt)
      if (this.shootDelay == 0 && this.isShooting) {
         this.shoot()
         this.shootDelay = this.TIME_BETWEEN_SHOTS
      }

      this.bullets.forEach(b => b.update(dt))
      this.bullets = this.bullets.filter(b => b.isAlive())
   }

   drawTriangle(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)
      ctx.scale(this.length, this.width)  // at angle 0, "forward" is in x axis

      // Unit triangle centered at 0,0
      ctx.beginPath()
      ctx.moveTo(-0.5, -0.5)
      ctx.lineTo( 0.5,  0)
      ctx.lineTo(-0.5,  0.5)
      ctx.closePath()

      ctx.fillStyle = this.color
      ctx.fill()
      
      ctx.restore()
   }

   draw(ctx) {
      this.drawTriangle(ctx)

      this.bullets.forEach(b => b.draw(ctx))

      // DEBUG
      ctx.beginPath()
      ctx.moveTo(this.goalX, this.goalY)
      ctx.lineTo(this.x, this.y)

      ctx.setLineDash([1, 8])
      ctx.strokeStyle = "yellow"
      ctx.stroke()
   }
}