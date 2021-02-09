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
}

export class Level {
   constructor() {
      this.GRID_COLS = 200
      this.GRID_ROWS = 50
      this.GRID_SIZE = 20

      this.MAX_X = this.GRID_SIZE * this.GRID_COLS
      this.MAX_Y = this.GRID_SIZE * this.GRID_ROWS

      this.grid = []
      for (let col = 0; col < this.GRID_COLS; col ++) {
         this.grid[col] = []
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            this.grid[col][row] = new Grid()
         }
      }

      // Generate ground segments
      this.curvePoints = this.generateCurvePoints(0, 500, this.GRID_COLS * this.GRID_SIZE, 500, 100, 200, Math.PI / 2)
      this.segments = this.generateSegmentsFromCurvePoints(this.curvePoints)
      this.segments.forEach(s => this.addSegmentToGrid(s))

      /*this.addHoleAt(31)
      this.addHoleAt(45)
      this.addHoleAt(70)
      this.addHoleAt(90)*/

      this.gravity = 0.001
   }

   

   // Generate points going from left to right
   generateCurvePoints(startX, startY, endX, endY, minStep, maxStep, spreadAngle) {
      const curvePoints = [ [startX, startY] ]

      let lastX = startX, lastY = startY
      while (lastX < endX) {
         const ang = Math.random() * spreadAngle - spreadAngle / 2
         const dist = Math.random() * (maxStep - minStep) + minStep
         const x = lastX + Math.cos(ang) * dist
         const y = lastY + Math.sin(ang) * dist

         curvePoints.push( [x, y] )

         lastX = x
         lastY = y
      }

      curvePoints.push( [endX, endY] )

      return curvePoints
   }

   // See http://csharphelper.com/blog/2019/04/draw-a-smooth-curve-in-wpf-and-c/
   getPointsWithControls(points, tension) {
      if (points.length < 2)
         return null

      const control_scale = tension / 0.5 * 0.175

      const result_points = []
      result_points.push(points[0])

      for (let i = 0; i < points.length - 1; i++)
      {
         // Get the point and its neighbors.
         const pt_before = points[Math.max(i - 1, 0)]
         const pt = points[i]
         const pt_after = points[i + 1]
         const pt_after2 = points[Math.min(i + 2, points.length - 1)]

         let dx = pt_after[0] - pt_before[0]
         let dy = pt_after[1] - pt_before[1]
         const p2 = [ pt[0] + control_scale * dx, pt[1] + control_scale * dy ]

         dx = pt_after2[0] - pt[0]
         dy = pt_after2[1] - pt[1]
         const p3 = [ pt_after[0] - control_scale * dx, pt_after[1] - control_scale * dy ]

         result_points.push(p2)
         result_points.push(p3)
         result_points.push(pt_after)
      }

      return result_points
   }

   generateSegmentsFromCurvePoints(curvePoints) {
      const points = this.getPointsWithControls(curvePoints, 0.5)

      const segments = []

      const T_STEP = 1.0 / 10
      for (let pointNdx = 0; pointNdx < points.length - 3; pointNdx += 3) {
         let x1, y1, x2, y2
         for (let t = 0; t <= 1.0; t += T_STEP) {
            x2 = (1-t)*(1-t)*(1-t)*points[pointNdx][0] +
                 3*t*(1-t)*(1-t)*points[pointNdx + 1][0] + 
                 3*t*t*(1-t)*points[pointNdx + 2][0] + 
                 t*t*t*points[pointNdx + 3][0]

            y2 = (1-t)*(1-t)*(1-t)*points[pointNdx][1] +
                 3*t*(1-t)*(1-t)*points[pointNdx + 1][1] + 
                 3*t*t*(1-t)*points[pointNdx + 2][1] + 
                 t*t*t*points[pointNdx + 3][1]

            if (t > 0) {
               segments.push( new Segment(x1, y1, x2, y2) )
            }

            x1 = x2
            y1 = y2
         }
      }

      return segments
   }

   addSegmentToGrid(s) {
      const minCol = Math.floor(Math.min(s.x1, s.x2) / this.GRID_SIZE)
      const maxCol = Math.floor(Math.max(s.x1, s.x2) / this.GRID_SIZE)
      const minRow = Math.floor(Math.min(s.y1, s.y2) / this.GRID_SIZE)
      const maxRow = Math.floor(Math.max(s.y1, s.y2) / this.GRID_SIZE)

      if (minCol < 0 || minRow < 0 || maxCol >= this.GRID_COLS || maxRow >= this.GRID_ROWS) {
         console.log("WARNING: trying to add segment outside of grid, skipping")
      }
      else {
         for (let col = minCol; col <= maxCol; col ++) {
            for (let row = minRow; row <= maxRow; row ++) {
               this.grid[col][row].addSegment(s)
            }
         }
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

   // Expects complete, closed, fillable collection of segments 
   drawSegments(segments, ctx, scrollX, scrollY, isGround) {
      ctx.strokeStyle = "black"
      ctx.fillStyle = "green"

      ctx.beginPath()

      const first = segments[0]
      ctx.moveTo(first.x1 - scrollX, first.y1 - scrollY)
      segments.forEach(s => ctx.lineTo(s.x2 - scrollX, s.y2 - scrollY))
      
      if (isGround) {
         const last = segments[segments.length - 1]
         ctx.lineTo(last.x2 - scrollX, this.MAX_Y - scrollY)
         ctx.lineTo(first.x1 - scrollX, this.MAX_Y - scrollY)
         ctx.lineTo(first.x1 - scrollX, first.y1 - scrollY)
      }

      ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }

   draw(ctx, scrollX, scrollY) {
      this.drawSegments(this.segments, ctx, scrollX, scrollY, true /*isGround*/)

      ctx.fillStyle = "yellow"
      this.curvePoints.forEach(p => ctx.fillRect(p[0] - scrollX, p[1] - scrollY, 4, 4))
   }
}