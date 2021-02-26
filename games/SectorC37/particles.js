import { Entity } from "./entity.js"

class Particle extends Entity {
   constructor(x, y, dx, dy, angle, dAngle, radius, life) {
      super(x, y, dx, dy, angle, dAngle, radius)
      this.life = this.MAX_LIFE = life
   }

   isAlive() {
      return this.life > 0
   }

   update(dt) {
      this.life -= dt

      super.update(dt)
   }

}

export class FireParticle extends Particle {

   static fromExplosionAt(explodeX, explodeY) {
      const MAX_SPEED = 0.04

      const x = explodeX //+ Math.random() * 5 - 10
      const y = explodeY //+ Math.random() * 5 - 10
      const rad = Math.random() * 16
      const ang = Math.random() * Math.PI * 2
      const speed = Math.random() * MAX_SPEED
      const dx = Math.cos(ang) * speed
      const dy = Math.sin(ang) * speed

      return new FireParticle(x, y, dx, dy, 0, 0, rad, 1000)
   }

   draw(ctx) {
      ctx.save()

      const lifePerc = this.life / this.MAX_LIFE
      const size = Math.sin(Math.PI * lifePerc) * this.radius

      // Inspired by http://codepen.io/davepvm/pen/Hhstl
      const r = 140 + 120 * lifePerc
      const g = 170 - 120 * lifePerc
      const b = 120 - 120 * lifePerc
      const a = 0.4 * lifePerc
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
      ctx.globalCompositeOperation = 'lighter'

      ctx.beginPath()
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
   }
}

export class SparkParticle extends Particle {
   static LENGTH = 100

   static fromHitAt(hitX, hitY, hitAng) {
      const MAX_SPEED = 0.1, SPREAD_ANG = Math.PI / 8

      const ang = hitAng + Math.random() * SPREAD_ANG - SPREAD_ANG/2

      const x = hitX
      const y = hitY

      const speed = MAX_SPEED
      const dx = Math.cos(ang) * speed
      const dy = Math.sin(ang) * speed

      return new SparkParticle(x, y, dx, dy, 500)
   }

   constructor(x, y, dx, dy, life) {
      super(x, y, dx, dy, 0, 0, 0, life)

      this.startX = x
      this.startY = y
   }

   draw(ctx) {
      ctx.save()

      const lifePerc = this.life / this.MAX_LIFE

      const grd = ctx.createLinearGradient(this.x - this.dx * SparkParticle.LENGTH, this.y - this.dy * SparkParticle.LENGTH, this.x, this.y)
      grd.addColorStop(0.0, "rgba(0, 0, 0, 0)")
      grd.addColorStop(0.5, `rgba(255, 255, 0, ${lifePerc * 0.5})`)
      grd.addColorStop(1.0, `rgba(255, 255, 255, ${lifePerc})`)
      ctx.strokeStyle = grd

      ctx.beginPath()
      ctx.moveTo(this.startX, this.startY)
      ctx.lineTo(this.x, this.y)
      ctx.stroke()

      ctx.restore()
   }
}

export class DebrisParticle extends Particle {
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

      return new DebrisParticle(x, y, dx, dy, spinAng, spinSpeed, rad, 1000, shipColor)
   }

   constructor(x, y, dx, dy, angle, dAngle, radius, life, color) {
      super(x, y, dx, dy, angle, dAngle, radius, life)
      this.color = color
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
