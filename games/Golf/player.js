import { Segment } from "./segment.js"

export class Player {

   constructor(level) {
      this.level = level
      this.radius = 5
   }

   spawn(x, y) {
      this.x = x
      this.y = y
      this.dx = this.dy = 0
   }

   isMoving() {
      const MIN_MOVE = 0.02
      return Math.abs(this.dx) > MIN_MOVE || Math.abs(this.dy) > MIN_MOVE
   }

   updatePosition(dt) {
      this.dy += this.level.gravity * dt
      this.x += this.dx * dt
      this.y += this.dy * dt
   }

   addImpulse(impulseX, impulseY) {
      this.dx += impulseX
      this.dy += impulseY
   }

   applyBounce(segment) {
      const DAMPING = 0.7
      const vDotN = this.dx * segment.normalX + this.dy * segment.normalY
      this.dx -= 2 * vDotN * segment.normalX * DAMPING
      this.dy -= 2 * vDotN * segment.normalY * DAMPING

      // TODO: Should friction be time based?
      const FRICTION = 0.05
      const vDotF = this.dx * segment.groundX + this.dy * segment.groundY
      this.dx -= vDotF * segment.groundX * FRICTION
      this.dy -= vDotF * segment.groundY * FRICTION
   }

   update(dt) {
      const lastX = this.x
      const lastY = this.y
      this.updatePosition(dt)

      const segments = this.level.getSegmentsNear(this)
      let closestSegment = null
      let closestHitTime = 1.0

      segments.forEach(s => {
         // Ignore segment if we are outside of it
         if (Math.abs(s.getDistanceFromSegmentBounds(this.x, this.y)) < this.radius) {

            // Based on: https://www.gamasutra.com/view/feature/131790/simple_intersection_tests_for_games.php
            const d0 = s.getDistanceFromInfiniteLine(lastX, lastY)
            const d1 = s.getDistanceFromInfiniteLine(this.x, this.y)

            // Negative is "outside" of segment, positive is "inside" of segment
            if (d0 < d1) {
               const hitTime = (d0 + this.radius) / ( d0 - d1 ) // normalized time

               if (hitTime < closestHitTime) {
                  closestSegment = s
                  closestHitTime = hitTime
               }
            }
         }
      })

      if (closestHitTime < 0.0) {
         // If we were already hitting something, nudge out of it
         let dist = this.radius + closestSegment.getDistanceFromInfiniteLine(this.x, this.y)

         if (dist > 0) {
            let nudgeX = closestSegment.normalX * dist
            let nudgeY = closestSegment.normalY * dist

            this.x += nudgeX
            this.y += nudgeY

            this.applyBounce(closestSegment)

            // update position for rest of time?
         }
      }
      else if (closestHitTime < 1.0) {
         // If we hit something, rewind to point of collision, bounce, then update rest of way
         this.updatePosition((closestHitTime - 1.0) * dt)

         this.applyBounce(closestSegment)

         this.updatePosition((1.0 - closestHitTime) * dt)
      }
   }

   draw(ctx, scrollX, scrollY) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "black"
      ctx.beginPath()
      ctx.arc(this.x - scrollX, this.y - scrollY, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }
}