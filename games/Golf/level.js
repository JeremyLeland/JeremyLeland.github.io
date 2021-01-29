import { Player } from "./player.js"

class Segment {
   constructor(x1, y1, x2, y2) {
      this.x1 = x1
      this.y1 = y1
      this.x2 = x2
      this.y2 = y2

      const x = x2 - x1
      const y = y2 - y1
      const len = Math.sqrt(x*x + y*y)

      this.normalX = y / len
      this.normalY = -x / len
   }

   isCollidingWith(player) {
      let fromEdge = (this.x1 - player.x) * this.normalX + (this.y1 - player.y) * this.normalY
      const hitX = player.x + this.normalX * fromEdge
      const hitY = player.y + this.normalY * fromEdge

      // The line is infinite, but our segment is not
      // if "hit" point is outside our segment, use distance from ends of line
      if (hitX < this.x1) {
         const x = player.x - this.x1
         const y = player.y - this.y1
         fromEdge = Math.sqrt(x*x + y*y)
      }
      else if (hitX > this.x2) {
         const x = player.x - this.x2
         const y = player.y - this.y2
         fromEdge = Math.sqrt(x*x + y*y)
      }

      return fromEdge <= player.radius
   }
}

export class Level {

   constructor() {
      this.segmentWidth = 20
      this.generateSegments()
      
      this.gravity = 0.1

      this.player = new Player(this /*level*/)
      this.player.spawn(10, 10)
   }

   generateSegments() {
      this.segments = []

      // for now, just a sine wave of heights
      let x1, y1, x2, y2
      for (let i = 0; i < 50; i ++) {
         x2 = i * this.segmentWidth
         y2 = Math.sin(i / 5) * 100 + 200
         
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
      if (segment.isCollidingWith(this.player)) {
         this.player.dy = 0
      }
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