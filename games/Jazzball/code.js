//
// Input
//
var mousex = 0, mousey = 0, mouseIsDown = false, mouseButton = -1
var leftButton = 0, rightButton = 2
function mouseDown(e) {
   mouseIsDown = true

   mousex = e.offsetX
   mousey = e.offsetY
   mouseButton = e.button
}
function mouseUp(e) {
   mouseIsDown = false

   mousex = e.offsetX
   mousey = e.offsetY
   mouseButton = -1
}
function mouseMoved(e) {
   mousex = e.offsetX
   mousey = e.offsetY
}

var leftKey = 37, upKey = 38, rightKey = 39, downKey = 40, spaceKey = 32
function keyDown(e) {
}
function keyUp(e) {
}

class Game {
   constructor() {
      this.canvas = document.getElementById("game")
      this.context = this.canvas.getContext("2d")

      this.canvas.onmousedown = mouseDown
      this.canvas.onmouseup = mouseUp
      this.canvas.onmousemove = mouseMoved
      document.onkeydown = keyDown
      document.onkeyup = keyUp

      this.lastTime = new Date().getTime()
   }

   render() {
      const MAX_DT = 20

      let now = new Date().getTime()
      
      // Do multiple updates for long delays (so we don't miss things)
      for (let dt = now - this.lastTime; dt > 0; dt -= MAX_DT) {
         this.update(Math.min(dt, MAX_DT))
      }

      this.lastTime = now

      this.draw(this.context)

      requestAnimationFrame(() => this.render())
   }

   update(dt) {}
   draw(context) {}
}
