// TOOD: Move gameState related code into class
import * as Tantrix from './Tantrix.js';

export class GameState {
  #possibleMoves = [];

  static fromLocalStore() {
    const gameState = JSON.parse( localStorage.getItem( Tantrix.GameStateKey ) );

    if ( gameState ) {
      return new GameState( gameState );
    }
  }

  static newGame( numPlayers ) {
    const gameState = {
      board: [],
      hands: Array.from( Array( numPlayers ), _ => [] ),
      deck: Array.from( Array( Tantrix.NumTiles ), ( _, i ) => i ),
      turn: 0,
      phase: 0,
    }

    for ( let i = 0; i < Tantrix.HandSize; i ++ ) {
      gameState.hands.forEach( hand => hand.push( pullFromDeck( gameState.deck ) ) );
    }

    return new GameState( gameState );
  }

  constructor( json ) {
    Object.assign( this, json );
    
    this.#updatePossibleMoves();
  }

  #updatePossibleMoves() {
    this.#possibleMoves = Tantrix.getValidMoves( this.board, this.hands[ this.turn ] );

    if ( this.#possibleMoves.some( m => m.forced ) ) {
      console.log( `Player ${ this.turn }, phase ${ this.phase }: Forced moves available` );
    }
    else {
      console.log( `Player ${ this.turn }, phase ${ this.phase }: No forced moves, advancing to next phase` );
      this.phase ++;
    }

    // Convenient place to save our state
    localStorage.setItem( Tantrix.GameStateKey, JSON.stringify( this ) );
  }

  makeMove( move ) {
    this.board.push( {
      id: move.id,
      rot: move.rot,
      col: move.col,
      row: move.row,
    } );

    this.hands[ this.turn ][ move.handIndex ] = pullFromDeck( this.deck );

    if ( this.phase == 1 ) {
      console.log( `Player ${ this.turn }, phase ${ this.phase }: Free move played, advancing to next phase` );
      this.phase ++;
    }

    this.#updatePossibleMoves();

    if ( this.phase > 2 ) {
      console.log( `Player ${ this.turn }, phase ${ this.phase }: Phase 2 complete, next player's turn` );

      this.turn = ( this.turn + 1 ) % this.hands.length;
      this.phase = 0;

      this.#updatePossibleMoves();
    }
  }
}

function pullFromDeck( deck ) {
  return deck.splice( Math.floor( Math.random() * deck.length ), 1 )[ 0 ];
}