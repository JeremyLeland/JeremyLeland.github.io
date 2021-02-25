export class Entity {
   constructor(x, y, dx, dy) {
      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
   }

   isAlive() {
      return true
   }

   distanceFrom(x, y) {
      const cx = x - this.x
      const cy = y - this.y
      return Math.sqrt(cx*cx + cy*cy)
   }

   angleTo(x, y) {
      return Math.atan2(y - this.y, x - this.x) - this.angle
   }

   isCollidingWith(entity) {
      return this.distanceFrom(entity.x, entity.y) < this.radius + entity.radius
   }

   hitWith(entity) {
      this.health -= entity.damage
   }

   think(dt) {
   }

   update(dt) {
      this.think(dt)

      this.x += this.dx * dt
      this.y += this.dy * dt
   }
}