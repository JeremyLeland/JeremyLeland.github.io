import { Game } from "./game.js"
import { Player } from "./player.js"

export class SectorC37 extends Game {
   constructor() {
      Game.VERSION = 0.01

      super()

      this.keyBindings = { }

      this.player = new Player()
      this.player.spawn(100, 100)

      this.viewport.canvas.style.cursor = "crosshair"

      this.startGame()
   }

   prepareUI() {
      super.prepareUI()

      this.debugUI = document.createElement('div')
      this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
      document.body.appendChild(this.debugUI)
   }

   getAimAngle() {
      const diffX = this.mousex - (this.player.x - this.viewport.scrollX)
      const diffY = this.mousey - (this.player.y - this.viewport.scrollY)
      return Math.atan2(diffY, diffX)
   }

   update(dt) {
      this.player.goalAngle = this.getAimAngle()

      this.player.update(dt)

      const str = "x = " + this.player.x + "\r\ny = " + this.player.y +
                  "\r\ndx = " + this.player.dx + "\r\ndy = " + this.player.dy +
                  "\r\nangle = " + this.player.angle + "\r\ngoalAngle = " + this.player.goalAngle

      this.debugUI.textContent = str
   }

   draw() {
      const ctx = this.viewport.context

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.player.draw(this.viewport)
   }
}
