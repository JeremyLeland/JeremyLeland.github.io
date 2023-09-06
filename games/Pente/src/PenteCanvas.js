import { AnimatedCanvas } from '../src/common/AnimatedCanvas.js';

import { Board } from '../src/Board.js';

const GameStateKey = 'penteGameState';

const DefaultColors = [ 'Red', 'Yellow', 'Green', 'Blue' ];

export class PenteCanvas extends AnimatedCanvas {

  board = Object.assign( new Board(), JSON.parse( localStorage.getItem( GameStateKey ) ) );

  readyForUserMove = false;

  constructor( canvas ) {
    super( 100, 100, canvas );

    this.board.onUIUpdate = () => this.onUIUpdate();
    this.board.onReady = () => this.onReady();

    canvas.addEventListener( 'pointerdown', ( e ) => {
      if ( this.board.victory ) {
        this.newGame( this.board.teams );
      }
      else if ( this.readyForUserMove ) {
        const col = Math.round( Board.Size * e.offsetX / this.scale );
        const row = Math.round( Board.Size * e.offsetY / this.scale );
        
        const move = this.board.getMove( col, row );
        if ( move ) {
          this.readyForUserMove = false;
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
    this.board.update( dt );
  }
  
  draw = ( ctx ) => {
    this.ctx.scale( 1 / Board.Size, 1 / Board.Size );
    this.ctx.lineWidth = Board.Size / this.scale;

    this.board.draw( ctx );
  }

  setPlayerColor( team, color ) {
    this.board.color[ team - 1 ] = color;
    this.boardUpdated();
  }

  setPlayerAI( team, ai ) {
    this.board.ai[ team - 1 ] = ai;
    this.boardUpdated();
  }

  newGame( numPlayers ) {
    const carryOverSettings = {
      'teams': numPlayers,
      // TODO: What if default color is already taken? Ensure no duplicates
      'color': Array.from( Array( numPlayers ), ( _, index ) => this.board.color[ index ] ?? DefaultColors[ index ] ),
      'ai': Array.from( Array( numPlayers ), ( _, index ) => this.board.ai[ index ] ?? 0 ),   // default to human
      'captures': Array( numPlayers ).fill( 0 ),
    };

    this.board = Object.assign( new Board(), carryOverSettings );
    this.board.onUIUpdate = () => this.onUIUpdate();
    this.board.onReady = () => this.onReady();
    this.boardUpdated();
  }

  undo() {
    this.board.undo();
    this.boardUpdated();
  }

  boardUpdated() {
    localStorage.setItem( GameStateKey, JSON.stringify( this.board ) );
    // this.onUIUpdate( this.board );
    this.start();
  }

  onReady() {
    this.stop();
    this.readyForUserMove = true;
    this.onUIUpdate( this.board );
  }

  // Override from UI
  onUIUpdate( board ) {}
}





