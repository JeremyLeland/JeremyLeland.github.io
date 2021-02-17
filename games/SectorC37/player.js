export class Player {
	constructor() {
      this.turnSpeed = 0.001
   }

   spawn(x, y) {
      this.x = x
      this.y = y
      this.dx = 0
      this.dy = 0
      this.angle = 0
      this.goalAngle = 0
   }

   setGoalAngle() {

   }

   update(dt) {

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