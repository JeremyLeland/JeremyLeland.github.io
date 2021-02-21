export class Asteroid {
   constructor(x, y, dx, dy, damage, health, radius, color) {
      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
      this.damage = damage
      this.health = health
      this.radius = radius
      this.color = color
   }

   isAlive() {
      return this.health > 0
   }

   update(dt) {
      this.x += this.dx * dt
      this.y += this.dy * dt
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