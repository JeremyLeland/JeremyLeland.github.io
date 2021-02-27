import { Ship } from "./ship.js"
import { Gun } from "./gun.js"

export class Player extends Ship {
   constructor(x, y, level) {
      super({
         x: x, y: y, 
         radius: 10, 
         health: 100, 
         damage: 50, 
         speed: 0.2, 
         turnSpeed: 0.005,
         color: "green",
         level: level
      })

      const guns = []
      for (let i = 0; i < 2; i ++) {
         guns.push(new Gun({
            timeBetweenShots: 100,
            bulletSpeed: 0.4,
            bulletDamage: 10,
            bulletColor: this.color,
            level: level
         }))
      }

      guns[0].frontOffset = guns[1].frontOffset = this.radius * 2
      guns[0].sideOffset = -this.radius / 2
      guns[1].sideOffset =  this.radius / 2

      this.setGuns(guns[0], guns[1])
   }

   update(dt) {
      this.turnTowardPoint(this.goalX, this.goalY, dt)

      super.update(dt)
   }
}