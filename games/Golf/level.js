import { Player } from "./player.js"

class Segment {
   constructor(x1, y1, x2, y2) {
      this.x1 = x1
      this.y1 = y1
      this.x2 = x2
      this.y2 = y2

      const diffX = x2 - x1
      const diffY = y2 - y1
      const len = Math.sqrt(diffX * diffX + diffY * diffY)

      this.normalX = diffY / len
      this.normalY = -diffX / len
   }

   checkCollisionWith(player) {
      // Find closest point on segment to player
      const distFromEdge = (this.x1 - player.x) * this.normalX + (this.y1 - player.y) * this.normalY
      let closestX = player.x + this.normalX * distFromEdge
      let closestY = player.y + this.normalY * distFromEdge

      // The line is infinite, but our segment is not
      // if closest point is outside our segment, use end of line instead
      if (closestX < this.x1) {
         closestX = this.x1
         closestY = this.y1
      }
      else if (closestX > this.x2) {
         closestX = this.x2
         closestY = this.y2
      }

      const diffX = closestX - player.x
      const diffY = closestY - player.y
      const distBetween = Math.sqrt(diffX * diffX + diffY * diffY)

      if (distBetween <= player.radius) {
         // Nudge player out of the collision
         const distToMove = player.radius - distBetween
         const angle = Math.atan2(diffY, diffX)
         player.x -= Math.cos(angle) * distToMove
         player.y -= Math.sin(angle) * distToMove

         // Bounce
         const p = player.dx * this.normalX + player.dy * this.normalY
         player.dx -= 2 * p * this.normalX
         player.dy -= 2 * p * this.normalY
      }
   }
}

export class Level {

   constructor() {
      this.segmentWidth = 20
      this.generateSegments()
      
      this.gravity = 0.01

      this.player = new Player(this /*level*/)
      this.player.spawn(10, 10)
   }

   generateSegments() {
      this.segments = []

      // for now, just a sine wave of heights
      let x1, y1, x2, y2
      for (let i = 0; i < 50; i ++) {
         x2 = i * this.segmentWidth
         y2 = -Math.sin(Math.PI/2 + i / 5) * 100 + 200
         
         if (i > 0) {
            this.segments.push( new Segment(x1, y1, x2, y2) )
         }

         x1 = x2
         y1 = y2
      }
   }

   segmentAt(x) {
      const ndx = Math.floor(x / this.segmentWidth)
      
      return this.segments[ndx]
   }

   update(dt) {
      this.player.update(dt)

      const segment = this.segmentAt(this.player.x)
      segment.checkCollisionWith(this.player)
   }

   draw(ctx) {
      ctx.strokeStyle = "green"

      ctx.beginPath()

      // TODO: additional points so we can fill

      const first = this.segments[0]
      ctx.moveTo(first.x1, first.y1)
      this.segments.forEach(s => ctx.lineTo(s.x2, s.y2))
      //ctx.fill()
      ctx.stroke()
      ctx.closePath()

      this.player.draw(ctx)
   }
}