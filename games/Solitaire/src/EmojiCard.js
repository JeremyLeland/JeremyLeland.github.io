export const Width = 150;
export const Height = 1.5 * Width;

export const Rank = {
  Ace:    0,
  Two:    1,
  Three:  2,
  Four:   3,
  Five:   4,
  Six:    5,
  Seven:  6,
  Eight:  7,
  Nine:   8,
  Ten:    9,
  Jack:   10,
  Queen:  11,
  King:   12,
};

const RankLabels = [ 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K' ];

export const NumRanks = RankLabels.length;

// English alphabetical order, for now
export const Suit = {
  Clubs:     0,
  Diamonds:  1,
  Hearts:    2,
  Spades:    3,
};

const SuitIcons = [ '♣️', '♦️', '♥️', '♠️' ];

export const NumSuits = SuitIcons.length;

const FontSize = Width / 5;

const FaceIcons = [
  [ '🧛🏻‍♂️', '🧛🏼‍♂️', '🧛🏽‍♂️', '🧛🏿‍♂️' ],   // Jack
  [ '👸🏻', '👸🏼', '👸🏽', '👸🏿' ],   // Queen
  [ '🤴🏻', '🤴🏼', '🤴🏽', '🤴🏿' ],   // King
];

const Positions = generatePositions();

export function draw( ctx, rank, suit ) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect( 0, 0, Width, Height, 10 );
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = suit == Suit.Clubs || suit == Suit.Spades ? 'black' : 'red';
  ctx.font = `${ FontSize }px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const rankLabel = RankLabels[ rank ];
  const suitIcon = SuitIcons[ suit ];
  
  ctx.save(); {
    ctx.translate( FontSize / 2, FontSize );
    ctx.fillText( rankLabel, 0, 0 );
    ctx.translate( 0, 0.75 * FontSize );
    ctx.scale( 0.5, 0.5 );
    ctx.fillText( suitIcon, 0, 0 );
  }
  ctx.restore();

  ctx.save(); {
    ctx.translate( Width - FontSize / 2, Height - FontSize );
    ctx.rotate( Math.PI );
    ctx.fillText( rankLabel, 0, 0 );
    ctx.translate( 0, 0.75 * FontSize );
    ctx.scale( 0.5, 0.5 );
    ctx.fillText( suitIcon, 0, 0 );
  }
  ctx.restore();

  Positions[ rank ].forEach( pos => {
    ctx.save(); {
      ctx.translate( Width * pos[ 0 ], Height * pos[ 1 ] );
      
      // Flip lower icons
      if ( pos[ 1 ] > 0.5 ) {
        ctx.rotate( Math.PI );
      }

      // Make Aces bigger
      if ( rank == Rank.Ace ) {
        ctx.scale( 1.5, 1.5 );
      }

      if ( rank > Rank.Ten ) {
        ctx.scale( 2.5, 2.5 );
      }

      const icon = rank > Rank.Ten ? FaceIcons[ rank - Rank.Jack ][ suit ] : suitIcon;
      ctx.fillText( icon, 0, 0 );
    }
    ctx.restore();
  } );
}

function generatePositions() {
  const Ace = [
    [ 0.5, 0.5 ],
  ];

  const Two = [
    [ 0.5, 0.25 ],
    [ 0.5, 0.75 ],
  ];

  const Three = Two.concat( Ace );

  const Four = [
    [ 0.3, 0.25 ],
    [ 0.7, 0.25 ],
    [ 0.3, 0.75 ],
    [ 0.7, 0.75 ],
  ];

  const Five = Four.concat( Ace );
 
  const Six = Four.concat(
    [
      [ 0.3, 0.5 ],
      [ 0.7, 0.5 ],
    ]
  );
  
  const Seven = Six.concat(
    [
      [ 0.5, 0.375 ],
    ]
  );

  const Eight = Seven.concat(
    [
      [ 0.5, 0.625 ],
    ]
  );

  const ColsOf4 = Four.concat(
    [
      [ 0.3, 0.425 ],
      [ 0.7, 0.425 ],
      [ 0.3, 0.575 ],
      [ 0.7, 0.575 ],
    ]
  );

  const Nine = ColsOf4.concat( Ace );

  const Ten = ColsOf4.concat(
    [
      [ 0.5, 0.35 ],
      [ 0.5, 0.65 ],
    ]
  );

  const Face = [
    [ 0.5, 0.3 ],
    [ 0.5, 0.7 ],
  ];

  const Jack = Face;
  const Queen = Face;
  const King = Face;

  return [ Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King ];
}