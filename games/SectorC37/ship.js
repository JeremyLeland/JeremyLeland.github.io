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

      this.speed = 0

      this.goalX = x
      this.goalY = y
      this.goalAngle = 0

      this.shootDelay = this.timeBetweenShots
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
      this.goalAngle = Math.atan2(goalY - this.y, goalX - this.x)
   }

   distanceFromGoal() {
      const cx = this.goalX - this.x
      const cy = this.goalY - this.y
      return Math.sqrt(cx*cx + cy*cy)
   }

   moveTowardsGoal(dt) {
      const distFromGoal = this.distanceFromGoal()

      if (distFromGoal > 0) {

         this.turnTowardsGoal(dt)

         this.speed = Math.min(this.maxSpeed, distFromGoal / dt)

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
                                   cosAng * this.bulletSpeed, sinAng * this.bulletSpeed,
                                   this.color))
   }

   update(dt) {
      this.moveTowardsGoal(dt)

      this.shootDelay = Math.max(0, this.shootDelay - dt)
      if (this.shootDelay == 0 && this.isShooting) {
         this.shoot()
         this.shootDelay = this.timeBetweenShots
      }

      this.bullets.forEach(b => b.update(dt))
      this.bullets = this.bullets.filter(b => b.life > 0)
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
   }
}