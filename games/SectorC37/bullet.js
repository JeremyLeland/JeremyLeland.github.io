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

   draw(viewport) {
      const ctx = viewport.context
      const scrollX = viewport.scrollX
      const scrollY = viewport.scrollY

      ctx.fillStyle = this.color
      ctx.fillRect(this.x - scrollX, this.y - scrollY, 2, 2)
   }
}