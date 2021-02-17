import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class Golf extends Game {
   constructor() {
      Game.VERSION = 0.03

      super()

      this.keyBindings = { }

      this.scrollX = 0
      this.scrollY = 0

      this.level = new Level()
      this.player = new Player(5)
      this.player.spawn(450, 10)

      this.startGame()
   }

   prepareUI() {
      super.prepareUI()

      this.debugUI = document.createElement('div')
      this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
      document.body.appendChild(this.debugUI)
   }

   getAimAngle(scrollX, scrollY) {
      const diffX = this.mousex - (this.player.x - scrollX)
      const diffY = this.mousey - (this.player.y - scrollY)
      return Math.atan2(diffY, diffX)
   }

   update(dt) {
      this.debugUI.textContent = "x = " + this.player.x + "\r\ny = " + this.player.y + "\r\ndx = " + this.player.dx + "\r\ndy = " + this.player.dy 

      if (this.mouseIsDown) {
         const IMPULSE = 0.001
         const impulseX = (this.mousex - (this.player.x - this.scrollX)) * IMPULSE
         const impulseY = (this.mousey - (this.player.y - this.scrollY)) * IMPULSE
         this.player.addImpulse(impulseX, impulseY)
      }

      const nearSegments = this.level.getSegmentsNear(this.player)
      this.player.update(dt, nearSegments, this.level.gravity)

      this.scrollX = Math.min(this.level.MAX_X - this.canvas.width, 
                              Math.max(0, this.player.x - this.canvas.width / 2))
      this.scrollY = Math.min(this.level.MAX_Y - this.canvas.height, 
                              Math.max(0, this.player.y - this.canvas.height / 2))
   }

   drawAimer(ctx, scrollX, scrollY) {
      const AIM_WIDTH = this.player.radius / 2, AIM_MAX_LENGTH = 100
      const angle = this.getAimAngle(scrollX, scrollY)
      const sinAng = Math.sin(angle), cosAng = Math.cos(angle)
      const leftX = this.player.x - sinAng * AIM_WIDTH
      const leftY = this.player.y + cosAng * AIM_WIDTH
      const rightX = this.player.x + sinAng * AIM_WIDTH
      const rightY = this.player.y - cosAng * AIM_WIDTH
      const frontX = this.player.x + cosAng * AIM_MAX_LENGTH
      const frontY = this.player.y + sinAng * AIM_MAX_LENGTH

      ctx.strokeStyle = "red"
      ctx.beginPath()
      ctx.moveTo(this.player.x - scrollX, this.player.y - scrollY)
      ctx.lineTo(leftX - scrollX, leftY - scrollY)
      ctx.lineTo(frontX - scrollX, frontY - scrollY)
      ctx.lineTo(rightX - scrollX, rightY - scrollY)
      ctx.lineTo(this.player.x - scrollX, this.player.y - scrollY)
      ctx.stroke()
      ctx.closePath()
   }

   draw(ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      this.level.draw(ctx, this.scrollX, this.scrollY)
      this.player.draw(ctx, this.scrollX, this.scrollY)

      if (!this.player.isMoving()) {
         this.drawAimer(ctx, this.scrollX, this.scrollY)
      }
   }
}
