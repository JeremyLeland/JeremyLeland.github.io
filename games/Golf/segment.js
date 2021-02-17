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

      this.angle = Math.atan2(y2 - y1, x2 - x1)
   }

   // NOTE: Negative is "outside" of segment, positive is "inside" of segment
   getDistanceFromInfiniteLine(x, y) {
      return (this.x1 - x) * this.normalX + (this.y1 - y) * this.normalY
   }

   // NOTE: negative values are to the left of the bounds, positive values are to the right
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

   getDistanceFrom(x, y, radius) {
      if (Math.abs(this.getDistanceFromSegmentBounds(x, y)) > radius) {
         return Number.NEGATIVE_INFINITY
      }
      else {
         return this.getDistanceFromInfiniteLine(x, y)
      }
   }

   // Based on: https://www.gamasutra.com/view/feature/131790/simple_intersection_tests_for_games.php         
   getTimeHitBy(lastX, lastY, nowX, nowY, radius) {
      const d0 = this.getDistanceFromInfiniteLine(lastX, lastY)
      const d1 = this.getDistanceFromInfiniteLine(nowX, nowY)

      // Negative is "outside" of segment, positive is "inside" of segment
      if (d0 < d1) {
         const u = (d0 + radius) / ( d0 - d1 ) // normalized time
         const hitX = (1 - u) * lastX + u * nowX
         const hitY = (1 - u) * lastY + u * nowY

         if (Math.abs(this.getDistanceFromSegmentBounds(hitX, hitY)) > radius) {
            return Number.POSITIVE_INFINITY
         }
         else {
            return u
         }
      }
      else {
         return Number.POSITIVE_INFINITY
      }
   }
}