export class World {
  static DebugBounds = false;
  
  entities = [];

  constructor( size = 100 ) {
    this.size = size;
  }

  update( dt ) {
    const prevHits = [];

    for ( let tries = 0; dt > 0 && tries < 16; tries ++ ) {

      if ( tries == 15 ) {
        debugger;   // TODO: Record how many tries for debug graphs?
      }

      let closestHit = { time: Infinity };
      
      for ( let i = 0; i < this.entities.length; i ++ ) {
        for ( let j = i + 1; j < this.entities.length; j ++ ) {
          const A = this.entities[ i ];
          const B = this.entities[ j ];

          // Don't get stuck on the same collision over and over
          // TODO: Also check time or position?
          if ( prevHits.find( e => e.entities.includes( A ) && e.entities.includes( B ) ) ) {
            continue;
          }

          // Make sure these entities can hit each other
          if ( A.nohit?.includes( B.type ) || B.nohit?.includes( A.type ) ) {
            continue;
          }

          if ( A.getQuickHit( B ).time < dt ) {
            const hit = A.getHit( B );
            
            if ( 0 <= hit.time && hit.time < closestHit.time ) {
              closestHit = hit;
            }
          }
        }
      }

      prevHits.push( closestHit );

      let updateTime = Math.min( closestHit.time, dt );

      this.entities.forEach( entity => entity.update( updateTime, this ) );

      if ( closestHit.time < dt ) {
        closestHit.entities.forEach( e => e.hitWith( closestHit ) );

        // TODO: Should this be handled any differently if the impact destroys one of the objects?

        const A = closestHit.entities[ 0 ];
        const B = closestHit.entities[ 1 ];

        // Old way -- not sure if this was correctly accounting for mass
        // const norm = Math.atan2( B.y - A.y, B.x - A.x );
          
        // // No friction or elasticity in this game
        // const normX = Math.cos( norm ), normY = Math.sin( norm );
        // const p = 2 * ( ( A.dx - B.dx ) * normX + ( A.dy - B.dy ) * normY ) / 
        //               ( A.mass + B.mass );
        
        // A.dx -= p * B.mass * normX;
        // A.dy -= p * B.mass * normY;
        // B.dx += p * A.mass * normX;
        // B.dy += p * A.mass * normY;

        // https://www.vobarian.com/collisions/2dcollisions2.pdf
        // Compute unit normal and unit tangent vectors
        const norm = Math.atan2( B.y - A.y, B.x - A.x );
        const normX = Math.cos( norm ), normY = Math.sin( norm );
        const tangX = -normY, tangY = normX;
        
        // Compute scalar projections of velocities onto v_un and v_ut
        const v1n = normX * A.dx + normY * A.dy;
        const v1t = tangX * A.dx + tangY * A.dy;
        const v2n = normX * B.dx + normY * B.dy;
        const v2t = tangX * B.dx + tangY * B.dy;
        
        // Compute new tangential velocities
        // Note: in reality, the tangential velocities do not change after the collision
        const v1tPrime = v1t;
        const v2tPrime = v2t;
        
        // Compute new normal velocities using one-dimensional elastic collision equations in the normal direction
        const v1nPrime = ( v1n * ( A.mass - B.mass ) + 2 * B.mass * v2n ) / ( A.mass + B.mass );
        const v2nPrime = ( v2n * ( B.mass - A.mass ) + 2 * A.mass * v1n ) / ( A.mass + B.mass );
        
        // Compute new normal and tangential velocity vectors
        // Set new velocities in x and y coordinates
        A.dx = v1nPrime * normX + v1tPrime * tangX;
        A.dy = v1nPrime * normY + v1tPrime * tangY;
        B.dx = v2nPrime * normX + v2tPrime * tangX;
        B.dy = v2nPrime * normY + v2tPrime * tangY;
      }

      dt -= updateTime;

      const createdEntities = [];
      this.entities.forEach( 
        e => createdEntities.push( ...e.createdEntities.splice( 0 ) )
      );
      this.entities.push( ...createdEntities );
      this.entities = this.entities.filter( e => e.isAlive && 
        -this.size < e.x + e.size && e.x - e.size < this.size &&
        -this.size < e.y + e.size && e.y - e.size < this.size
      );
    }
  }

  draw( ctx ) {
    this.entities.forEach( entity => entity.draw( ctx ) );

    if ( World.DebugBounds ) {
      ctx.beginPath();

      const DIST_SPACING = 100;
      for ( let d = 1; d <= this.size / DIST_SPACING; d ++ ) {
        ctx.arc( 0, 0, d * DIST_SPACING, 0, Math.PI * 2 );
      }

      const ANGLE_SPACES = 8;
      for ( let i = 0; i < ANGLE_SPACES; i ++ ) {
        const angle = Math.PI * 2 * i / ANGLE_SPACES;
        ctx.moveTo( 0, 0 );
        ctx.lineTo( Math.cos( angle ) * this.size, Math.sin( angle ) * this.size );
      }
    
      ctx.strokeStyle = 'rgba( 100, 100, 100, 0.2 )';
      ctx.stroke();
    }
  }

  getSpawnPoint( radius, { minRadius = 0, maxRadius = this.size } = {} ) {
    for ( let tries = 0; tries < 10; tries ++ ) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minRadius + radius + ( maxRadius - minRadius - radius * 2 ) * Math.random();
      const x = Math.cos( angle ) * dist;
      const y = Math.sin( angle ) * dist;

      if ( !this.entities.find( e => Math.hypot( e.x - x, e.y - y ) < e.size + radius ) ) {
        return { x: x, y: y };
      }
    }
  }
}