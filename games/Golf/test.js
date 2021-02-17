import { Game } from "./game.js"
import { Segment } from "./segment.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class GolfTest extends Game {
   constructor() {
      Game.VERSION = 0.01

      super()

      this.keyBindings = { }

      this.ground = []
      this.ground.push(new Segment(100, 100, 300, 300))
      this.ground.push(new Segment(300, 300, 400, 300))
      this.ground.push(new Segment(400, 300, 700, 100))

      this.player = new Player(10)
      this.player.spawn(100, 100)

      this.canvas.style.cursor = "crosshair"

      this.startGame()
   }

   prepareUI() {
      super.prepareUI()

      this.debugUI = document.createElement('div')
      this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
      document.body.appendChild(this.debugUI)
   }

   update(dt) {
      
      if (this.mouseIsDown) {
         this.player.spawn(this.mousex, this.mousey)
      }

      this.debugUI.textContent = "x = " + this.player.x + "\r\ny = " + this.player.y + "\r\ndx = " + this.player.dx + "\r\ndy = " + this.player.dy 

      this.oldX = this.player.x
      this.oldY = this.player.y

      this.player.update(dt, this.ground, 0.001)

      this.newX = this.player.x
      this.newY = this.player.y
   }

   draw(ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      Level.drawSegments(this.ground, ctx, 0, 0, 400)

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.strokeStyle = "black"
      ctx.beginPath()
      ctx.arc(this.oldX, this.oldY, this.player.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()

      ctx.fillStyle = "rgba(120, 120, 120, 0.7)"
      ctx.strokeStyle = "black"
      ctx.beginPath()
      ctx.arc(this.newX, this.newY, this.player.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
   }
}
