import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.02

      super()

      this.keyBindings = { }

      this.level = new Level()
      this.player = new Player(this.level)
      this.player.spawn(10, 10)

      this.startGame()
   }

   update(dt) {
      this.player.update(dt)
   }

   draw(ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.level.draw(ctx)
      this.player.draw(ctx)
   }
}
