import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import Vertex from './vertex';
import Face from './face';

class HalfEdge {
    vert: Vertex;
    face: Face;
    id: number;
    next: HalfEdge;
    sym: HalfEdge;

    constructor(v: Vertex, i: number) {
        this.vert = v;
        this.id = i;
    }

    // setters
    setVertex(v: Vertex) {
        this.vert = v;
    }
    setFace(f: Face) {
        this.face = f;
    }
    setNext(e: HalfEdge) {
        this.next = e;
    }
    setSym(e: HalfEdge) {
        this.sym = e;
    }
}

export default HalfEdge;