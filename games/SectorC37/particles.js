import { Entity } from "./entity.js"

export class FireParticle extends Entity {

   static fromExplosionAt(explodeX, explodeY) {
      const MAX_SPEED = 0.04

      const x = explodeX //+ Math.random() * 5 - 10
      const y = explodeY //+ Math.random() * 5 - 10
      const rad = Math.random() * 16
      const ang = Math.random() * Math.PI * 2
      const speed = Math.random() * MAX_SPEED
      const dx = Math.cos(ang) * speed
      const dy = Math.sin(ang) * speed

      return new FireParticle(x, y, dx, dy, rad)
   }

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
   static fromExplosionAt(explodeX, explodeY, shipRadius, shipColor) {
      const MAX_SPEED = 0.1, MAX_SPIN = 0.01

      const ang = Math.random() * Math.PI * 2

      const dist = Math.random() * shipRadius
      const x = explodeX + Math.cos(ang) * dist
      const y = explodeY + Math.sin(ang) * dist

      const speed = Math.random() * MAX_SPEED
      const dx = Math.cos(ang) * speed
      const dy = Math.sin(ang) * speed

      const rad = Math.random() * 3
      
      const spinAng = Math.random() * Math.PI * 2
      const spinSpeed = Math.random() * (MAX_SPIN / 2) - MAX_SPIN

      return new DebrisParticle(x, y, dx, dy, spinAng, spinSpeed, rad, shipColor)
   }

   constructor(x, y, dx, dy, angle, dAngle, radius, color) {
      super(x, y, dx, dy)

      this.angle = angle
      this.dAngle = dAngle
      this.radius = radius
      this.color = color
      this.life = 1.0
   }

   isAlive() {
      return this.life > 0
   }

   think(dt) {
      this.angle += this.dAngle * dt
      this.life -= dt / 1000
   }

   draw(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)

      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      ctx.beginPath()
      ctx.moveTo(-this.radius, -this.radius)
      ctx.lineTo( this.radius,  0)
      ctx.lineTo(-this.radius,  this.radius)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.restore()
   }
}
