class TableDisplay {
  constructor() {
    this.td = {};
  }

  getTableRow() {
    const row = document.createElement('tr');
    for (var e in this.td) { row.appendChild(this.td[e]); }
    return row;
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

const Status = {
  Ready: 'Ready',
  Assigned: 'Assigned',
  EnRoute: 'En Route',
  OnScene: 'On Scene',
  Busy: 'Busy'
}

const Disposition = {
  Clinic: 'Clinic',
  Treated: 'Treated',
  Refused: 'Refused',
  NoMedicalMerit: 'No Medical Merit',
  UnableToLocate: 'Unable to Locate',
  Transported: 'Transported',
  Cancelled: 'Cancelled'
}

class Call extends TableDisplay {
  constructor(id) {
    super();

    this.id = id;
    this.description = "Unknown";
    this.location = "TBD";
    this.startTime = new Date();
    this.enrouteTimes = [];
    this.onsceneTimes = [];
    this.clearedTimes = [];
    this.teams = new Set();
    this.endTime = null;
    this.disposition = null;

    this.teamTableEntry = document.createElement('div');
    this.teamTableEntry.innerText = this.toString();
    
    ['id', 'description', 'location', 'startTime', 'teams', 'disposition', 'endTime'].forEach(e => {
      this.td[e] = document.createElement('td');
    });

    this.td['id'].innerText = this.id;
    this.td['description'].innerText = this.description;
    this.td['location'].innerText = this.location;

    this.makeTableDataContentEditable('description', () => this.updateDescription());
    this.makeTableDataContentEditable('location', () => this.updateLocation());

    this.td['startTime'].innerText = getFormattedTime(this.startTime);
    this.td['teams'].innerText = '';

    this.teamList = document.createElement('div');
    this.td['teams'].appendChild(this.teamList);

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
    this.teamList.appendChild(team.callTableEntry);
  }

  removeTeam(team) {
    this.teams.delete(team);
    this.teamList.removeChild(team.callTableEntry);
  }
}

class Team extends TableDisplay {
  constructor(id) {
    super();

    this.id = id;
    this.name = `Team ${id}`;
    this.status = Status.Ready;
    this.call = null;

    this.callTableEntry = document.createElement('div');
    this.callTableEntry.appendChild(document.createElement('span'));  // name
    this.callTableEntry.appendChild(document.createElement('span'));  // status

    ['name', 'status', 'call'].forEach(e => { this.td[e] = document.createElement('td'); });
    this.td['name'].innerText = this.name;
    this.td['name'].setAttribute('class', this.status);
    this.makeTableDataContentEditable('name', () => this.updateName());

    this.statusSelector = makeCustomSelector(this.status, () => makeStatusSelector(this));
    this.td['status'].appendChild(this.statusSelector);

    this.callSelector = makeCustomSelector('Assign Call...', () => makeCallSelector(this));
    this.td['call'].appendChild(this.callSelector);
  }

  toString() { return this.name; }

  updateName() {
    this.callTableEntry.firstChild.innerText = this.name;
  }

  setStatus(status) {
    this.status = status;

    if (this.status == Status.Ready || this.status == Status.Busy) {
      this.setCall(null);
    }
    else {
      this.callTableEntry.lastChild.innerText = ` (${this.status} @ ${getFormattedTime(new Date())})`;
    }

    this.td['name'].setAttribute('class', this.status.replace(' ', '-'));
    this.statusSelector.firstChild.innerText = this.status;
  }

  setCall(call) {
    if (this.call != null) {
      this.call.removeTeam(this);

      if (call != null) {
        logMessage(`Reassigning ${this} from ${this.call} to ${call}`);
      }
      else {
        logMessage(`Clearing ${this} from ${this.call}`);
      }
    }
    else {
      logMessage(`Assigning ${this} to ${call}`);
    }

    this.call = call;

    if (this.call != null) {
      this.setStatus(Status.Assigned);
      this.call.addTeam(this);
      this.callSelector.firstChild.innerText = this.call;
    }
    else {
      this.callSelector.firstChild.innerText = 'Assign Call...';
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

function makeStatusSelector(team) {
  const selectItems = document.createElement('div');
  selectItems.setAttribute('class', 'select-items');

  const statuses = team.call == null ? [Status.Ready, Status.Busy] : 
    [Status.EnRoute, Status.OnScene, Status.Ready, Status.Busy];

  statuses.filter(status => team.status != status).forEach(status => {
    const item = document.createElement('div');
    item.innerText = status;
    item.addEventListener('click', () => team.setStatus(status));
    selectItems.appendChild(item);
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