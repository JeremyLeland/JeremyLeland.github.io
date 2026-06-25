import * as Card from './SVGCard.js'

import { GameCanvas } from './common/GameCanvas.js';
import { GameState } from './common/GameState.js';


const Gap = Card.Width / 6;
// const HorizSpacing = Card.Width + Gap;
const VertSpacing = Card.Height + Gap;

const WasteOffset = { x: 0.2, y: 0 };
const TableauOffset = { x: 0, y: 0.25 };

// https://en.wikipedia.org/wiki/Klondike_(solitaire)#Rules
const Positions = {
  Stock: { x: 0, y: 0 },
  Waste: { x: 1, y: 0 },
  Foundations: [ 3, 4, 5, 6 ].map( i => ( { x: i, y: 0 } ) ),
  Tableaus: [ 0, 1, 2, 3, 4, 5, 6 ].map( i => ( { x: i, y: VertSpacing } ) ),
}


let active;

const gameState = new GameState( 'cards_solitaire_main' );

if ( !gameState.board ) {
  gameState.board = newBoard();
}

function newBoard() {
  const board = {
    stock: [],
    waste: [],
    foundations: Array.from( Array( 4 ), _ => [] ),
    tableaus:    Array.from( Array( 7 ), _ => [] ),
    victory: false,
  };

  // Add all possible cards to stock, then shuffle
  for ( let suit = 0; suit < Card.NumSuits; suit ++ ) {
    for ( let rank = 0; rank < Card.NumRanks; rank ++ ) {
      board.stock.push( {
        rank: rank,
        suit: suit,
        faceup: false,
      } );
    }
  }

  shuffle( board.stock );

  // Deal out tableaus
  for ( let t = 0; t < 7; t ++ ) {
    for ( let i = 0; i <= t; i ++ ) {
      board.tableaus[ t ].push( board.stock.pop() );
    }
    board.tableaus[ t ].at( -1 ).faceup = true;
  }

  return board;
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle( array ) {
  for ( let i = array.length - 1; i > 0; i -- ) {
    const j = Math.floor( Math.random() * ( i + 1 ) );
    [ array[ i ], array[ j ] ] = [ array[ j ], array[ i ] ];
  }

  return array;
}

const bounds = [
  -0.5,
  -0.7,
  Positions.Tableaus.length - 0.5,
  VertSpacing + TableauOffset.y * Card.NumRanks
];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = bounds;
gameCanvas.backgroundColor = '#123';
gameCanvas.centerVertically = false;    // looks better with cards at top of screen

gameCanvas.draw = ( ctx ) => {
  if ( gameState.board.stock.length > 0 ) {
    Card.draw( ctx, gameState.board.stock.at( -1 ), 0, 0 );
  }
  else {
    drawCardOutline( ctx, Positions.Stock.x, Positions.Stock.y );
  }

  // Draw the top 3 cards of the waste (or as many as we have)
  drawCardOutline( ctx, Positions.Waste.x, Positions.Waste.y );

  if ( gameState.board.waste.length > 0 ) {
    const wasteStartIndex = Math.max( 0, gameState.board.waste.length - 3 );
    const wasteDrawSize = Math.min( 3, gameState.board.waste.length );

    for ( let cIndex = 0; cIndex < wasteDrawSize; cIndex ++ ) {
      const wasteCardIndex = wasteStartIndex + cIndex;

      if ( gameState.board.waste == active?.oldStack && wasteCardIndex == active.oldStartIndex ) {
        break;
      }

      Card.draw(
        ctx,
        gameState.board.waste[ wasteCardIndex ],
        Positions.Waste.x + WasteOffset.x * cIndex,
        Positions.Waste.y
      );
    }
  }

  gameState.board.foundations.forEach( ( foundation, fIndex ) => {
    drawCardOutline( ctx, Positions.Foundations[ fIndex ].x, Positions.Foundations[ fIndex ].y );

    // just draw top card
    if ( foundation.length > 0 ) {
      const topCard = foundation == active?.oldStack ? foundation.at( -2 ) : foundation.at( -1 );

      if ( topCard ) {
        Card.draw(
          ctx,
          topCard,
          Positions.Foundations[ fIndex ].x,
          Positions.Foundations[ fIndex ].y,
        );
      }
    }
  } );

  gameState.board.tableaus.forEach( ( tableau, tIndex ) => {
    for ( let cIndex = 0; cIndex < tableau.length; cIndex ++ ) {
      if ( tableau == active?.oldStack && cIndex == active.oldStartIndex ) {
        break;
      }

      Card.draw(
        ctx,
        tableau[ cIndex ],
        Positions.Tableaus[ tIndex ].x,
        Positions.Tableaus[ tIndex ].y + TableauOffset.y * cIndex,
      );
    }
  } );

  if ( active ) {
    for ( let cIndex = active.oldStartIndex; cIndex < active.oldStack.length; cIndex ++ ) {
      Card.draw(
        ctx,
        active.oldStack[ cIndex ],
        active.pos.x,
        active.pos.y + TableauOffset.y * ( cIndex - active.oldStartIndex )
      );
    }
  }

  // Firefox needs text to be "bigger"
  ctx.scale( 0.1, 0.1 );

  if ( gameState.board.victory ) {
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 8;
    ctx.fillText( 'Victory!', 30, 15 );

    ctx.font = '2px Arial';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText( 'Click to Continue', 30, 22 );

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

function drawCardOutline( ctx, x, y ) {
  ctx.beginPath();
  ctx.roundRect( x - Card.Width / 2, y - Card.Height / 2, Card.Width, Card.Height, Card.Width / 15 );
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Card.Width / 40;
  ctx.stroke();
}

gameCanvas.redraw();


//
// Input
//

function newGame() {
  gameState.board = newBoard();
  gameCanvas.redraw();
}

gameCanvas.pointerDown = ( m ) => {
  if ( gameState.board.victory ) {
    newGame();
    return;
  }

  // Stock
  if ( Math.abs( m.x - Positions.Stock.x ) <= Card.Width / 2 && Math.abs( m.y - Positions.Stock.y ) <= Card.Height / 2 ) {
    if ( gameState.board.stock.length > 0 ) {
      for ( let i = 0; i < 3; i ++ ) {
        const card = gameState.board.stock.pop();

        if ( !card ) {
          break;
        }

        card.faceup = true;
        gameState.board.waste.push( card );

        // TODO: Some sort of "turn" animation here? maybe faceup has a timer for turn progress?
      }
    }
    else {
      while ( gameState.board.waste.length > 0 ) {
        const card = gameState.board.waste.pop();
        card.faceup = false;
        gameState.board.stock.push( card );
      }
    }
  }

  // Waste
  // TODO: Elegent way to avoid copying this below?
  // act on array of [ 'waste', 'tableau' ] and iterate into positions based on this?
  if ( gameState.board.waste.length > 0 ) {
    const x = Positions.Waste.x + WasteOffset.x * Math.min( 2, gameState.board.waste.length - 1 );
    const y = Positions.Waste.y;

    if ( Math.abs( m.x - x ) <= Card.Width / 2 && Math.abs( m.y - y ) <= Card.Height / 2 ) {
      active = {
        oldStack: gameState.board.waste,
        oldStartIndex: gameState.board.waste.length - 1,
        newStack: null,
        pos: { x: x, y: y },
      }
    }
  }

  // Foundation
  gameState.board.foundations.find( ( foundation, fIndex ) => {
    const x = Positions.Foundations[ fIndex ].x;
    const y = Positions.Foundations[ fIndex ].y

     if ( Math.abs( m.x - x ) <= Card.Width / 2 && Math.abs( m.y - y ) <= Card.Height / 2 ) {
      active = {
        oldStack: foundation,
        oldStartIndex: foundation.length - 1,
        newStack: null,
        pos: { x: x, y: y },
      }

      return true;
    };

    return false;
  } );

  // Tableau
  gameState.board.tableaus.find( ( tableau, tIndex ) => {

    // Start with top-most cards so we don't accidently match something lower down the stack
    for ( let cIndex = tableau.length - 1; cIndex >= 0; cIndex -- ) {
      if ( !tableau[ cIndex ].faceup ) {
        break;
      }

      // TODO: Use the values from Positions instead?
      const x = Positions.Tableaus[ tIndex ].x;
      const y = Positions.Tableaus[ tIndex ].y + TableauOffset.y * cIndex;

      if ( Math.abs( m.x - x ) <= Card.Width / 2 && Math.abs( m.y - y ) <= Card.Height / 2 ) {
        active = {
          oldStack: tableau,
          oldStartIndex: cIndex,
          newStack: null,
          pos: { x: x, y: y },
        }

        // break;
        return true;
      };
    }

    return false;
  } );

  gameCanvas.redraw();
};

function validateMove() {
  if ( !active ) {
    return false;
  }

  if ( !active.newStack || active.oldStack == active.newStack ) {
    return false;
  }

  const card = active.oldStack[ active.oldStartIndex ];

  // Foundation
  if ( gameState.board.foundations.indexOf( active.newStack ) != -1 ) {

    // Can only put move one card at a time in foundation
    // (stacks are always decreasing and alternate suits, so can never be valid)
    if ( active.oldStartIndex < active.oldStack.length - 1 ) {
      return false;
    }

    if ( active.newStack.length != card.rank ) {
      return false;
    }

    if ( active.newStack.length > 0 && card.suit != active.newStack[ 0 ].suit ) {
      return false;
    }
  }

  // Tableau
  else if ( gameState.board.tableaus.indexOf( active.newStack ) != -1 ) {

    // New tableau must start with King
    if ( active.newStack.length == 0 ) {
      if ( card.rank != 12 ) {
        return false;
      }
    }

    // Next tableau card must be previous rank and opposite suit color
    else {
      const prevCard = active.newStack.at( -1 );

      if ( card.rank != prevCard.rank - 1 ) {
        return false;
      }

      // If we are Club or Spade, previous card can't be Club or Spade
      if ( ( card.suit == 0 || card.suit == 3 ) == ( prevCard.suit == 0 || prevCard.suit == 3 ) ) {
        return false;
      }
    }
  }

  return true;
}

gameCanvas.pointerUp = _ => {
  if ( validateMove() ) {
    // Move card from old stack to new stack
    active.newStack.splice( active.newStack.length, 0, ...active.oldStack.splice( active.oldStartIndex ) );

    // Flip new top card of tableau
    if ( active.oldStack.length > 0 ) {
      active.oldStack.at( -1 ).faceup = true;
    }

    // Check for victory
    gameState.board.victory = gameState.board.foundations.every( e => e.length == Card.NumRanks );
  }

  active = null;

  gameCanvas.redraw();
};

gameCanvas.pointerMove = ( m ) => {
  if ( active && m.buttons == 1 ) {
    active.pos.x += m.dx;
    active.pos.y += m.dy;

    active.newStack = gameState.board.foundations.find ( ( foundation, fIndex ) => {
      const x = Positions.Foundations[ fIndex ].x;
      const y = Positions.Foundations[ fIndex ].y;

      return Math.abs( m.x - x ) <= Card.Width / 2 && Math.abs( m.y - y ) <= Card.Height / 2;
    } ) ?? gameState.board.tableaus.find( ( tableau, tIndex ) => {
      const x = Positions.Tableaus[ tIndex ].x;
      const y = Positions.Tableaus[ tIndex ].y + TableauOffset.y * ( tableau.length - 1 );

      return Math.abs( m.x - x ) <= Card.Width / 2 && Math.abs( m.y - y ) <= Card.Height / 2;
    } );

    gameCanvas.redraw();
  }
};

document.addEventListener( 'keydown', e => {
  if ( e.key == 'n' ) {
    newGame();
  }
} );