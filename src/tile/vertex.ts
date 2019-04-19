import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import HalfEdge from './halfedge';

class Vertex {
    pos: vec3;
    id: number;
    edge: HalfEdge;

    constructor(p: vec3, i: number) {
        this.pos = p;
        this.id = i;
    }

    // setters
    setEdge(e: HalfEdge) {
        this.edge = e;
    }
}

export default Vertex;