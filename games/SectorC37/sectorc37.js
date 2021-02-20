import { Game } from "./game.js"
import { Starfield } from "./starfield.js"
import { Player } from "./player.js"
import { Enemy } from "./enemy.js"

export class SectorC37 extends Game {
   constructor() {
      Game.VERSION = 0.021

      super()

      this.LEVEL_WIDTH = 2000
      this.LEVEL_HEIGHT = 2000

      this.starfield = new Starfield(this.LEVEL_WIDTH, this.LEVEL_HEIGHT, 1000)

      this.keyBindings = { "pause": 32 }

      this.player = new Player(this.LEVEL_WIDTH / 2, this.LEVEL_HEIGHT / 2)
      this.updateScroll()

      this.enemies = []
      for (let i = 0; i < 5; i ++) {
         this.addRandomEnemy()
      }

      this.bullets = []
      
      this.canvas.style.cursor = "crosshair"

      this.startGame()
   }

   addRandomEnemy() {
      const enemy = new Enemy(Math.random() * this.LEVEL_WIDTH, Math.random() * this.LEVEL_HEIGHT)
      //enemy.setTargetShip(this.player)

      enemy.setGoal(Math.random() * this.LEVEL_WIDTH, Math.random() * this.LEVEL_HEIGHT)

      this.enemies.push(enemy)
   }

   // prepareUI() {
   //    super.prepareUI()

   //    this.debugUI = document.createElement('div')
   //    this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
   //    document.body.appendChild(this.debugUI)
   // }

   // updateDebugUI() {
   //    const str = "e0->e1 = " + this.enemies[0].timeUntilHitShip(this.enemies[1]) +
   //                "\r\ne1->e0 = " + this.enemies[1].timeUntilHitShip(this.enemies[0])
   //    this.debugUI.textContent = str
   // }

   checkForShipToAvoid(ship) {
      let closestEnemy = null, closestTime = Number.POSITIVE_INFINITY
      this.enemies.forEach(e => {
         if (e != ship) {
            const time = ship.timeUntilHitShip(e)

            if (time < closestTime) {
               closestEnemy = e
               closestTime = time
            }
         }
      })

      if (closestTime < 1000) {

         // Ship further from target takes evasive action
         if (ship.distanceFromTargetShip() > closestEnemy.distanceFromTargetShip()) {
            ship.setAvoidShip(closestEnemy)
         }
         else {
            ship.setAvoidShip(null)
         }
      }
      else {
         ship.setAvoidShip(null)
      }
   }

   updateScroll() {
      const w = this.context.canvas.width
      const h = this.context.canvas.height

      this.scrollX = Math.max(0, Math.min(this.LEVEL_WIDTH - w, this.player.x - w/2))
      this.scrollY = Math.max(0, Math.min(this.LEVEL_HEIGHT - h, this.player.y - h/2))
   }

   updatePlayer(dt) {
      const goalX = this.mousex + this.scrollX
      const goalY = this.mousey + this.scrollY
      this.player.setGoal(goalX, goalY)
      this.player.update(dt)      
      this.updateScroll()

      if (this.mouseIsDown) {
         this.player.startShooting()
      }
      else {
         this.player.stopShooting()
      }
   }

   update(dt) {
      if (this.keyDown["pause"]) {
         return
      }

      this.updatePlayer(dt)

      this.enemies.forEach(e => {

         if (e.distanceFrom(e.goalX, e.goalY) < e.width * 2) {
            e.setGoal(Math.random() * this.LEVEL_WIDTH, Math.random() * this.LEVEL_HEIGHT)
         }

         //this.checkForShipToAvoid(e)
         e.update(dt)
      })

      // this.updateDebugUI()
   }

   draw() {
      const ctx = this.context

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.save()

      ctx.translate(-this.scrollX, -this.scrollY)

      this.starfield.draw(ctx)
      this.player.draw(ctx)
      this.enemies.forEach(e => e.draw(ctx))

      ctx.restore()
   }
}
