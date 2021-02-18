import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor() {
      super()

      this.accel = 0.0001
      this.minSpeed = 0
      this.maxSpeed = 0.15
      this.turnSpeed = 0.003

      this.timeBetweenShots = 100
      this.bulletSpeed = 0.3

      this.width = 15
      this.length = 15
      this.color = "blue"
   }

   update(dt) {
      // For now, shoot if we are close to target and it is in front of us
      if (this.distanceFromGoal() < 100 && Math.abs(this.goalAngle - this.angle) < 0.5) {
         this.startShooting()
      }
      else {
         this.stopShooting()
      }

      super.update(dt)
   }
}