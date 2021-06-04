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
  constructor(name) {
    this.name = name;
    this.status = 'Available';
  }
}

var calls = [];
var teams = [];

teams.push(new Team('Team 1'), new Team('Team 2'), new Team('Team 3'));

calls.push(new Call(1, 'ETOH', 'Stage Right Cafe'));
calls.push(new Call(2, 'ETOH', 'North Gate'));
calls.push(new Call(3, 'Fall', 'Stage Left Stairs'));
calls.push(new Call(4, 'Unk', 'Stage Right Cafe'));

function getCallTableHTML() {
  return `
  <table>
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
      <td>${call.teams.map(team => team.name).join('')}</td>
      <td>${call.endTime}</td>
      <td>${call.disposition}</td>
    </tr>
  `).join('')}
  </table>
  `;
}

function getTeamTableHTML() {
  return `
  <table>
    <tr>
      <th>Team</th>
      <th>Status</th>
    </tr>
  ${teams.map(team => `
    <tr>
      <td>${team.name}</td>
      <td>${team.status}</td>
    </tr>
  `).join('')}
  </table>
  `;
}

function getFormattedTime(time) {
  return [time.getHours(), time.getMinutes()].map(e => e.toString().padStart(2, '0')).join(':');
}