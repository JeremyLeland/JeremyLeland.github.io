import { Entity } from "./entity.js"

export class Bullet extends Entity {
   constructor(x, y, dx, dy, damage, color) {
      super(x, y, dx, dy)

      this.damage = damage
      this.color = color

      this.radius = 1

      this.life = 10000    // so we go away after time
   }

   isAlive() {
      return this.life > 0
   }

   hitWith(entity) {
      this.life = 0
   }

   think(dt) {
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