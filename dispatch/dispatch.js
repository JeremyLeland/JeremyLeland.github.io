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

  toString() { return `Call ${this.id}: "${this.description}" @ ${this.location}`; }
}

class Team extends TableDisplay {
  constructor(id) {
    super();

    this.id = id;
    this.name = `Team ${id}`;
    this.status = 'Ready';

    ['name', 'status'].forEach(e => {
      this.createTableData(e);
    });

    this.makeTableDataContentEditable('name');
  }

  toString() { return this.name; }

  // UI elements IDs
  nameElementID() { return `team_${this.id}_name`; }
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

var nextCallID = 1;
var nextTeamID = 1;

//
// Call Table
//

function getAssignSelectorHTML(call) {
  return `<select onchange='assignTeam(this.value, ${call.id})'>
    <option selected disabled hidden>Assign Team</option>
    ${teams.map(t => getAssignOptionHTML(t)).join('')}
  </select>`;
}

function getAssignOptionHTML(team) {
  return `<option
    value="${team.id}"
    class="${team.status == 'Ready' ? 'bold' : 'italic'}"
  >${team}</option>`;
}

//
// Team Table
//

function getTeamTableHTML() {
  return `<table>
    <tr>
      <th>Team</th>
      <th>Status</th>
    </tr>
  ${teams.map(team => `
    <tr>
      <td id="${team.nameElementID()}"
        ${editableTemplate}
        onblur='setTeamName(${team.id}, this.innerText)'
        class="${team.status == 'Ready' ? 'ready' : 'busy'}">${team.name}</td>
      <td>${getStatusSelectorHTML(team)}</td>
    </tr>
  `).join('')}
  </table>`;
}

function getStatusSelectorHTML(team) {
  var statuses = ['Ready', ...calls, 'Busy'];

  return `<select onchange='setTeamStatus(${team.id}, this.value)'>
    ${statuses.map(s => getStatusOptionHTML(team, s)).join('')}
  </select>`;
}

function getStatusOptionHTML(team, status) {
  const statusVal = status instanceof Call ? status.id : status;

  return `<option
    ${team.status == statusVal ? ' selected disabled hidden ' : ''}
    value="${statusVal}"
    ${status instanceof Call ? `class="${status.teams.size == 0 ? 'bold' : 'italic'}` : ''}"
  >${status}</option>`;
}

//
// Logs
//

function getLogTableHTML() {
  return `<table>
    <tr>
      <th>Time</th>
      <th>Message</th>
    </tr>
  ${logs.map(log => `
    <tr>
      <td>${getFormattedTime(log.time)}</td>
      <td>${log.message}</td>
    </tr>
  `).join('')}
  </table>`;
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

function assignTeam(teamID, callID) {
  setTeamStatus(teamID, callID);
}

function newTeam() {
  const team = new Team(nextTeamID++);
  teams.push(team);

  document.getElementById('team_table').appendChild(team.getTableRow());
  team.td['name'].focus();

  logMessage(`Created ${team}`);
}

function setTeamName(teamID, name) {
  const team = teamFromID(teamID);
  const oldName = team.name;

  if (oldName != name) {
    team.name = name;
    logMessage(`${oldName} changed name to ${name}`);
    updateDisplay();
  }

  window.getSelection().removeAllRanges();
}

function setTeamStatus(teamID, status) {
  const team = teamFromID(teamID);
  team.status = status;

  const currentCall = calls.find(c => c.teams.has(team));
  if (currentCall) {
    currentCall.teams.delete(team);
  }

  if (status != 'Ready' && status != 'Busy') {
    const call = callFromID(status);

    if (call) {
      call.teams.add(team);

      if (currentCall) {
        logMessage(`Reassigning ${team} from ${currentCall} to ${call}`);
      }
      else {
        logMessage(`Assigning ${team} to ${call}`);
      }
    }
  }
  else {
    logMessage(`${teamFromID(teamID)} is now ${status}`);
  }

  updateDisplay();
}

//
// Util
//

function teamFromID(teamID) {
  return teams.find(t => t.id == teamID);
}

function callFromID(callID) {
  return calls.find(c => c.id == callID);
}

function logMessage(message) {
  const log = new Log(message);
  logs.push(log);
  console.log(`${getFormattedTime(log.time)}: ${log.message}`);
}

function updateDisplay() {
  document.getElementById('team_table').innerHTML = getTeamTableHTML();
  document.getElementById('call_table').innerHTML = getCallTableHTML();
  document.getElementById('log_table').innerHTML = getLogTableHTML();
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