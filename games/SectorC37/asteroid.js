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

   constructor(x, y, dx, dy, radius, color, level) {
      const HEALTH_MULT = 10
      const DAMAGE_MULT = 10
      super(x, y, dx, dy, 0, 0, radius, radius * HEALTH_MULT, radius * DAMAGE_MULT)

      this.color = color
      this.level = level
   }

   hitWith(actor) {
      if (actor instanceof Asteroid) {
         // TODO: Bounce asteroids off each other?
      }
      else {
         super.hitWith(actor)

         const hitAng = Math.atan2(-actor.dy, -actor.dx)

         for (let i = 0; i < 20; i ++) {
            this.level.addParticle(new Particles.Spark(actor.x, actor.y, hitAng))
         }
      }
   }

   die() {
      for (let i = 0; i < this.radius; i ++) {
         this.level.addParticle(new Particles.RockDebris(this.x, this.y, this.radius, this.color))
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