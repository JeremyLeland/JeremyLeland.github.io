const Size = 0.45;
const GrowSpeed = 0.004;
const SpecularOffset = -0.175;
const SpecularSize = 0.1;
const SpecularColor = '#fffd';

const piece = new Path2D();
piece.arc( 0, 0, Size, 0, Math.PI * 2 );

const specular = new Path2D();
specular.arc( SpecularOffset, SpecularOffset, SpecularSize, 0, Math.PI * 2 );


export class Piece {
  static PlayerColors = {
    Red: '#e00a',
    Orange: '#e80a',
    Yellow: '#fd0a',
    Green: '#084a',
    Blue: '#08fa',
    Violet: '#808a',
  };

  colorKey;
  #size = 0;

  grow( dt ) {
    if ( this.#size < 1 ) {
      this.#size = Math.min( 1, this.#size + GrowSpeed * dt );
      return true;
    }
  }

  shrink( dt ) {
    if ( this.#size > 0 ) {
      this.#size = Math.max( 0, this.#size - GrowSpeed * dt );
      return true;
    }
  }

  draw( ctx ) {
    if ( this.colorKey ) {
      ctx.save();
      ctx.scale( this.#size, this.#size );
      
      ctx.fillStyle = Piece.PlayerColors[ this.colorKey ];
      ctx.fill( piece );
      ctx.stroke( piece );

      ctx.fillStyle = SpecularColor;
      ctx.fill( specular );
      
      ctx.restore();
    }
  }
}