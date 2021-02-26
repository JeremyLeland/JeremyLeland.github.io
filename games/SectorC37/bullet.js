import { Actor } from "./actor.js"

export class Bullet extends Actor {
   constructor(x, y, dx, dy, damage, color) {
      super(x, y, dx, dy, 0, 0, 1, 1, damage)

      this.color = color

      this.life = 10000    // so we go away after time
   }

   isAlive() {
      return this.life > 0
   }

   hitWith(actor) {
      this.life = 0
   }

   update(dt) {
      this.life -= dt

      super.update(dt)
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