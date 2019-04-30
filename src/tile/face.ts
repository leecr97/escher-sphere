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
    setStartEdge(e: HalfEdge) {
        this.start_edge = e;
    }

    intersect(origin: vec3, dir: vec3) : boolean {

        return false;
    }

    getCenter(): vec3 {
        let curr: HalfEdge = this.start_edge;
        let posList: vec3[] = [];

        do {
            posList.push(curr.vert.pos);
            curr = curr.next;
        } while (curr != this.start_edge);

        let xTotal: number = 0;
        let yTotal: number = 0;
        let zTotal: number = 0;

        for (let i: number = 0; i < posList.length; i++) {
            xTotal += posList[i][0];
            yTotal += posList[i][1];
            zTotal += posList[i][2];
        }
        xTotal /= posList.length;
        yTotal /= posList.length;
        zTotal /= posList.length;

        return vec3.fromValues(xTotal, yTotal, zTotal);
    };
}

export default Face;