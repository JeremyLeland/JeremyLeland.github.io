import { Entity } from "./entity.js"

export class Actor extends Entity {
   constructor(x, y, dx, dy, angle, dAngle, radius, health, damage) {
      super(x, y, dx, dy, angle, dAngle, radius)
      this.health = health
      this.damage = damage
   }

   isAlive() {
      return this.health > 0
   }

   hitWith(actor) {
      this.health -= actor.damage

      if (this.health <= 0) {
         this.die()
      }
   }

   die() {
   }

   isCollidingWith(actor) {
      return this.distanceFrom(actor) < this.radius + actor.radius
   }

   distanceFrom(actor) {
      return this.distanceFromPoint(actor.x, actor.y)
   }

   distanceFromPoint(x, y) {
      const cx = x - this.x
      const cy = y - this.y
      return Math.sqrt(cx*cx + cy*cy)
   }

   angleTo(actor) {
      return this.angleToPoint(actor.x, actor.y)
   }

   angleToPoint(x, y) {
      return Math.atan2(y - this.y, x - this.x) - this.angle
   }

   timeUntilHit(other) {
      // See when ships would collide if continuing at their current direction and rate of speed
      // See https://stackoverflow.com/questions/33140999/at-what-delta-time-will-two-objects-collide
      // (Line-Line was http://www.jeffreythompson.org/collision-detection/line-line.php)
      const cx = this.x - other.x
      const cy = this.y - other.y

      const dx1 = this.dx
      const dy1 = this.dy
      const dx2 = other.dx
      const dy2 = other.dy
      const vx = dx1 - dx2
      const vy = dy1 - dy2

      const rr = this.radius + other.radius

      const a = vx*vx + vy*vy
      const b = 2 * (cx * vx + cy * vy)
      const c = cx*cx + cy*cy - rr*rr

      const disc = b*b - 4*a*c

      // If the objects don't collide, the discriminant will be negative
      if (disc < 0) {
         return Number.POSITIVE_INFINITY
      }
      else {
         const t0 = (-b - Math.sqrt(disc)) / (2*a)

         if (t0 >= 0) {
            return t0
         }
         else {
            const t1 = (-b + Math.sqrt(disc)) / (2*a)
            return t1 < 0 ? Number.POSITIVE_INFINITY : t1
         }
      }
   }
}