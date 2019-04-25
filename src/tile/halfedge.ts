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

    constructor(f: Face, v: Vertex, n: HalfEdge, i: number) {
        this.face = f;
        this.vert = v;
        this.next = n;
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

    intersect(origin: vec3, dir: vec3) : boolean {
        let prevVert: Vertex = this.sym.vert;

        return false;
    }
}

export default HalfEdge;