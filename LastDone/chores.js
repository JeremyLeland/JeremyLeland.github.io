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

const table = document.getElementById( 'table' );

function update() {
  table.innerHTML = getInnerHtml( items );
  saveState( items );
}
update();

table.addEventListener( 'change', e => {
  if ( e.target.tagName == 'INPUT' ) {
    items[ e.target.dataset.id ].lastDone = e.target.value;
    update();
  }
} );

table.addEventListener( 'focusout', e => {
  if ( e.target.tagName == 'TD' ) {
    items[ e.target.dataset.id ].label = e.target.innerText;
    update();
  }
} );

//
// Other UI
//

const buttonActions = {
  'new': () => {
    items[ crypto.randomUUID() ] = {};
    update();
  },
  'clear': () => {
    items = {};
    update();
  },
  'import': () => {
    const parsed = JSON.parse( prompt() );
    if ( parsed ) {
      items = parsed;
      update();
    }
    else {
      // TODO: warn about invalid input? try again?
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
  let html = '<thead><tr><th>When</th><th>What</th></tr></thead>';

  html += '<tbody>';

  // Sort by date (oldest first, with "never" at top)
  const sorted = Object.entries( items ).sort( ( [ , a ], [ , b ] ) => a.lastDone ? b.lastDone ? a.lastDone.localeCompare( b.lastDone ) : 1 : -1 );

  sorted.forEach( ( [ id, item ] ) => {
    html += `<tr><td><input type="date" style="background: ${ getColorForDate( item.lastDone ) }" value="${ item.lastDone }" data-id="${ id }"></td>`;

    html += `<td contenteditable data-id="${ id }">${ item.label }</td></tr>`;
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