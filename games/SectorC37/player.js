import { Ship } from "./ship.js"

export class Player extends Ship {
   constructor(x, y, level) {
      super({x: x, y: y, 
             radius: 10, 
             health: 100, 
             damage: 50, 
             speed: 0.2, 
             turnSpeed: 0.005,
             timeBetweenShots: 100,
             bulletSpeed: 0.4,
             bulletDamage: 10,
             color: "green",
             level: level})
   }

   update(dt) {
      this.turnTowardPoint(this.goalX, this.goalY, dt)

      super.update(dt)
   }
}