import * as THREE from "./three.module.js" //'https://unpkg.com/three/build/three.module.js'

export class Level {
   static BLOCK_WIDTH = 1.0
   static BLOCK_HEIGHT = 0.5
   static BLOCK_LENGTH = 2.0

   constructor(title, src) {
      this.title = title
      this.isReady = false

      this.image = new Image()
      this.image.src = src
      this.image.onload = () => this.loadFromImage()
   }

   loadFromImage() {
      this.width = this.image.width
      this.height = this.image.height
      this.blocks = []
      for (let x = 0; x < this.width; x ++) {
         this.blocks[x] = []
      }

      let levelCanvas = document.createElement('canvas')
      levelCanvas.width = this.image.width
      levelCanvas.height = this.image.height
      let levelContext = levelCanvas.getContext('2d')
      levelContext.drawImage(this.image, 0, 0)
      let imageData = levelContext.getImageData(0, 0, levelCanvas.width, levelCanvas.height)

      this.scene = new THREE.Scene()

      const light = new THREE.DirectionalLight( 0xFFFFFF );
      light.position.set(0, 1.0, 0.5)
      light.target.position.set(0, 0, 0)
      this.scene.add(light)

      let ndx = 0
      for (let z = 0; z < this.height; z ++) {
         for (let x = 0; x < this.width; x ++) {
            let col = imageData.data[ndx++] << 16 | imageData.data[ndx++] << 8 | imageData.data[ndx++];
            ndx ++;  // skipping alpha

            this.blocks[x][z] = col;

            if (col !== 0) {
               const geo = new THREE.BoxGeometry( Level.BLOCK_WIDTH, Level.BLOCK_HEIGHT, Level.BLOCK_LENGTH )
               const mat = new THREE.MeshLambertMaterial({ color: col })
               const mesh = new THREE.Mesh( geo, mat )

               // Plane should be centered so that e.g. 0 is left, BLOCK_WIDTH is right, and ground is 0
               mesh.position.x = Level.BLOCK_WIDTH * (x + 0.5)
               mesh.position.y = -Level.BLOCK_HEIGHT / 2
               mesh.position.z = Level.BLOCK_LENGTH * (z + 0.5)

               this.scene.add( mesh );
            }
         }
      }

      this.isReady = true
   }

   isSolidAt(col, row) {
      if (col < 0 || row < 0 || col >= this.width || row >= this.height) {
         return false
      }
      else {
         return this.blocks[col][row] !== 0
      }
   }
}