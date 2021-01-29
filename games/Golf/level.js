import { Player } from "./player.js"

export class Level {
   static SEGMENT_LENGTH = 20
   static GRAVITY = 0.1

   constructor() {
      this.heights = []

      // for now, just a sine wave of heights
      for (let i = 0; i < 50; i ++) {
         this.heights.push(Math.sin(i / 5) * 100 + 200)
      }

      this.gravity = Level.GRAVITY

      this.player = new Player(this /*level*/)
      this.player.spawn(10, 10)
   }

   update(dt) {
      this.player.update(dt)
   }

   draw(ctx) {
      ctx.strokeStyle = "green"

      ctx.beginPath()

      // TODO: additional points so we can fill

      ctx.moveTo(0, this.heights[0])
      for (let i = 1; i < 50; i ++) {
         ctx.lineTo(Level.SEGMENT_LENGTH * i, this.heights[i])
      }
      //ctx.fill()
      ctx.stroke()
      ctx.closePath()

      this.player.draw(ctx)
   }
}