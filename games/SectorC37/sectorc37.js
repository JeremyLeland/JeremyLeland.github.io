import { Game } from "./game.js"
import { Level } from "./level.js"
import { Player } from "./player.js"

export class SectorC37 extends Game {
   constructor() {
      Game.VERSION = 0.03

      super()

      this.level = new Level(2000, 2000)
      this.player = this.level.player
      
      this.keyBindings = { "pause": 32 }

      this.updateScroll()
      
      this.canvas.style.cursor = "crosshair"

      this.startGame()
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

   //
   // See: https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444
   //

   

   checkForShipToAvoid(ship) {
      // let closestEnemy = null, closestDist = Number.POSITIVE_INFINITY
      // this.enemies.forEach(e => {
      //    if (e != ship) {
      //       const dist = ship.distanceFrom(e.x, e.y)
      //       const angle = ship.angleTo(e.x, e.y)

      //       if (Math.abs(angle) < 0.5 && dist < closestDist) {
      //          closestEnemy = e
      //          closestDist = dist
      //       }
      //    }
      // })

      // if (closestDist < 300) {
      //    ship.setAvoidShip(closestEnemy)
      // }
      // else {
      //    ship.setAvoidShip(null)
      // }

      let closestAsteroid = null, closestTime = Number.POSITIVE_INFINITY
      this.asteroids.forEach(a => {
         const time = ship.timeUntilHit(a)

         if (time < closestTime) {
            closestAsteroid = a
            closestTime = time
         }
      })

      if (closestTime < 2000) {
         ship.setAvoidShip(closestAsteroid)
      }
      else {
         ship.setAvoidShip(null)
      }


      // const dist = ship.distanceFrom(this.player.x, this.player.y)
      // const angle = ship.angleTo(this.player.x, this.player.y)

      // if (Math.abs(angle) < 0.5 && dist < 300) {
      //    ship.setAvoidShip(this.player)
      // }
      // else {
      //    ship.setAvoidShip(null)
      // }
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
      if (this.keyDown["pause"]) {
         return
      }

      this.controlPlayer(dt)

      this.level.update(dt)

      // this.updateDebugUI()
   }

   draw(ctx) {
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.save()

      this.updateScroll()
      ctx.translate(-this.scrollX, -this.scrollY)

      this.level.draw(ctx)
      
      ctx.restore()
   }
}
