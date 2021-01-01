//
// World
//

class Cell {
   static SIZE = 16
   static COLOR = "rgb(200, 200, 200)"
   static FALL_SPEED = 0.002

   constructor(col, row) {
      this.col = col
      this.row = row
      
      this.centerX = col * Cell.SIZE + Cell.SIZE / 2
      this.centerY = row * Cell.SIZE + Cell.SIZE / 2
      
      this.dHeight = 0.0
      this.height = 1.0

      this.isSolid = true
   }

   drop() {
      this.dHeight = -Cell.FALL_SPEED
      this.isSolid = false
   }
   
   update(dt) {
      this.height += this.dHeight * dt
      this.height = Math.max(this.height, 0.0)
   }
   
   draw(context) {
      context.strokeStyle = "black"
      context.fillStyle = Cell.COLOR

      let xDiameter = (Cell.SIZE / 2) * this.height
      let yDiameter = (Cell.SIZE / 2) * this.height

      context.fillRect(this.centerX - xDiameter, this.centerY - yDiameter, xDiameter * 2, yDiameter * 2)
      context.strokeRect(this.centerX - xDiameter, this.centerY - yDiameter, xDiameter * 2, yDiameter * 2)
   }
}

class Board {
   constructor(cols, rows, lives) {
      this.cols = cols
      this.rows = rows
      this.size = Cell.SIZE

      this.slicers = []
      this.lastSlice = []
      this.lastSplitType = ""

      this.cells = []
      for (let c = 0; c < this.cols; c ++) {
         this.cells[c] = []
         for (let r = 0; r < this.rows; r ++) {
            this.cells[c][r] = new Cell(c, r)
         }
      }
      this.clearedCells = []

      this.balls = []
      this.lives = lives

      // Prepare static background image
      this.image = document.createElement('canvas')
      this.image.width = cols * Cell.SIZE
      this.image.height = rows * Cell.SIZE
      this.refreshBackgroundImage()
   }

   addRandomBall() {
      let x = Math.random() * (this.cols - 1) * Cell.SIZE + Cell.SIZE / 2
      let y = Math.random() * (this.rows - 1) * Cell.SIZE + Cell.SIZE / 2
      let ang = Math.random() * Math.PI * 2
      this.balls.push(new Ball(this, x, y, Math.cos(ang) * Ball.SPEED, Math.sin(ang) * Ball.SPEED))
   }
   
   slice(x, y, splitType) {
      let col = Math.floor(x / this.size)
      let row = Math.floor(y / this.size)
      let cell = this.cells[col][row]

      // Only one slice can be happening at a time
      if (cell.isSolid && this.slicers.length == 0) {
         if (splitType == "vertical") {
            this.slicers.push(new Slicer(this, col, row, "up", Slicer.COLOR_1))
            this.slicers.push(new Slicer(this, col, row, "down", Slicer.COLOR_2))
         }
         else if (splitType == "horizontal") {
            this.slicers.push(new Slicer(this, col, row, "left", Slicer.COLOR_1))
            this.slicers.push(new Slicer(this, col, row, "right", Slicer.COLOR_2))
         }
      }
   }

   clearCell(cell) {
      if (cell.isSolid) {
         cell.drop()
         this.clearedCells.push(cell)
      }
   }

   doFill(col, row, cellsToClear) {
      if (this.isSolidAt(col, row)) {
         let cell = this.cells[col][row]
         if (cellsToClear.has(cell)) {
            return
         }
         else {
            cellsToClear.add(cell)
            this.doFill(col - 1, row, cellsToClear)
            this.doFill(col + 1, row, cellsToClear)
            this.doFill(col, row - 1, cellsToClear)
            this.doFill(col, row + 1, cellsToClear)
         }
      }
   }

   clearSlicedCells() {
      let cellsToClear = [ new Set(), new Set() ]

      this.slicers.forEach(slicer => {
         slicer.slicedCells.forEach(slicedCell => {
            let c = slicedCell.col
            let r = slicedCell.row

            if (slicer.isVertical()) {
               this.doFill(c - 1, r, cellsToClear[0])
               this.doFill(c + 1, r, cellsToClear[1])
            }
            else if (slicer.isHorizontal()) {
               this.doFill(c, r - 1, cellsToClear[0])
               this.doFill(c, r + 1, cellsToClear[1])
            }
         })
      })

      let ballCells = []
      this.balls.forEach(ball => ballCells.push(this.cells[ball.col()][ball.row()]))

      cellsToClear.forEach(toClear => {
         if (!ballCells.some(ballCell => toClear.has(ballCell))) {
            toClear.forEach(cell => {
               this.clearCell(cell)
            })
         }
      })

      this.refreshBackgroundImage()
   }

   getClearedPercentage() {
      return Math.floor(this.clearedCells.length / (this.cols * this.rows) * 100.0)
   }

   isSolidAt(col, row) {
      if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) {
         return false
      }
      else {
         return this.cells[col][row].isSolid
      }
   }
   
   update(dt) {
      this.balls.forEach(ball => ball.update(dt))

      this.slicers.forEach(slicer => {
         if (!slicer.isDone) {
            slicer.update(dt)

            // If slice was successful, clear just the sliced cells for now (only do this once)
            if (slicer.wasSuccess) {
               slicer.slicedCells.forEach(slicedCell => this.clearCell(slicedCell))
               this.refreshBackgroundImage()
            }
            else if (slicer.isDone) {
               this.lives --
            }
         }
      })

      // If slice was successful, clear rest of cells
      if (this.slicers.every(slicer => slicer.isDone)) {
         if (this.slicers.every(slicer => slicer.wasSuccess)) {
            this.clearSlicedCells()
         }

         this.slicers = []
      }

      // Update cells
      for (let c = 0; c < this.cols; c ++) {
         for (let r = 0; r < this.rows; r ++) {
            this.cells[c][r].update(dt)
         }
      }
   }

   refreshBackgroundImage() {
      let context = this.image.getContext('2d')

      context.fillStyle = "#000"
      context.fillRect(0, 0, this.image.width, this.image.height)

      for (let c = 0; c < this.cols; c ++) {
         for (let r = 0; r < this.rows; r ++) {
            if (this.cells[c][r].isSolid)
               this.cells[c][r].draw(context)
         }
      }
   }
   
   draw(context) {
      context.drawImage(this.image, 0, 0)

      for (let c = 0; c < this.cols; c ++) {
         for (let r = 0; r < this.rows; r ++) {
            if (this.cells[c][r].height < 1.0)
               this.cells[c][r].draw(context)
         }
      }

      this.slicers.forEach(slicer => slicer.draw(context))
      this.balls.forEach(ball => ball.draw(context))
   }
}

class Slicer {
   static SPEED = 0.1
   static COLOR_1 = "rgba(255, 0, 0, 0.75)"
   static COLOR_2 = "rgba(0, 0, 255, 0.75)"

   constructor(board, col, row, direction, color) {
      this.board = board

      this.startCol = col
      this.startRow = row

      this.startX = col * this.board.size + this.board.size / 2
      this.startY = row * this.board.size + this.board.size / 2

      this.x = this.startX
      this.y = this.startY

      this.direction = direction
      if (direction == "up") {
         this.dx = 0
         this.dy = -Slicer.SPEED
      }
      else if (direction == "down") {
         this.dx = 0
         this.dy = Slicer.SPEED
      }
      else if (direction == "left") {
         this.dx = -Slicer.SPEED
         this.dy = 0
      }
      else if (direction == "right") {
         this.dx = Slicer.SPEED
         this.dy = 0
      }

      this.slicedCells = new Set([ board.cells[col][row] ])
      
      this.color = color
      this.isDone = false
      this.wasSuccess = false
   }

   isVertical() { return this.direction == "up" || this.direction == "down" }
   isHorizontal() { return this.direction == "left" || this.direction == "right" }

   isCollidingWithBall(ball) {
      let centerX = (this.startX + this.x) / 2
      let centerY = (this.startY + this.y) / 2
      let halfWidth = (Math.abs(this.startX - this.x) + this.board.size) / 2
      let halfHeight = (Math.abs(this.startY - this.y) + this.board.size) / 2

      return Math.abs(ball.x - centerX) < halfWidth + ball.radius &&
             Math.abs(ball.y - centerY) < halfHeight + ball.radius
   }

   update(dt) {
      if (!this.isDone) {
         this.x += this.dx * dt
         this.y += this.dy * dt

         // Check balls
         if (this.board.balls.some(ball => this.isCollidingWithBall(ball))) {
            this.isDone = true
            this.wasSuccess = false
            return
         }

         // Slice cells
         let col = Math.floor(this.x / this.board.size)
         let row = Math.floor(this.y / this.board.size)

         if (col < 0 || row < 0 || col >= this.board.cols || row >= this.board.rows) {
            this.isDone = true
            this.wasSuccess = true
         }
         else {
            let cell = this.board.cells[col][row]

            if (cell.isSolid) {
               this.slicedCells.add(cell)
            }
            else {
               this.isDone = true
               this.wasSuccess = true
            }
         }
      }
   }

   draw(context) {
      if (!this.isDone) {
         context.fillStyle = this.color

         let x = Math.min(this.x, this.startX) - this.board.size / 2
         let y = Math.min(this.y, this.startY) - this.board.size / 2
         let width = Math.abs(this.x - this.startX) + this.board.size
         let height = Math.abs(this.y - this.startY) + this.board.size

         context.fillRect(x, y, width, height)
      }
   }
}

class Ball {
   static RADIUS = 8
   static SPEED = 0.1
   static COLOR = "yellow"

   constructor(board, x, y, dx, dy) {
      this.board = board

      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
      this.radius = Ball.RADIUS
   }

   row() {
      return Math.floor(this.y / this.board.size)
   }

   col() {
      return Math.floor(this.x / this.board.size)
   }

   update(dt) {
      this.x += this.dx * dt
      this.y += this.dy * dt

      // Check edges for bounce
      let topRow = Math.floor((this.y - this.radius) / this.board.size)
      let bottomRow = Math.floor((this.y + this.radius) / this.board.size)
      let leftCol = Math.floor((this.x - this.radius) / this.board.size)
      let rightCol = Math.floor((this.x + this.radius) / this.board.size)

      let centerRow = Math.floor(this.y / this.board.size)
      let centerCol = Math.floor(this.x / this.board.size)

      // TODO: We should roll back time to the point of collision, not just nudge to the side
      // TODO: We should account for colliding with two cells at once, and figure out which we hit first
      if (!this.board.isSolidAt(leftCol, centerRow)) {
         this.x = (leftCol + 1) * this.board.size + this.radius
         this.dx = -this.dx
      }
      if (!this.board.isSolidAt(rightCol, centerRow)) {
         this.x = rightCol * this.board.size - this.radius
         this.dx = -this.dx
      }
      if (!this.board.isSolidAt(centerCol, topRow)) {
         this.y = (topRow + 1) * this.board.size + this.radius
         this.dy = -this.dy
      }
      if (!this.board.isSolidAt(centerCol, bottomRow)) {
         this.y = bottomRow * this.board.size - this.radius
         this.dy = -this.dy
      }
   }

   draw(context) {
      context.fillStyle = Ball.COLOR
      context.beginPath()
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      context.fill()
   }
}

const BOARD_COLS = 30
const BOARD_ROWS = 20
const WIN_PERCENTAGE = 75
const START_BALLS = 3

class JazzBall extends Game {
   constructor() {
      super()

      this.livesLabel = document.getElementById("lives")
      this.clearedLabel = document.getElementById("cleared")
      this.elapsedLabel = document.getElementById("elapsed")

      this.level = 0
      this.newGame(this.level + START_BALLS)

      this.render()
   }

   newGame(numBalls) {
      this.sliceDirection = "vertical"
      this.canvas.style.cursor = "ns-resize"

      this.levelLost = this.levelWon = false
      this.elapsedTime = 0

      this.board = new Board(BOARD_COLS, BOARD_ROWS, numBalls /*lives*/)

      for (let i = 0; i < numBalls; i ++) {
         this.board.addRandomBall()
      }
   }

   update(dt) {
      if (mouseIsDown) {
         if (this.levelWon) {
            this.newGame(++this.level + START_BALLS)
         }
         else if (this.levelLost) {
            this.newGame(this.level + START_BALLS)
         }
         else {      
            if (mouseButton == leftButton) {
               this.board.slice(mousex, mousey, this.sliceDirection)
            }
            else if (mouseButton == rightButton) {
               this.sliceDirection = this.sliceDirection == "vertical" ? "horizontal" : "vertical"
               this.canvas.style.cursor = this.sliceDirection == "vertical" ? "ns-resize" : "ew-resize"
            }
         }
         mouseIsDown = false  // one action per click
      }

      this.board.update(dt)

      if (this.board.lives < 0) {
         this.levelLost = true
         this.canvas.style.cursor = "default"
      }
      else if (this.board.getClearedPercentage() >= WIN_PERCENTAGE) {
         this.levelWon = true
         this.canvas.style.cursor = "default"
      }

      if (!this.levelLost && !this.levelWon) {
         this.elapsedTime += dt
      }
   }

   drawMessage(context, str1, str2) {
      let x = context.canvas.width / 2
      let y = context.canvas.height / 2

      context.fillStyle = "rgba(0, 0, 0, 0.3)"
      context.fillRect(0, y - 40, context.canvas.width, 80)

      context.textBaseline = "bottom"
      context.textAlign = "center"
      context.strokeStyle = "#000"
      context.fillStyle = "#fff"

      context.font = "30px sans-serif"
      context.fillText(str1, x, y)
      //context.strokeText(str1, x, y)

      y += 30

      context.font = "20px sans-serif"
      context.fillText(str2, x, y)
      //context.strokeText(str2, x, y)
   }

   draw(context) {
      // Clear
      context.fillStyle = "#000"
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)
      
      // Game board
      this.board.draw(context)

      this.livesLabel.textContent = this.board.lives
      this.clearedLabel.textContent = this.board.getClearedPercentage()

      let elapsed = new Date(this.elapsedTime)
      let elapsedStr = elapsed.getMinutes() + ":" + elapsed.getSeconds().toString().padStart(2, "0")
      this.elapsedLabel.textContent = elapsedStr

      if (this.levelWon) {
         this.drawMessage(context, "Level Complete", "Click for next level")
      }
      else if (this.levelLost) {
         this.drawMessage(context, "Game Over", "Click to try again")
      }
   }
}
