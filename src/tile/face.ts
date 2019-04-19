import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import Vertex from './vertex';
import HalfEdge from './halfedge';

class Face {
    start_edge: HalfEdge;
    color: vec3;
    id: number;

    constructor(c: vec3, i: number) {
        this.color = c;
        this.id = i;
    }

    // setters
    setEdge(e: HalfEdge) {
        this.start_edge = e;
    }
}

export default Face;