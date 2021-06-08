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

  makeTableDataContentEditable(property) {
    this.td[property].contentEditable = true;
    this.td[property].addEventListener('focus', () => selectAllText(this.td[property]));
    this.td[property].addEventListener('keydown', (event) => blurOnEnter(event));
    this.td[property].addEventListener('blur', () => this.updatePropertyFromTable(property));
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

    ['description', 'location'].forEach(e => {
      this.makeTableDataContentEditable(e);
    });

    this.td['startTime'].innerText = getFormattedTime(this.startTime);
  }

  toString() { return `Call ${this.id} (${this.description} @ ${this.location})`; }
}

class Team extends TableDisplay {
  constructor(id) {
    super();

    this.id = id;
    this.name = `Team ${id}`;
    this.status = 'Ready';

    ['name', 'status'].forEach(e => { this.createTableData(e); });
    this.makeTableDataContentEditable('name');

    this.td['status'].innerText = '';

    this.statusDiv = document.createElement('div');
    this.statusDiv.setAttribute('class', 'custom-select');

    this.statusButton = document.createElement('div');
    this.statusButton.setAttribute('class', 'select-selected');
    this.statusButton.innerText = this.status;
    this.statusButton.addEventListener('click', (event) => {
      if (customSelector == null) {
        event.stopPropagation();
        customSelector = getStatusSelectorDiv(this);
        this.statusDiv.appendChild(customSelector);
      }
    });

    this.statusDiv.appendChild(this.statusButton);

    //this.td['status'].removeChild(this.td['status'].childNodes[0]);
    this.td['status'].appendChild(this.statusDiv);
  }

  toString() { return this.name; }

  setStatus(status) {
    if (this.status instanceof Call) {
      this.status.teams.delete(this);
      logMessage(`Reassigning ${this} from ${this.status} to ${status}`)
    }
    else {
      logMessage(`Assigning ${this} to ${status}`);
    }

    this.status = status;
    this.statusButton.innerText = this.status;

    if (this.status instanceof Call) {
      this.status.teams.add(this);
    }
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

//
// Call Table
//

//
// Team Table
//

function getStatusSelectorDiv(team) {
  const selectItems = document.createElement('div');
  selectItems.setAttribute('class', 'select-items');

  const statuses = ['Ready', ...calls, 'Busy'];
  
  statuses.forEach(status => {
    if (team.status != status) {
      const item = document.createElement('div');
      item.innerText = status;
      item.addEventListener('click', () => {
        team.setStatus(status);
        closeCustomSelector();
      });
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