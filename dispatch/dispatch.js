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
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.status = 'Ready';
  }

  toString() {
    return this.name;
  }
}

const calls = [];
const teams = [];

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
      <td>${[...call.teams].map(team => `${team.name}<br>`).join('')}<button>Assign Team</button></td>
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
  return `<select onchange='setTeamStatus(${team.id}, this.value)'>
    ${getStatusOptionHTML(team, 'Ready')}
    ${calls.map(c => getStatusOptionHTML(team, c)).join('')}
    ${getStatusOptionHTML(team, 'Busy')}
  </select>`;
}

function getStatusOptionHTML(team, status) {
  return `<option
    ${team.status == status ? ' selected disabled hidden ' : ''}
    ${status instanceof Call ? (status.teams.size == 0 ? ' class="bold" ' : ' class="italic"') : ''}
  >${status}</option>`;
}

function setTeamStatus(teamID, status) {
  const team = teams.find(t => t.id == teamID);
  team.status = status;

  const currentCall = calls.find(c => c.teams.has(team));
  if (currentCall) {
    currentCall.teams.delete(team);
  }

  if (status != 'Ready' && status != 'Busy') {
    const newCallID = status.match(/^Call\s(\d+)/)[1];
    if (newCallID) {
      const call = calls.find(c => c.id == newCallID);

      if (call) {
        call.teams.add(team);
      }
    }
  }

  updateDisplay();
}

function getFormattedTime(time) {
  const parts = [time.getHours(), time.getMinutes()];
  return parts.map(e => e.toString().padStart(2, '0')).join(':');
}