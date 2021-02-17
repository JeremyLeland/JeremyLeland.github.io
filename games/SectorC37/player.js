export class Player {
	constructor() {
      this.accel = 0.0001
      this.maxSpeed = 0.2
      this.minSpeed = 0
      this.turnSpeed = 0.005
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

      if (distFromGoal > 200) {
         this.speed = Math.min(this.maxSpeed, this.speed + this.accel * dt)
      }
      else if (distFromGoal < 100) {
         this.speed = Math.max(this.minSpeed, this.speed - this.accel * dt)
      }

      // TODO: make this "slidey" like Asteroids? or is that too hard to use?
      this.dx = Math.cos(this.angle) * this.speed
      this.dy = Math.sin(this.angle) * this.speed

      this.x += this.dx * dt
      this.y += this.dy * dt
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

   update(dt) {
      this.turnTowardsGoal(dt)
      this.moveTowardsGoal(dt)
   }

   draw(viewport) {
      const WIDTH = 10, LENGTH = 20

      const sinAng = Math.sin(this.angle), cosAng = Math.cos(this.angle)
      const leftX = this.x - sinAng * WIDTH
      const leftY = this.y + cosAng * WIDTH
      const rightX = this.x + sinAng * WIDTH
      const rightY = this.y - cosAng * WIDTH
      const frontX = this.x + cosAng * LENGTH
      const frontY = this.y + sinAng * LENGTH

      const ctx = viewport.context
      const scrollX = viewport.scrollX
      const scrollY = viewport.scrollY

      ctx.strokeStyle = "green"
      ctx.beginPath()
      ctx.moveTo(leftX - scrollX, leftY - scrollY)
      ctx.lineTo(frontX - scrollX, frontY - scrollY)
      ctx.lineTo(rightX - scrollX, rightY - scrollY)
      ctx.lineTo(leftX - scrollX, leftY - scrollY)
      ctx.stroke()
      ctx.closePath()
   }
}