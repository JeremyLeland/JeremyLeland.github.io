import { Entity } from "./entity.js"

export class Asteroid extends Entity {
   constructor(x, y, dx, dy, damage, health, radius, color) {
      super(x, y, dx, dy)

      this.damage = damage
      this.health = health
      this.radius = radius
      this.color = color
   }

   isAlive() {
      return this.health > 0
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