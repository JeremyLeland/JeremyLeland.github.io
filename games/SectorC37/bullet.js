export class Bullet {
   constructor(x, y, dx, dy, color) {
      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
      this.color = color

      this.life = 10000
   }

   update(dt) {
      this.x += this.dx * dt
      this.y += this.dy * dt

      this.life -= dt
   }

   draw(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)

      ctx.fillStyle = this.color
      ctx.fillRect(-1, -1, 3, 3)

      ctx.restore()
   }
}