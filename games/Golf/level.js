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
}

class Grid {
   constructor() {
      this.segments = []
      this.isHole = false
      this.isSolid = false
   }

   addSegment(s) {
      this.segments.push(s)
      this.isSolid = true
   }

   clearSegments() {
      this.segments = []
      this.isSolid = false
   }

   makeHole(holeY) {
      if (this.isHole) {
         console.log("WARNING: Grid is already a hole, skipping")
         return
      }

      if (this.segments.length == 0) {
         console.log("WARNING: Cannot make empty grid a hole, skipping")
         return
      }

      const holeSegment = this.segments[0]

      const left = new Segment(holeSegment.x1, holeSegment.y1, holeSegment.x1, holeY)
      const bottom = new Segment(holeSegment.x1, holeY, holeSegment.x2, holeY)
      const right = new Segment(holeSegment.x2, holeY, holeSegment.x2, holeSegment.y2)

      this.segments = []
      this.segments.push(left)
      this.segments.push(bottom)
      this.segments.push(right)
      this.isHole = true
   }

   draw(ctx, scrollX, scrollY) {
      if (this.segments.length > 0) {
         ctx.strokeStyle = "green"  // "black"
         //ctx.fillStyle = "green"

         ctx.beginPath()

         const first = this.segments[0]

         ctx.moveTo(first.x1 - scrollX, first.y1 - scrollY)
         this.segments.forEach(s => ctx.lineTo(s.x2 - scrollX, s.y2 - scrollY))

         // TODO: figure out how to fill these

         //ctx.fill()
         ctx.stroke()
         ctx.closePath()
      }
   }
}

export class Level {
   constructor() {
      this.GRID_COLS = 200
      this.GRID_ROWS = 50
      this.GRID_SIZE = 20

      this.grid = []

      for (let col = 0; col < this.GRID_COLS; col ++) {
         this.grid[col] = []
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            this.grid[col][row] = new Grid()
         }
      }

      this.generateSegments()

      this.addHoleAt(31)
      this.addHoleAt(45)
      this.addHoleAt(70)
      this.addHoleAt(90)

      this.MAX_X = this.GRID_SIZE * this.GRID_COLS
      this.MAX_Y = 800
      
      this.gravity = 0.001
   }

   generateSegments() {
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
               this.grid[col][row].addSegment(segment)
            }
         }

         x1 = x2
         y1 = y2
      }
   }

   addHoleAt(col) {
      if (col >= this.GRID_COLS) {
         console.log("WARNING: Attempting out-of-bounds hole placement at column " + col + ", skipping")
      }
      else {
         let holeRow = 0
         while (!this.grid[col][holeRow].isSolid && holeRow < this.GRID_ROWS) {
            holeRow ++
         }

         if (holeRow >= this.GRID_ROWS) {
            console.log("WARNING: Could not find surface to dig hole at column " + col + ", skipping")
         }
         else {
            const holeY = (holeRow + 1) * this.GRID_SIZE
            this.grid[col][holeRow].makeHole(holeY)
         }
      }
   }

   getSegmentsNear(player) {
      const left = Math.floor((player.x - player.radius) / this.GRID_SIZE)
      const right = Math.floor((player.x + player.radius) / this.GRID_SIZE)
      const top = Math.floor((player.y - player.radius) / this.GRID_SIZE)
      const bottom = Math.floor((player.y + player.radius) / this.GRID_SIZE)
      
      const nearSegments = []
      for (let col = left; col >= 0 && col <= right && col < this.GRID_COLS; col ++) {
         for (let row = top; row >= 0 && row <= bottom && row < this.GRID_ROWS; row ++) {
            nearSegments.push.apply(nearSegments, this.grid[col][row].segments)
         }
      }

      return nearSegments
   }

   draw(ctx, scrollX, scrollY) {
      for (let col = 0; col < this.GRID_COLS; col ++) {
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            /*/ DEBUG grid
            if (this.grid[col][row].isHole) {
               ctx.strokeStyle = "yellow"
            }
            else {
               ctx.strokeStyle = "gray"
            }
            ctx.strokeRect(col * this.GRID_SIZE - scrollX, row * this.GRID_SIZE - scrollY, this.GRID_SIZE, this.GRID_SIZE)
            */
            this.grid[col][row].draw(ctx, scrollX, scrollY)
         }
      }
   }
}