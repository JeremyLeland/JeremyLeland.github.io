import { Actor } from "./actor.js"

export class Asteroid extends Actor {
   constructor(x, y, dx, dy, health, damage, radius, color) {
      super(x, y, dx, dy, 0, 0, radius, health, damage)

      this.color = color
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