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

   updateDebugUI() {
      const str = "x = " + this.player.x + "\r\ny = " + this.player.y +
                  "\r\ndx = " + this.player.dx + "\r\ndy = " + this.player.dy +
                  "\r\nangle = " + this.player.angle + "\r\ngoalAngle = " + this.player.goalAngle +
                  "\r\ndistFromGoal = " + this.player.distanceFromGoal() +
                  "\r\nspeed = " + this.player.speed
      this.debugUI.textContent = str
   }

   update(dt) {
      const goalX = this.mousex - this.viewport.scrollX
      const goalY = this.mousey - this.viewport.scrollY
      this.player.setGoal(goalX, goalY)

      this.player.update(dt)

      this.updateDebugUI()
   }

   draw() {
      const ctx = this.viewport.context

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.player.draw(this.viewport)
   }
}
