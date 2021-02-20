import { Ship } from "./ship.js"

export class Player extends Ship {
   constructor(x, y) {
      super()

      this.accel = 0.0001
      this.minSpeed = 0
      this.maxSpeed = 0.2
      this.turnSpeed = 0.005

      this.timeBetweenShots = 100
      this.bulletSpeed = 0.4

      this.width = 20
      this.length = 20
      this.color = "green"

      this.spawn(x, y)
   }
}