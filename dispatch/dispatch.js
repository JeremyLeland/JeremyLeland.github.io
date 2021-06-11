class TableDisplay {
  constructor() {
    this.td = {};
  }

  getTableRow() {
    const row = document.createElement('tr');
    for (var e in this.td) { row.appendChild(this.td[e]); }
    return row;
  }

  createTableData(property) {
    this.td[property] = document.createElement('td');
    this.td[property].innerText = this[property];
  }

  makeTableDataContentEditable(property, blurFunction) {
    this.td[property].contentEditable = true;
    this.td[property].addEventListener('focus', () => selectAllText(this.td[property]));
    this.td[property].addEventListener('keydown', (event) => blurOnEnter(event));
    this.td[property].addEventListener('blur', () => {
      this.updatePropertyFromTable(property);
      blurFunction();
    });
  }

  updatePropertyFromTable(property) {
    const newValue = this.td[property].innerText;
    if (this[property] != newValue) {
      logMessage(`${this} changed ${property} from "${this[property]}" to "${newValue}"`);
      this[property] = newValue;
    }
  }
}

class Call extends TableDisplay {
  constructor(id) {
    super();

    this.id = id;
    this.description = "Unknown";
    this.location = "TBD";
    this.startTime = new Date();
    this.teams = new Set();
    this.endTime = null;
    this.disposition = null;
    
    ['id', 'description', 'location', 'startTime', 'teams', 'endTime', 'disposition'].forEach(e => {
      this.createTableData(e);
    });

    this.makeTableDataContentEditable('description', () => this.updateDescription());
    this.makeTableDataContentEditable('location', () => this.updateLocation());

    this.td['startTime'].innerText = getFormattedTime(this.startTime);
    this.td['teams'].innerText = '';

    this.teamSelector = makeCustomSelector('Assign Team...', () => makeTeamSelector(this));
    this.td['teams'].appendChild(this.teamSelector);
  }

  toString() { return `Call ${this.id} (${this.description} @ ${this.location})`; }

  // TODO: use a div with a reference to our div (like team does) and update that way?
  //       instead of changing button text
  updateDescription() {
    teams.filter(t => t.call == this).forEach(t => t.callSelector.firstChild.innerText = this);
  }

  updateLocation() {
    teams.filter(t => t.call == this).forEach(t => t.callSelector.firstChild.innerText = this);
  }

  addTeam(team) {
    this.teams.add(team);
    this.td['teams'].appendChild(team.callTableEntry);
  }

  removeTeam(team) {
    this.teams.delete(team);
    this.td['teams'].removeChild(team.callTableEntry);
  }
}

class Team extends TableDisplay {
  constructor(id) {
    super();

    this.id = id;
    this.name = `Team ${id}`;
    this.status = 'Ready';
    this.call = null;

    this.callTableEntry = document.createElement('div');
    this.callTableEntry.innerText = this.name;

    ['name', 'status', 'call'].forEach(e => { this.createTableData(e); });
    this.makeTableDataContentEditable('name', () => this.updateName());

    this.td['status'].innerText = this.status;

    this.callSelector = makeCustomSelector('Assign Call...', () => makeCallSelector(this));
    this.td['call'].appendChild(this.callSelector);
  }

  toString() { return this.name; }

  updateName() {
    this.callTableEntry.innerText = this.name;
  }

  setStatus(status) {
    this.status = status;
    this.td['status'].innerText = this.status;
  }

  setCall(call) {
    if (this.call != null) {
      this.call.removeTeam(this);
      logMessage(`Reassigning ${this} from ${this.call} to ${call}`)
    }
    else {
      logMessage(`Assigning ${this} to ${call}`);
    }

    this.setStatus('En route');
    this.call = call;
    this.call.addTeam(this);

    this.callSelector.firstChild.innerText = this.call;
  }
}

class Log {
  constructor(message) {
    this.time = new Date();
    this.message = message;
  }
}

const calls = [];
const teams = [];
const logs = [];

var customSelector = null;
document.addEventListener('click', closeCustomSelector);

var nextCallID = 1;
var nextTeamID = 1;

function makeCustomSelector(label, selectorGenerator) {
  const div = document.createElement('div');
  div.setAttribute('class', 'custom-select');
  
  const button = document.createElement('button');
  button.setAttribute('class', 'select-selected');
  button.innerText = label;

  button.addEventListener('click', (event) => {
    if (customSelector == null) {
      event.stopPropagation();
      customSelector = selectorGenerator();
      div.appendChild(customSelector);
    }
  });

  div.appendChild(button);

  return div;
}

function makeTeamSelector(call) {
  const selectItems = document.createElement('div');
  selectItems.setAttribute('class', 'select-items');

  teams.forEach(team => {
    if (team.call != call) {
      const item = document.createElement('div');
      item.innerText = team;
      item.addEventListener('click', () => team.setCall(call));
      selectItems.appendChild(item);
    }
  });
  
  return selectItems;
}

function makeCallSelector(team) {
  const selectItems = document.createElement('div');
  selectItems.setAttribute('class', 'select-items');

  calls.forEach(call => {
    if (team.call != call) {
      const item = document.createElement('div');
      item.innerText = call;
      item.addEventListener('click', () => team.setCall(call));
      selectItems.appendChild(item);
    }
  });
  
  return selectItems;
}


//
// Actions
//

function newCall() {
  const call = new Call(nextCallID++);
  calls.push(call);

  document.getElementById('call_table').appendChild(call.getTableRow());
  call.td['description'].focus();

  logMessage(`Created ${call}`);
}

function newTeam() {
  const team = new Team(nextTeamID++);
  teams.push(team);

  document.getElementById('team_table').appendChild(team.getTableRow());
  team.td['name'].focus();

  logMessage(`Created ${team}`);
}

//
// Util
//

function logMessage(message) {
  const log = new Log(message);
  logs.push(log);
  console.log(`${getFormattedTime(log.time)}: ${log.message}`);
}

function getFormattedTime(time) {
  const parts = [time.getHours(), time.getMinutes()];
  return parts.map(e => e.toString().padStart(2, '0')).join(':');
}

function selectAllText(element) {
  const s = window.getSelection();
  const r = document.createRange();
  r.selectNodeContents(element);
  s.removeAllRanges();
  s.addRange(r);
}

function blurOnEnter(event) {
  if (event.keyCode == 13) { 
    event.target.blur();
  }
}

function closeCustomSelector() {
  if (customSelector != null) {
    customSelector.parentElement.removeChild(customSelector);
    customSelector = null;
  }
}