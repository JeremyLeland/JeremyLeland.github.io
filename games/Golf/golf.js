import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.01

      super()

      this.keyBindings = { }

      this.level = new Level()

      this.startGame()
   }

   update(dt) {
      this.level.update(dt)
   }

   draw(ctx) {
      this.level.draw(ctx)
   }
}
