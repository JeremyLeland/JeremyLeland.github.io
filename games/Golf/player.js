export class Player {

   constructor(level) {
      this.level = level
      this.radius = 8
   }

   spawn(x, y) {
      this.x = x
      this.y = y
      this.dx = this.dy = 0
   }

   update(dt) {
      //this.dy += this.level.gravity

      this.x += this.dx * dt
      this.y += this.dy * dt
   }

   draw(ctx) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "black"
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }
}