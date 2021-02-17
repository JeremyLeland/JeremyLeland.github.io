import { Ship } from "./ship.js"

export class Enemy extends Ship {
   constructor() {
      super(0.0001 /*accel*/, 0 /*minSpeed*/, 0.15 /*maxSpeed*/, 0.003 /*turnSpeed*/)
   }

   update(dt) {
      this.moveTowardsGoal(dt)
   }

   draw(viewport) {
      this.drawTriangle(viewport, 10, 20, "blue")
   }
}