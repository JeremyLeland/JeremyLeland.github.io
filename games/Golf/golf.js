import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.022

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

   getAimAngle() {
      const diffX = this.mousex - this.player.x
      const diffY = this.mousey - this.player.y
      return Math.atan2(diffY, diffX)
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

   drawAimer(ctx) {
      const AIM_WIDTH = this.player.radius / 2, AIM_MAX_LENGTH = 100
      const angle = this.getAimAngle()
      const sinAng = Math.sin(angle), cosAng = Math.cos(angle)
      const leftX = this.player.x - sinAng * AIM_WIDTH
      const leftY = this.player.y + cosAng * AIM_WIDTH
      const rightX = this.player.x + sinAng * AIM_WIDTH
      const rightY = this.player.y - cosAng * AIM_WIDTH
      const frontX = this.player.x + cosAng * AIM_MAX_LENGTH
      const frontY = this.player.y + sinAng * AIM_MAX_LENGTH

      ctx.strokeStyle = "red"
      ctx.beginPath()
      ctx.moveTo(this.player.x, this.player.y)
      ctx.lineTo(leftX, leftY)
      ctx.lineTo(frontX, frontY)
      ctx.lineTo(rightX, rightY)
      ctx.lineTo(this.player.x, this.player.y)
      ctx.stroke()
      ctx.closePath()
   }

   draw(ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.level.draw(ctx)
      this.player.draw(ctx)

      if (!this.player.isMoving()) {
         this.drawAimer(ctx)
      }
   }
}
