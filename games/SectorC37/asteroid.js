import { Actor } from "./actor.js"
import * as Particles from "./particles.js"

export class Asteroid extends Actor {
   static fromBiggerAsteroid(parent) {
      const ang = Math.random() * Math.PI * 2
      const x = parent.x + Math.cos(ang) * parent.radius
      const y = parent.y + Math.sin(ang) * parent.radius

      const SPEED = 0.01
      const dx = parent.dx + Math.cos(ang) * SPEED
      const dy = parent.dy + Math.sin(ang) * SPEED

      const radius = parent.radius * 0.4

      return new Asteroid(x, y, dx, dy, radius, parent.color, parent.level)
   }

   static randomAsteroid(x, y, level) {
      const dx = Math.random() * 0.02 - 0.01
      const dy = Math.random() * 0.02 - 0.01
      const radius = Math.random() * 50 + 20
      const c = Math.random() * 100 + 100
      const col = `rgb(${c}, ${c/2}, 0)`

      return new Asteroid(x, y, dx, dy, radius, col, level)
   }

   constructor(x, y, dx, dy, radius, color, level) {
      // Mass, health, and damage based on radius
      const MASS_MULT = 0.5
      const HEALTH_MULT = 20
      const DAMAGE_MULT = 10
      super(x, y, dx, dy, 0, 0, 
            radius, radius * MASS_MULT, radius * HEALTH_MULT, radius * DAMAGE_MULT,
            level)

      this.color = color
   }

   die() {
      for (let i = 0; i < this.radius; i ++) {
         this.level.addParticle(new Particles.RockDebris(this))
      }

      for (let i = 0; i < this.radius / 8; i ++) {
         this.level.addActor(Asteroid.fromBiggerAsteroid(this))
      }
   }

   draw(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)

      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.restore()
   }
}