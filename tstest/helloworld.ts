import { Node } from './Pathfinding';

const nodes = [];

for ( let row = 0; row < 10; row ++ ) {
  for ( let col = 0; col < 10; col ++ ) {
    nodes.push( new Node( col, row ) );
  }
}

