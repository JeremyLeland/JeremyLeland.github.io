export const NumRanks = 13;
export const NumSuits = 4;

const image = new Image();
image.src = './images/Aisleriot_-_Anglo_playing_cards.svg';
await image.decode();

const imageCardWidth = image.width / NumRanks;
const imageCardHeight = image.height / ( NumSuits + 1 );   // additional line has jokers and card back

export const Width = 0.8;
export const Height = Width * imageCardHeight / imageCardWidth;


// // Rasterize a larger version of SVG to use
const scale = 1;// devicePixelRatio;// * Card.Width / imageCardWidth;
const canvas = new OffscreenCanvas( image.width * scale, image.height * scale );
const ctx = canvas.getContext( '2d' );
ctx.drawImage( image, 0, 0, canvas.width, canvas.height );

const bmp = await createImageBitmap( canvas );

// const bmp = await createImageBitmap( image );

//
// Draw card centered at x,y with scale sx,sy
// (this allows for some cheap flipping)
//

export function draw( ctx, card, x, y, sx = 1, sy = 1 ) {
  const srcCol = card.faceup ? card.rank : 2;
  const srcRow = card.faceup ? card.suit : 4;

  ctx.drawImage(
    // off,
    bmp,

    // source image is HiDPI
    srcCol * scale * imageCardWidth,
    srcRow * scale * imageCardHeight,
    scale * imageCardWidth,
    scale * imageCardHeight,

    // destination is screen location
    x - Width * sx / 2,
    y - Height * sy / 2,
    Width * sx,
    Height * sy,
  );
}
