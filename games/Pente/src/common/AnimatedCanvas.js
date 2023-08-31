export class AnimatedCanvas {
  #reqId;

  scale = 1;

  constructor( width, height, canvas ) {
    this.canvas = canvas ?? document.createElement( 'canvas' );
    this.canvas.oncontextmenu = () => { return false };

    if ( !canvas ) {
      document.body.appendChild( this.canvas );
    }
    
    this.ctx = this.canvas.getContext( '2d' /*, { alpha: false }*/ );

    if ( width && height ) {
      this.setSize( width, height );
    }
    else {
      window.onresize = () => this.setSize( window.innerWidth, window.innerHeight );
      window.onresize();
    }
  }

  setSize( width, height ) {
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
    // this.canvas.style.width = width + 'px';
    // this.canvas.style.height = height + 'px';
    

    this.ctx.scale( devicePixelRatio, devicePixelRatio );
    
  }

  // TODO: Pass scale multiplier in here? (18, in this case)
  updateSize() {
    const bounds = this.canvas.getBoundingClientRect();

    this.canvas.width = bounds.width * devicePixelRatio;
    this.canvas.height = bounds.height * devicePixelRatio;

    this.scale = bounds.width;// / 18;   // TODO: Don't hardcode this, find a better way to involve this

    this.ctx.scale( devicePixelRatio, devicePixelRatio );
    this.ctx.scale( this.scale, this.scale );
    // this.ctx.lineWidth = 1 / this.scale;

    this.redraw();
  }

  redraw() {
    // this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    this.ctx.save();
    this.draw( this.ctx );
    this.ctx.restore();
  }

  start() {
    let lastTime;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      this.update( now - lastTime );
      lastTime = now;
  
      this.redraw();
  
      if ( this.#reqId ) {    // make sure we didn't stop it
        this.#reqId = requestAnimationFrame( animate );
      }
    };

    this.#reqId = requestAnimationFrame( animate );
  }

  stop() {
    cancelAnimationFrame( this.#reqId );
    this.#reqId = null;   // so we can check if stopped
  }

  update( dt ) {}
  draw( ctx ) {}
}
