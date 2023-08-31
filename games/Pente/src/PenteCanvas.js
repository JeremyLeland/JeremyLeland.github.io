import { AnimatedCanvas } from '../src/common/AnimatedCanvas.js';

import { Board } from '../src/Board.js';

const GameStateKey = 'penteGameState';

export class PenteCanvas extends AnimatedCanvas {

  board = Object.assign( new Board(), JSON.parse( localStorage.getItem( GameStateKey ) ) );

  constructor( canvas, onUIUpdate = ( board ) => {} ) {
    super( 100, 100, canvas );
    this.onUIUpdate = onUIUpdate;

    document.addEventListener( 'pointerdown', ( e ) => {
      if ( this.board.victory ) {
        this.newGame();
      }
      else {
        const col = Math.round( Board.Size * e.offsetX / this.scale );
        const row = Math.round( Board.Size * e.offsetY / this.scale );
        
        const move = this.board.getMove( col, row );
        if ( move ) {
          this.board.applyMove( move );
          this.boardUpdated();
        }
      }
    } );
    
    const KeyBindings = {
      KeyU: _ => this.undo(),
      KeyC: _ => this.newGame(),
    };
    document.addEventListener( 'keydown', ( e ) => KeyBindings[ e.code ]?.() );    

    this.boardUpdated();
  }

  update = ( dt ) => {
    if ( !this.board.update( dt ) ) {
      this.stop();
    }
  }
  
  draw = ( ctx ) => {
    this.ctx.scale( 1 / Board.Size, 1 / Board.Size );
    this.ctx.lineWidth = Board.Size / this.scale;

    this.board.draw( ctx );
  }

  newGame() {
    this.board = new Board();
    this.boardUpdated();
  }

  undo() {
    this.board.undo();
    this.boardUpdated();
  }

  boardUpdated() {
    localStorage.setItem( GameStateKey, JSON.stringify( this.board ) );
    this.onUIUpdate( this.board );
    this.start();
  }
}





