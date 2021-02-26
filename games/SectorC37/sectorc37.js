import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class SectorC37 extends Game {
   constructor() {
      Game.VERSION = "Sector C37 v0.05"

      super()

      this.level = new Level(2000, 2000)
      this.player = this.level.player
      
      this.canvas.style.cursor = "crosshair"

      this.startGame()
   }

   prepareUI() {
      super.prepareUI()

      
   }

   updateDebugUI() {
      // const str = "e0->e1 = " + this.enemies[0].timeUntilHitShip(this.enemies[1]) +
      //             "\r\ne1->e0 = " + this.enemies[1].timeUntilHitShip(this.enemies[0])
      // this.debugUI.textContent = str
   }

   updateScroll() {
      const w = this.context.canvas.width
      const h = this.context.canvas.height

      this.scrollX = Math.max(0, Math.min(this.level.width - w, this.player.x - w/2))
      this.scrollY = Math.max(0, Math.min(this.level.height - h, this.player.y - h/2))
   }

   controlPlayer(dt) {
      const goalX = this.mousex + this.scrollX
      const goalY = this.mousey + this.scrollY
      this.player.setGoal(goalX, goalY)
 
      if (this.mouseIsDown) {
         this.player.startShooting()
      }
      else {
         this.player.stopShooting()
      }
   }

   update(dt) {
      this.updateScroll()

      this.controlPlayer(dt)
      this.level.update(dt)

      this.updateDebugUI()
   }

   draw(ctx) {
      ctx.save()
      ctx.translate(-this.scrollX, -this.scrollY)
      this.level.draw(ctx)
      ctx.restore()
   }
}
