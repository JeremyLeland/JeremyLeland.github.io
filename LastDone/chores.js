//
// State
//
const StateKey = 'lastDone_chores';

function loadState() {
  return JSON.parse( localStorage.getItem( StateKey ) );
}

function saveState( state ) {
  localStorage.setItem( StateKey, JSON.stringify( state ) );
}

//
// Table
//
let items = loadState() ?? {};

function newItem() {
  // use Date.now() for unique keys
  //   - crypto.randomUUID() requires secure context, made iOS testing harder
  // start with empty text so we can just start typing after click/tap
  //   - don't need to highlight 'undefined' or 'new' first, which is awkward on mobile
  items[ Date.now() ] = { label: '' };
}

const table = document.getElementById( 'table' );

function itemsUpdated() {
  table.innerHTML = getInnerHtml( items );
  saveState( items );
}
itemsUpdated();

table.addEventListener( 'change', e => {
  if ( e.target.tagName == 'INPUT' ) {
    const id = e.target.parentElement.parentElement.dataset.id;   // get from <tr>
    items[ id ].lastDone = e.target.value;
    itemsUpdated();
  }
} );

table.addEventListener( 'focusout', e => {
  if ( e.target.tagName == 'TD' ) {
    const id = e.target.parentElement.dataset.id;   // get from <tr>
    items[ id ].label = e.target.innerText;
    itemsUpdated();
  }
} );

table.addEventListener( 'click', e => {
  if ( e.target.tagName == 'BUTTON' ) {
    const id = e.target.parentElement.parentElement.dataset.id;   // get from <tr>
    delete items[ id ];
    itemsUpdated();
  }
})

//
// Other UI
//

const buttonActions = {
  'new': () => {
    newItem();
    itemsUpdated();
  },
  'clear': () => {
    items = {};
    itemsUpdated();
  },
  'import': () => {
    const parsed = JSON.parse( prompt() );
    if ( parsed ) {
      items = parsed;
      itemsUpdated();
    }
    else {
      console.warn( 'Invalid import, ignoring' );
      // TODO: warn user about invalid input? try again?
    }
  },
  'export': () => {
    alert( JSON.stringify( items ) );
  }
}

for ( const id in buttonActions ) {
  document.getElementById( id ).addEventListener( 'click', buttonActions[ id ] );
}

//
// Build table from items
//
function getInnerHtml( items ) {
  let html = '<thead><tr><th>When</th><th style="min-width: 150px;">What</th></tr></thead>';

  html += '<tbody>';

  // Sort by date (oldest first, with "never" at top)
  const sorted = Object.entries( items ).sort( ( [ , a ], [ , b ] ) => a.lastDone ? b.lastDone ? a.lastDone.localeCompare( b.lastDone ) : 1 : -1 );

  sorted.forEach( ( [ id, item ] ) => {
    html += `<tr data-id="${ id }"><td><input type="date" style="background: ${ getColorForDate( item.lastDone ) }" value="${ item.lastDone }"></td>`;

    html += `<td contenteditable>${ item.label }</td><td><button>❌</button></td></tr>`;
  } );

  html += '</tbody>';

  return html;
}

function getColorForDate( date ) {
  if ( date ) {
    const lastDone = new Date( date );
    const MillisecondPerDay = 1000 * 60 * 60 * 24;
    const daysAgo = ( Date.now() - lastDone ) / MillisecondPerDay;

    const red = Math.min( 256, 7 * daysAgo );
    const green = 7 * 256 / Math.max( 0.01, daysAgo );

    return `rgb( ${ red }, ${ green }, 0 )`;
  }
  else {
    return 'red';
  }
}