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