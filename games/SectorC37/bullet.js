export class Bullet {
   constructor(x, y, dx, dy, damage, color) {
      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
      this.damage = damage
      this.color = color

      this.radius = 1

      this.life = 10000    // so we go away after time
   }

   isAlive() {
      return this.life > 0
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

      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
   }
}