export class Demo {
   constructor(canvas, fpsUI) {
      this.canvas = canvas
      this.context = this.canvas.getContext("2d")

      this.fpsUI = fpsUI

      // Keyboard
      this.keyBindings = {}
      this.keyDown = {}
      document.onkeydown = (e) => this.keyDownCallback(e)
      document.onkeyup = (e) => this.keyUpCallback(e)

      // Mouse
      this.mousex = 0
      this.mousey = 0
      this.mouseIsDown = false
      this.mouseButton = -1
      this.canvas.onmousedown = (e) => this.mouseDownCallback(e)
      this.canvas.onmouseup = (e) => this.mouseUpCallback(e)
      this.canvas.onmousemove = (e) => this.mouseMovedCallback(e)
   }

   startDemo() {
      this.lastTime = new Date().getTime()
      this.animate()
   }

   keyDownCallback(e) {
      for (var k in this.keyBindings) {
         if (e.keyCode == this.keyBindings[k]) {
            this.keyDown[k] = true
         }
      }
   }

   keyUpCallback(e) {
      for (var k in this.keyBindings) {
         if (e.keyCode == this.keyBindings[k]) {
            this.keyDown[k] = false
         }
      }
   }

   mouseDownCallback(e) {
      this.mouseIsDown = true

      this.mousex = e.offsetX
      this.mousey = e.offsetY
      this.mouseButton = e.button
   }

   mouseUpCallback(e) {
      this.mouseIsDown = false

      this.mousex = e.offsetX
      this.mousey = e.offsetY
      this.mouseButton = -1
   }

   mouseMovedCallback(e) {
      this.mousex = e.offsetX
      this.mousey = e.offsetY
   }

   animate() {
      requestAnimationFrame( () => this.animate() )

      const MAX_DT = 20

      let now = new Date().getTime()

      // Do multiple updates for long delays (so we don't miss things)
      for (let dt = now - this.lastTime; dt > 0; dt -= MAX_DT) {
         this.update(Math.min(dt, MAX_DT))
      }

      this.lastTime = now

      this.draw(this.context)
      this.frames ++
   }

   updateFPS() {
      if (this.fpsUI != null) {
         this.fpsUI.textContent = this.frames
      }
      
      this.frames = 0
   }

   update(dt) {}
   draw(ctx) {}
}
