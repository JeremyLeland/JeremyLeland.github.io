import { Game } from "./game.js"
import { Asteroid } from "./asteroid.js"
import { Player } from "./player.js"

export class Test extends Game {
	constructor() {
      super()

      this.player = new Player(100, 100)
      
      this.asteroid = new Asteroid(400, 100, 0, 0, 0, 0, 30, "brown")
      
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
      this.player.turnToward(this.mousex, this.mousey, dt)
   }

   draw(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      this.player.draw(ctx)
      this.asteroid.draw(ctx)

      const time = this.player.timeUntilHit(this.asteroid)
      this.debugUI.textContent = "Time to hit: " + time

      if (time != Number.POSITIVE_INFINITY) {
         const hitX = this.player.x + this.player.dx * time
         const hitY = this.player.y + this.player.dy * time

         ctx.fillStyle = "red"
         ctx.beginPath()
         ctx.arc(hitX, hitY, this.player.radius, 0, Math.PI * 2)
         ctx.fill()
      }
   }
}