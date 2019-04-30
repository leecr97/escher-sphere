import {vec3, vec4, vec2, quat} from 'gl-matrix';
import {gl} from '../globals';
import HalfEdge from './halfedge';
import Face from './face'

class Vertex {
    pos: vec3;
    id: number;
    edge: HalfEdge;
    movable: boolean;
    group: number;

    constructor(p: vec3, i: number) {
        this.pos = p;
        this.id = i;
    }

    // setters
    setEdge(e: HalfEdge) {
        this.edge = e;
    }
    setMovable(m: boolean) {
        this.movable = m;
    }
    setGroup(g: number) {
        this.group = g;
    }

    intersect(origin: vec3, dir: vec3, ptRef: any) : boolean {
        vec3.normalize(dir,dir);
        let radius: number = 0.2;
        // no need to transform ray

        //Ray-plane intersection
        let plane: vec3 = vec3.fromValues(0,0,this.pos[2]);
        let planeDist: vec3 = vec3.create();
        vec3.subtract(planeDist, plane, origin);
        let a: number = vec3.dot(vec3.fromValues(0,0,1), planeDist);
        let b: number = vec3.dot(vec3.fromValues(0,0,1), dir);
        let t: number = a / b;

        let p: vec3 = vec3.create();
        vec3.scale(dir, dir, t);
        vec3.add(p, dir, origin);

        //Check that P is within the bounds of the disc (not bothering to take the sqrt of the dist b/c we know the radius)
        let dist: number = vec3.dist(this.pos, p);
        ptRef.pt = p;

        if(t > 0 && dist <= radius)
        {
            return true;
        }
        return false;
    }

    move(dist: vec3, forwRef: any) {
        let nextVert: Vertex = this.edge.sym.vert;
        let forward: vec3 = vec3.create();
        vec3.subtract(forward, nextVert.pos, this.pos);
        vec3.normalize(forward, forward);
        forwRef.forw = forward;

        vec3.add(this.pos, this.pos, dist);
    }

    moveSym(dist: vec3, forwRef: vec3) {
        let nextVert: Vertex = this.edge.sym.vert;
        let forward: vec3 = vec3.create();
        vec3.subtract(forward, nextVert.pos, this.pos);
        vec3.normalize(forward, forward);

        let rq: quat = quat.create();
        quat.rotationTo(rq, forwRef, forward);

        let distTrans: vec3 = vec3.create();
        vec3.transformQuat(distTrans, dist, rq);

        vec3.add(this.pos, this.pos, distTrans);
    }
}

export default Vertex;