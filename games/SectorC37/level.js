import { Starfield } from "./starfield.js"
import { Asteroid } from "./asteroid.js"
import { Player } from "./player.js"
import { Enemy } from "./enemy.js"

export class Level {
   constructor(width, height) {
      this.width = width
      this.height = height

      this.starfield = new Starfield(this.width, this.height, 1000)

      this.entities = []
      this.particles = []

      this.player = new Player(this.width / 2, this.height / 2, this)
      this.entities.push(this.player)

      this.spawnEnemyDelay = this.timeBetweenEnemies = 12000

      // Initial spawns are inside of level, future spawns will be outside level
      for (let i = 0; i < 5; i ++) {
         this.addRandomEnemy(Math.random() * this.width / 2 + this.width / 4)
      }

      for (let i = 0; i < 10; i ++) {
         this.addRandomAsteroid(Math.random() * this.width / 2 + this.width / 4)
      }
   }

   addRandomEnemy(distFromCenter) {
      const [x, y] = this.getRandomSpawnLocation(distFromCenter)
      const enemy = new Enemy(x, y, this)

      //enemy.setTargetShip(this.player)

      enemy.setGoal(Math.random() * this.width, Math.random() * this.height)

      this.entities.push(enemy)
   }

   addRandomAsteroid(distFromCenter) {
      const [x, y] = this.getRandomSpawnLocation(distFromCenter)
      const dx = Math.random() * 0.01 - 0.02
      const dy = Math.random() * 0.01 - 0.02
      const r = Math.random() * 50 + 20
      const c = Math.random() * 100 + 100
      const col = "rgb(" + c + ", " + c/2 + ", " + 0 + ")"

      this.entities.push(new Asteroid(x, y, dx, dy, r, r, r, col, this))
   }

   getRandomSpawnLocation(distFromCenter) {
      const ang = Math.random() * Math.PI * 2
      const x = Math.random() * Math.cos(ang) * distFromCenter
      const y = Math.random() * Math.sin(ang) * distFromCenter

      return [x + this.width / 2, y + this.height / 2]
   }

   addBullet(bullet) {
      this.entities.push(bullet)
   }

   addParticle(part) {
      this.particles.push(part)
   }

   getEntitiesNear(entity) {
      // TODO: only return entities near the location
      return this.entities.filter(e => e != entity)
   }

   update(dt) {
      this.spawnEnemyDelay -= dt
      if (this.spawnEnemyDelay < 0) {
         this.addRandomEnemy(this.width * 1.5)
         this.spawnEnemyDelay = this.timeBetweenEnemies
      }
   
      this.entities.forEach(e => {
         e.update(dt)

         const nearby = this.getEntitiesNear(e)
         nearby.forEach(n => {
            if (e.isCollidingWith(n)) {
               e.hitWith(n)
               n.hitWith(e)
            }
         })
      })
      this.entities = this.entities.filter(e => e.isAlive())

      this.particles.forEach(p => p.update(dt))
      this.particles = this.particles.filter(p => p.isAlive())
   }

   draw(ctx) {
      this.starfield.draw(ctx)
      this.entities.forEach(e => e.draw(ctx))
      this.particles.forEach(p => p.draw(ctx))
   }
}