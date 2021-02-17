import { Segment } from "./segment.js"

export class Player {

   constructor(radius) {
      this.radius = radius
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

   updatePosition(dt, gravity) {
      this.dy += gravity * dt
      this.x += this.dx * dt
      this.y += this.dy * dt
   }

   updatePositionRoll(segment, dt, gravity) {

      const forwardMagnitude = gravity * Math.sin(segment.angle)

      this.dx += Math.cos(segment.angle) * forwardMagnitude * dt
      this.dy += Math.sin(segment.angle) * forwardMagnitude * dt

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
      const FRICTION = 0.02
      const vDotF = this.dx * segment.groundX + this.dy * segment.groundY
      this.dx -= vDotF * segment.groundX * FRICTION
      this.dy -= vDotF * segment.groundY * FRICTION
   }

   doNudge(nearSegments) {
      let closestSegment = null, closestDist = Number.NEGATIVE_INFINITY
      nearSegments.forEach(s => {
         // Negative is "outside" of segment, positive is "inside" of segment
         // so this will seem backwards
         const dist = s.getDistanceFrom(this.x, this.y, this.radius)

         if (dist > closestDist) {
            closestSegment = s
            closestDist = dist
         }
      })

      // If we are currently touching a segment, nudge out of it then roll along it
      if (closestDist >= -this.radius) {
         const nudgeDist = this.radius + closestSegment.getDistanceFromInfiniteLine(this.x, this.y)
         const nudgeX = closestSegment.normalX * nudgeDist
         const nudgeY = closestSegment.normalY * nudgeDist

         if (Math.abs(nudgeX) > 20 || Math.abs(nudgeY) > 20) {
            // TODO: Remove this when done debugging
            console.log("WARNING: Large nudge!")
         }

         this.x += nudgeX
         this.y += nudgeY

         return closestSegment
      }

      return null
   }

   update(dt, nearSegments, gravity) {
      const nudgeSegment = this.doNudge(nearSegments)

      if (nudgeSegment != null) {
         this.updatePositionRoll(nudgeSegment, dt, gravity)
         this.applyBounce(nudgeSegment)
      }

      else {
         // Otherwise, update as a flying body (and bounce if we hit something)
         const lastX = this.x
         const lastY = this.y

         this.updatePosition(dt, gravity)

         let closestSegment = null, closestHitTime = 1.0
         nearSegments.forEach(s => {
            const time = s.getTimeHitBy(lastX, lastY, this.x, this.y, this.radius)

            if (time > 0 && time < closestHitTime) {
               closestSegment = s
               closestHitTime = time
            }
         })

         // If we hit something, rewind to point of collision, bounce, then update rest of way
         if (closestHitTime < 1.0) {
            this.updatePosition((closestHitTime - 1.0) * dt, gravity)
            this.applyBounce(closestSegment)
            this.updatePosition((1.0 - closestHitTime) * dt, gravity)
         }
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