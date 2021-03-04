import { Starfield } from "./starfield.js"
import { Asteroid } from "./asteroid.js"
import { Player } from "./player.js"
import { Enemy } from "./enemy.js"

export class Level {
   constructor(width, height) {
      this.width = width
      this.height = height

      this.starfield = new Starfield(this.width, this.height, 1000)

      this.actors = []
      this.particles = []
   }

   initGameLevel() {
      this.player = new Player(this.width / 2, this.height / 2, this)
      this.actors.push(this.player)

      this.spawnEnemyDelay = this.timeBetweenEnemies = 12000
      this.spawnEnemyDelay = this.timeBetweenEnemies = 14000

      // Initial spawns are inside of level, future spawns will be outside level
      for (let i = 0; i < 5; i ++) {
         this.addRandomEnemy(this.width/4 + this.width*i/5)
      }

      for (let i = 0; i < 40; i ++) {
         this.addRandomAsteroid(this.width/4 + this.width*i/40)
      }
   }

   addRandomEnemy(distFromCenter) {
      const [x, y] = this.getRandomSpawnLocation(distFromCenter)
      const enemy = new Enemy(x, y, this)

      //enemy.setTargetShip(this.player)

      enemy.setGoal(Math.random() * this.width, Math.random() * this.height)

      this.actors.push(enemy)
   }

   addRandomAsteroid(distFromCenter) {
      const [x, y] = this.getRandomSpawnLocation(distFromCenter)
      const dx = Math.random() * 0.02 - 0.01
      const dy = Math.random() * 0.02 - 0.01
      const radius = Math.random() * 50 + 20
      const c = Math.random() * 100 + 100
      const col = "rgb(" + c + ", " + c/2 + ", " + 0 + ")"

      this.actors.push(new Asteroid(x, y, dx, dy, radius, col, this))
   }

   getRandomSpawnLocation(distFromCenter) {
      const ang = Math.random() * Math.PI * 2
      const x = Math.cos(ang) * distFromCenter
      const y = Math.sin(ang) * distFromCenter

      return [x + this.width / 2, y + this.height / 2]
   }

   addActor(actor) {
      this.actors.push(actor)
   }

   addParticle(part) {
      this.particles.push(part)
   }

   getActorsNear(actor) {
      // TODO: only return actors close to given actor
      return this.actors.filter(a => a != actor && a.isAlive())
   }

   spawnEnemies(dt) {
      this.spawnEnemyDelay -= dt
      if (this.spawnEnemyDelay < 0) {
         this.addRandomEnemy(this.width * 1.5)
         this.spawnEnemyDelay = this.timeBetweenEnemies
      }
   }

   spawnAsteroids(dt) {
      this.spawnAsteroidDelay -= dt
      if (this.spawnAsteroidDelay < 0) {
         this.addRandomAsteroid(this.width * 1.5)
         this.spawnAsteroidDelay = this.timeBetweenAsteroids
      }
   }

   handleBounce(a1, a2) {
      // See https://ericleong.me/research/circle-circle/#dynamic-circle-circle-collision
      // TODO: try something from this monster? http://www.euclideanspace.com/physics/dynamics/collision/twod/index.htm
      const diffX = a2.x - a1.x
      const diffY = a2.y - a1.y
      const distBetween = Math.sqrt(diffX * diffX + diffY * diffY)
      const normX = diffX / distBetween
      const normY = diffY / distBetween

      const p = 2 * (a1.dx * normX + a1.dy * normY - a2.dx * normX - a2.dy * normY) / (a1.mass + a2.mass)

      a1.dx -= p * a2.mass * normX
      a1.dy -= p * a2.mass * normY
      a2.dx += p * a1.mass * normX
      a2.dy += p * a1.mass * normY
   }

   update(dt) {
      this.spawnEnemies(dt)
      this.spawnAsteroids(dt)
   
      this.actors.forEach(a => {
         a.update(dt)

         const nearby = this.getActorsNear(a)
         nearby.forEach(n => {
            const hitTime = a.timeUntilHit(n)
            if (-dt < hitTime && hitTime < 0) {
               // Roll back actors to time of collision
               a.updatePosition(hitTime)
               n.updatePosition(hitTime)

               // Collision response
               this.handleBounce(a, n)
               a.hitWith(n)
               n.hitWith(a)

               // Finish the update with new velocity
               // TODO: Do we need this? Can't tell if its having an effect...
               a.updatePosition(-hitTime)
               n.updatePosition(-hitTime)
            }
         })
      })
      this.actors = this.actors.filter(a => a.isAlive())

      this.particles.forEach(p => p.update(dt))
      this.particles = this.particles.filter(p => p.isAlive())
   }

   draw(ctx) {
      this.starfield.draw(ctx)
      this.actors.forEach(e => e.draw(ctx))
      this.particles.forEach(p => p.draw(ctx))
   }
}