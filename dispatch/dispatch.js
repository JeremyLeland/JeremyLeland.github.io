class Call {
  constructor(id, description, location) {
    this.id = id;
    this.description = description;
    this.location = location;
    this.startTime = new Date();
    this.teams = new Set();
    this.endTime = null;
    this.disposition = null;
  }

  toString() {
    return `Call ${this.id}`;
  }
}

class Team {
  constructor(id) {
    this.id = id;
    this.name = `Team ${id}`;
    this.status = 'Ready';
  }

  toString() {
    return this.name;
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

var nextCallID = 1;
var nextTeamID = 1;

//
// Call Table
//

function getCallTableHTML() {
  return `<table>
    <tr>
      <th>ID</th>
      <th>Description</th>
      <th>Location</th>
      <th>Start</th>
      <th>Teams</th>
      <th>End</th>
      <th>Disposition</th>
    </tr>
  ${calls.map(call => `
    <tr>
      <td>${call.id}</td>
      <td>${call.description}</td>
      <td>${call.location}</td>
      <td>${getFormattedTime(call.startTime)}</td>
      <td>
        ${[...call.teams].sort((a, b) => a.id - b.id).map(team => `${team.name}<br>`).join('')}
        ${getAssignSelectorHTML(call)}
      </td>
      <td>${call.endTime}</td>
      <td>${call.disposition}</td>
    </tr>
  `).join('')}
  </table>`;
}

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
      <td id="team_${team.id}_name" contenteditable="true"
        onblur='setTeamName(${team.id}, this.innerText)'
        onfocus='selectAllText(this.id)'
        onkeydown='blurOnEnter(event)'
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

function assignTeam(teamID, callID) {
  setTeamStatus(teamID, callID);
}

function newTeam() {
  const team = new Team(nextTeamID++);
  teams.push(team);

  logMessage(`New team added: ${team.name}`);
  updateDisplay();

  var td = document.getElementById(`team_${team.id}_name`);
  td.focus();
}

function setTeamName(teamID, name) {
  const team = teamFromID(teamID);
  const oldName = team.name;

  if (oldName != name) {
    team.name = name;
    logMessage(`${oldName} changed name to ${name}`);
    updateDisplay();
  }
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

function selectAllText(id) {
  const p = document.getElementById(id);
  const s = window.getSelection();
  const r = document.createRange();
  r.selectNodeContents(p);
  s.removeAllRanges();
  s.addRange(r);
}

function blurOnEnter(event) {
  if (event.keyCode == 13) { 
    event.target.blur();
  }
}