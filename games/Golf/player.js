import { Segment } from "./level.js"

export class Player {

   constructor(level) {
      this.level = level
      this.radius = 8
   }

   spawn(x, y) {
      this.x = x
      this.y = y
      this.dx = this.dy = 0
   }

   updatePosition(dt) {
      this.dy += this.level.gravity * dt
      this.x += this.dx * dt
      this.y += this.dy * dt
   }

   bounceOff(segment) {
      const p = this.dx * segment.normalX + this.dy * segment.normalY
      this.dx -= 2 * p * segment.normalX
      this.dy -= 2 * p * segment.normalY
   }

   update(dt) {
      while (dt > 0) {
         const lastX = this.x
         const lastY = this.y
         const lastDX = this.dx
         const lastDY = this.dy
         this.updatePosition(dt)

         const segment = this.level.segmentAt(this.x)

         // Based on: https://www.gamasutra.com/view/feature/131790/simple_intersection_tests_for_games.php
         const d0 = (segment.x1 - lastX) * segment.normalX + (segment.y1 - lastY) * segment.normalY
         const d1 = (segment.x1 - this.x) * segment.normalX + (segment.y1 - this.y) * segment.normalY

         // Negative is "outside" of segment, positive is "inside" of segment
         if (d0 < -this.radius && d1 > -this.radius) {
            const hitTime = (d0 + this.radius) / ( d0 - d1 ) // normalized time
         
            // If we hit something, start over and only update until the hit
            this.x = lastX
            this.y = lastY
            this.dx = lastDX
            this.dy = lastDY
            this.updatePosition(hitTime * dt)
            this.bounceOff(segment)

            dt -= hitTime * dt
         }
         else {
            dt = 0
         }
      }
   }

   draw(ctx) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "black"
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }
}