import { Game } from "./game.js"
import { Player } from "./player.js"
import { Enemy } from "./enemy.js"

export class SectorC37 extends Game {
   constructor() {
      Game.VERSION = 0.02

      super()

      this.keyBindings = { }

      this.player = new Player(100, 100)
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
      const enemy = new Enemy(Math.random() * 1000, Math.random() * 1000)
      enemy.setTargetShip(this.player)

      this.enemies.push(enemy)
   }

   // prepareUI() {
   //    super.prepareUI()

   //    this.debugUI = document.createElement('div')
   //    this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
   //    document.body.appendChild(this.debugUI)
   // }

   // updateDebugUI() {
   //    const str = "x = " + this.player.x + "\r\ny = " + this.player.y +
   //                "\r\ndx = " + this.player.dx + "\r\ndy = " + this.player.dy +
   //                "\r\nangle = " + this.player.angle + "\r\ngoalAngle = " + this.player.goalAngle +
   //                "\r\ndistFromGoal = " + this.player.distanceFromGoal() +
   //                "\r\nspeed = " + this.player.speed
   //    this.debugUI.textContent = str
   // }

   checkForShipToAvoid(ship) {
      let closestEnemy = null, closestTime = Number.POSITIVE_INFINITY
      this.enemies.forEach(e => {
         if (e != ship) {
            const time = ship.timeUntilHitShip(e)

            if (time > 0 && time < closestTime) {
               closestEnemy = e
               closestTime = time
            }
         }
      })

      if (closestTime < 1000) {
         ship.setAvoidShip(closestEnemy)
      }
      else {
         ship.setAvoidShip(null)
      }
   }

   updateScroll() {
      this.scrollX = this.context.canvas.width / 2 - this.player.x
      this.scrollY = this.context.canvas.height / 2 - this.player.y
   }

   update(dt) {
      const goalX = this.mousex - this.scrollX
      const goalY = this.mousey - this.scrollY
      this.player.setGoal(goalX, goalY)
      this.player.update(dt)      
      this.updateScroll()

      if (this.mouseIsDown) {
         this.player.startShooting()
      }
      else {
         this.player.stopShooting()
      }

      this.enemies.forEach(e => {
         this.checkForShipToAvoid(e)
         e.update(dt)
      })

      //this.updateDebugUI()
   }

   draw() {
      const ctx = this.context

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.save()

      ctx.translate(this.scrollX, this.scrollY)

      this.player.draw(ctx)
      this.enemies.forEach(e => e.draw(ctx))

      ctx.restore()
   }
}
