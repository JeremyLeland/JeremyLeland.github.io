import { Actor } from "./actor.js"
import * as Particles from "./particles.js"

export class Bullet extends Actor {
   constructor(x, y, dx, dy, damage, color, level) {
      super(x, y, dx, dy, 0, 0, 1, 1, damage, level)

      this.color = color

      this.life = 10000    // so we go away after time
   }

   isAlive() {
      return this.life > 0
   }

   die() {
      this.life = 0

      const hitAng = Math.atan2(-this.dy, -this.dx)

      for (let i = 0; i < 20; i ++) {
         this.level.addParticle(new Particles.Spark(this.x, this.y, hitAng))
      }
   }

   update(dt) {
      this.life -= dt

      if (this.life < 0) {
         this.health = 0
      }

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