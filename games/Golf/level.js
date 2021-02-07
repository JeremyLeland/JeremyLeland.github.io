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

      this.groundX = diffX / len
      this.groundY = diffY / len
   }

   getDistanceFromInfiniteLine(x, y) {
      return (this.x1 - x) * this.normalX + (this.y1 - y) * this.normalY
   }

   getDistanceFromSegmentBounds(x, y) {
      // Use ground vector to determine whether we are within the bounds of the segment
      const vectorLeft = (this.x1 - x) * this.groundX + (this.y1 - y) * this.groundY
      const vectorRight = (this.x2 - x) * this.groundX + (this.y2 - y) * this.groundY

      // Ball is in middle of segment
      if (vectorLeft < 0 && 0 < vectorRight) {
         return 0
      }

      // Ball is to left of segment
      else if (0 < vectorLeft && 0 < vectorRight) {
         return vectorLeft
      }

      // Ball is to right of segment
      else if (vectorLeft < 0 && vectorRight < 0) {
         return vectorRight
      }
   }
   

   draw(ctx, scrollX, scrollY) {
      ctx.strokeStyle = "green"  // "black"
      //ctx.fillStyle = "green"

      ctx.beginPath()

      ctx.moveTo(this.x1 - scrollX, this.y1 - scrollY)
      ctx.lineTo(this.x2 - scrollX, this.y2 - scrollY)

      // TODO: figure out how to fill these

      //ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }
}

export class Level {
   constructor() {
      this.GRID_COLS = 200
      this.GRID_ROWS = 50
      this.GRID_SIZE = 16

      this.segments = []

      for (let col = 0; col < this.GRID_COLS; col ++) {
         this.segments[col] = []
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            this.segments[col][row] = null
         }
      }

      this.generateSegments(this.segments)

      this.addHoleAt(20)
      this.addHoleAt(40)
      this.addHoleAt(60)
      this.addHoleAt(80)

      this.MAX_X = this.GRID_SIZE * this.GRID_COLS
      this.MAX_Y = 800
      
      this.gravity = 0.001
   }

   generateSegments(segments) {
      // for now, just a sine wave of heights
      let x1, y1, x2, y2
      for (let i = 0; i <= this.GRID_COLS; i ++) {
         x2 = i * this.GRID_SIZE
         y2 = -Math.sin(Math.PI/2 + i / 5) * 100 + -Math.sin(Math.PI/2 + i / 10) * 100 + 500
         
         if (i > 0) {

            // For now, just reference the same (full) segment in all applicable rows
            const segment = new Segment(x1, y1, x2, y2)
            const col = i - 1
            const minRow = Math.floor(Math.min(y1, y2) / this.GRID_SIZE)
            const maxRow = Math.floor(Math.max(y1, y2) / this.GRID_SIZE)

            for (let row = minRow; row <= maxRow; row ++) {
               segments[col][row] = segment
            }
         }

         x1 = x2
         y1 = y2
      }
   }

   addHoleAt(col) {
      if (col >= this.GRID_COLS - 1) {
         console.log("WARNING: Attempting out-of-bounds hole placement at column " + col + ", skipping")
         return
      }

      let leftRow = 0
      while (this.segments[col][leftRow] == null && leftRow < this.GRID_ROWS) {
         leftRow ++
      }
      const leftSegment = this.segments[col][leftRow]

      let rightRow = 0
      while (this.segments[col+1][rightRow] == null && rightRow < this.GRID_ROWS) {
         rightRow ++
      }
      const rightSegment = this.segments[col+1][rightRow]

      if (leftSegment == null || rightSegment == null) {
         console.log("WARNING: No ground to place hole at column " + col + ", skipping")
      }

      const holeRow = Math.max(leftRow, rightRow) + 2
      const holeY = holeRow * this.GRID_SIZE

      if (holeRow >= this.GRID_SIZE) {
         console.log("WARNING: Ground too low to place hole at column " + col + ", skipping")
      }

      const leftX = leftSegment.x1
      const leftY = leftSegment.y1
      const rightX = rightSegment.x2
      const rightY = rightSegment.y2

      const left = new Segment(leftX, leftY, leftX, holeY)
      const bottom = new Segment(leftX, holeY, rightX, holeY)
      const right = new Segment(rightX, holeY, rightX, rightY)

      for (let row = leftRow; row <= holeRow; row ++) {
         this.segments[col][row] = left
      }
      
      for (let row = rightRow; row <= holeRow; row ++) {
         this.segments[col+1][row] = right
      }
      
      this.segments[col][holeRow] = bottom
      this.segments[col+1][holeRow] = bottom
   }

   getSegmentsNear(player) {
      const left = Math.floor((player.x - player.radius) / this.GRID_SIZE)
      const right = Math.floor((player.x + player.radius) / this.GRID_SIZE)
      const top = Math.floor((player.y - player.radius) / this.GRID_SIZE)
      const bottom = Math.floor((player.y + player.radius) / this.GRID_SIZE)
      
      const nearSegments = []
      for (let col = left; col >= 0 && col <= right && col < this.GRID_COLS; col ++) {
         for (let row = top; row >= 0 && row <= bottom && row < this.GRID_ROWS; row ++) {
            const segment = this.segments[col][row]

            if (segment != null) {
               nearSegments.push(segment)
            }
         }
      }

      return nearSegments
   }

   draw(ctx, scrollX, scrollY) {
      for (let col = 0; col < this.GRID_COLS; col ++) {
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            const segment = this.segments[col][row]

            if (segment != null) {
               segment.draw(ctx, scrollX, scrollY)
            }
         }
      }
   }
}