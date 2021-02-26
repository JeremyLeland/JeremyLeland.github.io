import { Ship } from "./ship.js"

export class Player extends Ship {
   constructor(x, y, level) {
      super(x, y, 10, 100, 50, "green", level)

      this.accel = 0.0001
      this.minSpeed = 0
      this.maxSpeed = 0.2
      this.turnSpeed = 0.005

      this.TIME_BETWEEN_SHOTS = 100
      this.BULLET_SPEED = 0.4
      this.BULLET_DAMAGE = 10

      // this.damage = 50  // ramming damage

      // this.radius = 10
      // this.color = "green"

      // this.MAX_HEALTH = 100

      this.spawn(x, y)
   }

   update(dt) {
      this.turnToward(this.goalX, this.goalY, dt)

      super.update(dt)
   }
}