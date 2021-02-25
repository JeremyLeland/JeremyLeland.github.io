import { Entity } from "./entity.js"

export class FireParticle extends Entity {
   constructor(x, y, dx, dy, radius) {
      super(x, y, dx, dy)

      this.radius = radius
      this.life = 1.0
   }

   isAlive() {
      return this.life > 0
   }

   think(dt) {
      this.life -= dt / 1000
   }

   getColor() {
      // Inspired by http://codepen.io/davepvm/pen/Hhstl
      const r = 140 + 120 * this.life
      const g = 170 - 120 * this.life
      const b = 120 - 120 * this.life
      const a = 0.4 * this.life
      return `rgba(${r}, ${g}, ${b}, ${a})`
   }

   draw(ctx) {
      ctx.save()

      const size = Math.sin(Math.PI * this.life) * this.radius

      ctx.fillStyle = this.getColor()
      ctx.globalCompositeOperation = 'lighter'

      ctx.beginPath()
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
   }
}

export class DebrisParticle extends Entity {
   constructor(x, y, dx, dy, radius, color) {
      super(x, y, dx, dy)


      this.radius = radius
      this.color = color
      this.life = 1.0
   }

   isAlive() {
      return this.life > 0
   }

   think(dt) {
      this.life -= dt / 1000
   }

   draw(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)

      const size = Math.sin(Math.PI * this.life) * this.radius
      ctx.scale(size, size)

      ctx.fillStyle = this.color

      ctx.beginPath()
      ctx.arc(0, 0, 1, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
   }
}
