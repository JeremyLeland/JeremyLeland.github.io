import { Segment } from "./segment.js"
import { Player } from "./player.js"

export class Level {
   constructor() {
      this.GRID_COLS = 200
      this.GRID_ROWS = 50
      this.GRID_SIZE = 50

      this.MAX_X = this.GRID_SIZE * this.GRID_COLS
      this.MAX_Y = this.GRID_SIZE * this.GRID_ROWS

      this.grid = []
      for (let col = 0; col < this.GRID_COLS; col ++) {
         this.grid[col] = []
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            this.grid[col][row] = []
         }
      }

      // Generate ground segments
      
      const ground = []

      /*ground.push(new Segment(100, 100, 300, 300))
      ground.push(new Segment(300, 300, 400, 300))
      ground.push(new Segment(400, 300, 700, 100))*/

      
      let startX = 0, startY = 500

      for (let i = 0; i < 3; i ++) {
         const holeX = startX + Math.random() * 1000 + 1000

         const segments = this.generateGroundSegments(startX, startY, holeX)
         ground.push.apply(ground, segments)
         
         const holeY = segments[segments.length - 1].y2
         const hole = this.generateHoleSegments(holeX, holeY)
         ground.push.apply(ground, hole)

         const lastSegment = hole[hole.length - 1]
         startX = lastSegment.x2
         startY = lastSegment.y2
      }

      const lastBitOfGround = this.generateGroundSegments(startX, startY, startX + 1000)
      ground.push.apply(ground, lastBitOfGround)


      this.ground = ground
      this.addSegmentsToGrid(this.ground)

      this.gravity = 0.001
   }

   generateGroundSegments(startX, startY, endX) {
      const curvePoints = this.generateCurvePoints(startX, startY, endX)
      return this.generateSegmentsFromCurvePoints(curvePoints)
   }

   generateHoleSegments(leftX, leftY) {
      const HOLE_WIDTH = 20, HOLE_DEPTH = 20

      const rightX = leftX + HOLE_WIDTH
      const rightY = leftY
      const holeY = leftY + HOLE_DEPTH

      return [
         new Segment(leftX, leftY, leftX, holeY),     // left
         new Segment(leftX, holeY, rightX, holeY),    // bottom
         new Segment(rightX, holeY, rightX, rightY)   // right
      ]
   }

   // Generate points going from left to right
   generateCurvePoints(startX, startY, endX) {
      const minStep = 100
      const maxStep = 200
      const spreadAngle = Math.PI / 2

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

      // adjust the final point to match the endX
      curvePoints[curvePoints.length - 1][0] = endX

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

   addSegmentsToGrid(ss) {
      ss.forEach(s => this.addSegmentToGrid(s))
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
               this.grid[col][row].push(s)
            }
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
            nearSegments.push.apply(nearSegments, this.grid[col][row])
         }
      }

      return nearSegments
   }

   // Expects complete, closed, fillable collection of segments 
   static drawSegments(segments, ctx, scrollX, scrollY, groundY) {
      ctx.strokeStyle = "black"
      ctx.fillStyle = "green"

      ctx.beginPath()

      const first = segments[0]
      ctx.moveTo(first.x1 - scrollX, first.y1 - scrollY)
      segments.forEach(s => ctx.lineTo(s.x2 - scrollX, s.y2 - scrollY))
      
      if (groundY !== undefined) {
         const last = segments[segments.length - 1]
         ctx.lineTo(last.x2 - scrollX, groundY - scrollY)
         ctx.lineTo(first.x1 - scrollX, groundY - scrollY)
         ctx.lineTo(first.x1 - scrollX, first.y1 - scrollY)
      }

      ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }

   draw(ctx, scrollX, scrollY) {
      // debug grid
      ctx.strokeStyle = "gray"
      for (let col = 0; col < this.GRID_COLS; col ++) {
         for (let row = 0; row < this.GRID_ROWS; row ++) {
            ctx.strokeRect(col * this.GRID_SIZE - scrollX, row * this.GRID_SIZE - scrollY, this.GRID_SIZE, this.GRID_SIZE)
         }
      }
      
      Level.drawSegments(this.ground, ctx, scrollX, scrollY, this.MAX_Y)

      //ctx.fillStyle = "yellow"
      //this.curvePoints.forEach(p => ctx.fillRect(p[0] - scrollX, p[1] - scrollY, 4, 4))
   }
}