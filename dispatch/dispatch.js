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
  Clinic: 'Brought to Clinic',
  Transported: 'Transported from Scene',
  Treated: 'Treated in Field',
  Refused: 'Refused Treatment',
  NoMedicalMerit: 'No Medical Merit',
  UnableToLocate: 'Unable to Locate',
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

    this.teamSelector = makeCustomSelector('Assign Team...', () => this.makeTeamSelector());
    this.td['teams'].appendChild(this.teamSelector);

    this.dispositionSelector = makeCustomSelector('Active', () => this.makeDispositionSelector());
    this.td['disposition'].appendChild(this.dispositionSelector);
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

    const crossedOutEntry = document.createElement('div');
    crossedOutEntry.innerText = team.callTableEntry.innerText;
    crossedOutEntry.setAttribute('class', 'closed');

    this.teamList.replaceChild(crossedOutEntry, team.callTableEntry);
  }

  setDisposition(disposition) {
    this.disposition = disposition;

    this.teams.forEach(team => team.clearCall(null));

    this.teamSelector = null;
    this.td['teams'].lastChild.innerText = '';

    this.dispositionSelector = null;
    this.td['disposition'].innerText = this.disposition;

    this.td['disposition'].parentElement.setAttribute('class', 'closed');

    this.setEndTime(new Date());

    logMessage(`Closing ${this} with disposition: ${this.disposition}`);
  }

  setEndTime(endTime) {
    this.endTime = endTime;
    this.td['endTime'].innerText = getFormattedTime(this.endTime);
  }

  makeTeamSelector() {
    const selectItems = document.createElement('div');
    selectItems.setAttribute('class', 'select-items');
  
    teams.filter(team => team.call != this).forEach(team => {
      const item = document.createElement('div');
      item.innerText = team;
      item.addEventListener('click', () => team.assignCall(this));
      selectItems.appendChild(item);
    });
    
    return selectItems;
  }

  makeDispositionSelector() {
    const selectItems = document.createElement('div');
    selectItems.setAttribute('class', 'select-items');
  
    for (var d in Disposition) {
      const disposition = Disposition[d];
      const item = document.createElement('div');
      item.innerText = disposition;
      item.addEventListener('click', () => this.setDisposition(disposition));
      selectItems.appendChild(item);
    }
    
    return selectItems;
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

    this.statusSelector = makeCustomSelector(this.status, () => this.makeStatusSelector());
    this.td['status'].appendChild(this.statusSelector);

    this.callSelector = makeCustomSelector('Assign Call...', () => this.makeCallSelector());
    this.td['call'].appendChild(this.callSelector);
  }

  toString() { return this.name; }

  updateName() {
    this.callTableEntry.firstChild.innerText = this.name;
  }

  assignCall(call) {
    this.setCall(call);
    this.setStatus(Status.Assigned);
  }

  clearCall() {
    this.setCall(null);
    this.setStatus(Status.Ready);
  }

  setStatus(status) {
    this.status = status;

    this.callTableEntry.lastChild.innerText = ` (${this.status} @ ${getFormattedTime(new Date())})`;

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
      this.call.addTeam(this);
      this.callSelector.firstChild.innerText = this.call;
    }
    else {
      this.callSelector.firstChild.innerText = 'Assign Call...';
    }
  }

  makeStatusSelector() {
    const selectItems = document.createElement('div');
    selectItems.setAttribute('class', 'select-items');
  
    const statuses = this.call == null ? [Status.Ready, Status.Busy] : 
      [Status.EnRoute, Status.OnScene, Status.Ready, Status.Busy];
  
    statuses.filter(status => this.status != status).forEach(status => {
      const item = document.createElement('div');
      item.innerText = status;
      item.addEventListener('click', () => {
        if (status == Status.Ready || status == Status.Busy) {
          this.setCall(null);
        }

        this.setStatus(status);
      });
      selectItems.appendChild(item);
    });
    
    return selectItems;
  }
  
  makeCallSelector() {
    const selectItems = document.createElement('div');
    selectItems.setAttribute('class', 'select-items');
  
    calls.filter(call => this.call != call && call.disposition == null).forEach(call => {
      const item = document.createElement('div');
      item.innerText = call;
      item.addEventListener('click', () => this.assignCall(call));
      selectItems.appendChild(item);
    });
    
    return selectItems;
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
    if (customSelector.parentElement != null) {
      customSelector.parentElement.removeChild(customSelector);
    }
    customSelector = null;
  }
}