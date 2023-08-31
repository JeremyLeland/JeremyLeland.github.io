import { Piece } from './Piece.js';

const BoardSize = 18;
const BoardColor = '#ffb';
const DiamondSpacing = 6;
const DiamondSize = 0.15;

const grid = new Path2D();
for ( let i = 0; i <= BoardSize; i ++ ) {
  grid.moveTo( 0, i );
  grid.lineTo( BoardSize, i );

  grid.moveTo( i, 0 );
  grid.lineTo( i, BoardSize );
}

const Thickness = 0.03;
const thickGrid = new Path2D();
thickGrid.rect( BoardSize / 2 - Thickness, 0, Thickness * 2, BoardSize );
thickGrid.rect( 0, BoardSize / 2 - Thickness, BoardSize, Thickness * 2 );
// TODO: Edges of board as well?

const diamonds = new Path2D();
for ( let row = 3; row < BoardSize; row += DiamondSpacing ) {
  for ( let col = 3; col < BoardSize; col += DiamondSpacing ) {
    addDiamond( col, row );
  }
}

for ( let row = 6; row < BoardSize; row += DiamondSpacing ) {
  for ( let col = 6; col < BoardSize; col += DiamondSpacing ) {
    addDiamond( col, row );
  }
}

function addDiamond( col, row ) {
  diamonds.moveTo( col, row - DiamondSize );
  diamonds.lineTo( col - DiamondSize, row );
  diamonds.lineTo( col, row + DiamondSize );
  diamonds.lineTo( col + DiamondSize, row );
  diamonds.closePath();
}

export class Board {
  static Size = BoardSize;
  static Splash = [
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 0, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 2, 2, 2, 2, 2, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 2, 0, 2, 0, 2, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 2, 0, 0, 0, 2, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 1, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 2, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 2, 2, 2, 2, 2, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 2, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 1, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 2, 1, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  ];

  board = Array.from( 
    Array( BoardSize + 1 ), _ => Array.from( 
      Array( BoardSize + 1 ), _ => 0 
    )
  );

  history = [];

  teams = 2;
  currentTeam = 1;

  captures = Array( this.teams ).fill( 0 );
  victory = 0;

  #pieces = Array.from( 
    Array( BoardSize + 1 ), _ => Array.from( 
      Array( BoardSize + 1 ), _ => new Piece( 0 ) 
    ) 
  );

  #victoryText;
  #victorySubtext;

  getTeam( col, row ) {
    // TODO: Should the very edges be valid?
    if ( 0 < col && col < BoardSize &&
         0 < row && row < BoardSize ) {
      return this.board[ col ][ row ];
    }
    else {
      return -1;
    }
  }

  getMove( col, row ) {
    if ( this.getTeam( col, row ) == 0 ) {
      const move = {
        col: col, 
        row: row, 
        team: this.currentTeam,
      }

      for ( let dRow = -1; dRow <= 1; dRow ++ ) {
        for ( let dCol = -1; dCol <= 1; dCol ++ ) {
          if ( dCol != 0 || dRow != 0 ) {
            const cols  = [ 1, 2, 3 ].map( i => col + dCol * i );
            const rows  = [ 1, 2, 3 ].map( i => row + dRow * i );
            const teams = [ 0, 1, 2 ].map( i => this.getTeam( cols[ i ], rows[ i ] ) );
              
            if ( teams[ 0 ] == teams[ 1 ] && 
                 teams[ 0 ] > 0 && teams[ 0 ] != this.currentTeam &&
                 teams[ 2 ] == this.currentTeam ) {
              move.captures ??= [];
              move.captures.push( ...[ 0, 1 ].map( i => 
                ( { col: cols[ i ], row: rows[ i ], team: teams[ i ] } ) 
              ) );
            }
          }
        }
      }

      return move;
    }
  }

  applyMove( move ) {
    // In a row
    this.board[ move.col ][ move.row ] = move.team;

    let longest = 0;
    [ [ -1, -1 ], [ 0, -1 ], [ 1, -1 ], [ -1, 0 ] ].forEach( dir => {
      let numSame = -1;   // since we'll be counting col,row twice

      [ -1, 1 ].forEach( posneg => {
        for ( let col = move.col, row = move.row;
          this.getTeam( col, row ) == move.team;
          col += dir[ 0 ] * posneg, row += dir[ 1 ] * posneg, numSame ++ );
      } );
      
      longest = Math.max( longest, numSame );
    } );

    console.log( 'longest made = ' + longest );

    if ( longest >= 5 ) {
      this.#victorySubtext = `Player ${ move.team } got ${ longest } in a row`;
      this.victory = move.team;
    }

    // Captures
    if ( move.captures ) {
      move.captures.forEach( piece => this.board[ piece.col ][ piece.row ] = 0 );
      this.captures[ move.team - 1 ] += move.captures.length / 2;

      console.log( `team ${ move.team } now has ${ this.captures[ move.team - 1 ] } captures `);
      
      if ( this.captures[ move.team - 1 ] >= 5 ) {
        this.#victorySubtext = `Player ${ move.team } got ${ this.captures[ move.team - 1 ] } captures`;
        this.victory = move.team;
      }
    }

    if ( this.victory ) {
      this.#victoryText = `Player ${ move.team } Wins!`;
    }

    this.currentTeam = this.currentTeam % this.teams + 1;

    this.history.push( move );
  }

  undo() {
    const move = this.history.pop();

    if ( move ) {
      if ( move.captures ) {
        this.captures[ move.team - 1 ] -= move.captures.length / 2;
        move.captures.forEach( piece => this.board[ piece.col ][ piece.row ] = piece.team );
      }

      this.board[ move.col ][ move.row ] = 0;

      this.victory = 0;
    
      this.currentTeam --;
      if ( this.currentTeam == 0 ) {
        this.currentTeam = this.teams;
      }
    }
  }


  update( dt ) {
    let changed = false;

    // Animate grows first
    for ( let row = 0; row <= BoardSize; row ++ ) {
      for ( let col = 0; col <= BoardSize; col ++ ) {
        const team = this.board[ col ][ row ];
        const piece = this.#pieces[ col ][ row ];

        if ( team > 0 ) {
          piece.team = team;
          changed |= piece.grow( dt );
        }
      }
    }

    // If no more grows, animate shrinks
    if ( !changed ) {
      for ( let row = 0; row <= BoardSize; row ++ ) {
        for ( let col = 0; col <= BoardSize; col ++ ) {
          const team = this.board[ col ][ row ];
          const piece = this.#pieces[ col ][ row ];
          
          if ( team == 0 ) {
            changed |= piece.shrink( dt );
          }
        }
      }
    }

    return changed;
  }

  draw( ctx ) {
    // Board
    ctx.fillStyle = BoardColor;
    ctx.fillRect( 0, 0, 18, 18 );
  
    ctx.fillStyle = 'black';
    ctx.fill( thickGrid );
  
    ctx.strokeStyle = 'black';
    ctx.stroke( grid );
  
    ctx.fillStyle = 'cyan';
    ctx.fill( diamonds );
    ctx.stroke( diamonds );

    // Pieces
    ctx.save();

    for ( let row = 0; row <= BoardSize; row ++ ) {
      ctx.save();

      for ( let col = 0; col <= BoardSize; col ++ ) {
        this.#pieces[ col ][ row ].draw( ctx );

        ctx.translate( 1, 0 );
      }

      ctx.restore();
      
      ctx.translate( 0, 1 );
    }

    ctx.restore();

    // Victory banner
    if ( this.victory ) {
      // ctx.translate( 0, 0.5 );
      
      ctx.fillStyle = '#fffa';
      ctx.fillRect( 0, BoardSize / 2 - 2, BoardSize, 3 );
      // ctx.strokeRect( 0, BoardSize / 2 - 2, BoardSize, 3 );
      
      ctx.translate( BoardSize / 2, BoardSize / 2 );
      
      // Work around small-font issues like https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
      ctx.font = '10px Arial';
      ctx.scale( 0.2, 0.2 );
      
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'center';
      ctx.fillText( this.#victoryText, 0, 0 );
      
      ctx.scale( 0.5, 0.5 );
      ctx.textBaseline = 'top';
      ctx.fillText( this.#victorySubtext, 0, 0 );
    }
  }
}