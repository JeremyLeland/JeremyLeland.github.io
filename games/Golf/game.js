export class Game {
   static VERSION = 0

   constructor() {
      this.canvas = document.getElementById("game")
      this.context = this.canvas.getContext("2d")

      this.prepareUI()

      this.keyBindings = {}
      this.keyDown = {}
      document.onkeydown = (e) => this.keyDownCallback(e)
      document.onkeyup = (e) => this.keyUpCallback(e)
   }

   prepareUI() {
      this.fpsUI = document.createElement('div')
      this.fpsUI.style = "position: absolute; left: 100%; top: 100%; transform: translate(-14px, -14px); font: 10px sans-serif"
      document.body.appendChild(this.fpsUI)
      this.frames = 0
      setInterval(() => this.updateFPS(), 1000)

      this.versionUI = document.createElement('div')
      this.versionUI.textContent = "Version: " + Game.VERSION
      this.versionUI.style = "position: absolute; left: 2px; top: 100%; transform: translate(0, -14px); font: 10px sans-serif"
      document.body.appendChild(this.versionUI)
   }

   startGame() {
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
      this.fpsUI.textContent = this.frames
      this.frames = 0
   }

   update(dt) {}
   draw(context) {}
}