import { Ship } from "./ship.js"

export class Player extends Ship {
   constructor(x, y, level) {
      super({radius: 10, 
             health: 100, 
             damage: 50, 
             speed: 0.2, 
             turnSpeed: 0.005,
             timeBetweenShots: 100,
             bulletSpeed: 0.4,
             bulletDamage: 10,
             color: "green",
             level: level})

      this.spawn(x, y)
   }

   update(dt) {
      this.turnToward(this.goalX, this.goalY, dt)

      super.update(dt)
   }
}