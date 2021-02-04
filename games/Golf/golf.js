import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.021

      super()

      this.keyBindings = { }

      this.level = new Level()
      this.player = new Player(this.level)
      this.player.spawn(450, 10)

      this.startGame()
   }

   prepareUI() {
      super.prepareUI()

      this.debugUI = document.createElement('div')
      this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
      document.body.appendChild(this.debugUI)
   }

   update(dt) {
      this.debugUI.textContent = "x = " + this.player.x + "\r\ny = " + this.player.y + "\r\ndx = " + this.player.dx + "\r\ndy = " + this.player.dy 

      if (this.mouseIsDown) {
         const IMPULSE = 0.001
         const impulseX = (this.mousex - this.player.x) * IMPULSE
         const impulseY = (this.mousey - this.player.y) * IMPULSE
         this.player.addImpulse(impulseX, impulseY)
      }

      this.player.update(dt)
   }

   draw(ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.level.draw(ctx)
      this.player.draw(ctx)

      // power/direction meter
      ctx.strokeStyle = "red"
      ctx.beginPath()
      ctx.moveTo(this.player.x, this.player.y)
      ctx.lineTo(this.mousex, this.mousey)
      ctx.stroke()
      ctx.closePath()
   }
}
