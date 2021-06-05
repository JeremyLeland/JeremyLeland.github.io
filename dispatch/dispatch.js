class Call {
  constructor(id, description, location) {
    this.id = id;
    this.description = description;
    this.location = location;
    this.startTime = new Date();
    this.teams = [];
    this.endTime = null;
    this.disposition = null;
  }
}

class Team {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.status = 'Ready';
  }
}

var calls = [];
var teams = [];

teams.push(new Team(1, 'Team 1'));
teams.push(new Team(2, 'Team 2'));
teams.push(new Team(3, 'Team 3'));

calls.push(new Call(1, 'ETOH', 'Stage Right Cafe'));
calls.push(new Call(2, 'ETOH', 'North Gate'));
calls.push(new Call(3, 'Fall', 'Stage Left Stairs'));
calls.push(new Call(4, 'Unknown', 'Stage Right Cafe'));

function updateDisplay() {
  document.getElementById('team_table').innerHTML = getTeamTableHTML();
  document.getElementById('call_table').innerHTML = getCallTableHTML();
}

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
      <td>${call.teams.map(team => team.name).join('')}<button>Assign Team</button></td>
      <td>${call.endTime}</td>
      <td>${call.disposition}</td>
    </tr>
  `).join('')}
  </table>`;
}

function getTeamTableHTML() {
  return `<table>
    <tr>
      <th>Team</th>
      <th>Status</th>
    </tr>
  ${teams.map(team => `
    <tr>
      <td class="${team.status == 'Ready' ? 'ready' : 'busy'}">${team.name}</td>
      <td>${getStatusSelectorHTML(team)}</td>
    </tr>
  `).join('')}
  </table>`;
}

function getStatusSelectorHTML(team) {
  var options = ['Ready', ...calls.map(call => `Call ${call.id}`), 'Busy'];

  return `<select onchange='setTeamStatus(${team.id}, this.value)'>
  ${options.map(o => `
    <option ${team.status == o ? 'selected disabled hidden' : ''}>${o}</option>
  `).join('')}
  </select>`;
}

function setTeamStatus(teamID, status) {
  teams.find(e => e.id == teamID).status = status;
  updateDisplay();
}

function getFormattedTime(time) {
  const parts = [time.getHours(), time.getMinutes()];
  return parts.map(e => e.toString().padStart(2, '0')).join(':');
}