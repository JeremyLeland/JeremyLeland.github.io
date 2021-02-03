import { Player } from "./player.js"

export class Segment {
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
}

export class Level {
   constructor() {
      this.segmentWidth = 20
      this.generateSegments()
      
      this.gravity = 0.001
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
   }
}