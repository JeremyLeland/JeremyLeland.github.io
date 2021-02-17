import { Ship } from "./ship.js"

export class Player extends Ship {
	constructor() {
      super(0.0001 /*accel*/, 0 /*minSpeed*/, 0.2 /*maxSpeed*/, 0.005 /*turnSpeed*/)
   }

   update(dt) {
      this.moveTowardsGoal(dt)
   }

   draw(viewport) {
      this.drawTriangle(viewport, 10, 20, "green")
   }
}