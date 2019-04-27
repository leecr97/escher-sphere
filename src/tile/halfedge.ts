import {vec3, vec4, mat4, quat} from 'gl-matrix';
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
        let p1: vec3 = this.vert.pos;
        let p2: vec3 = prevVert.pos;
        let midpoint: vec3 = vec3.fromValues((p1[0] + p2[0]) / 2,
                                             (p1[1] + p2[1]) / 2,
                                             (p1[2] + p2[2]) / 2);
        let len: number = vec3.dist(p1, p2);

        // transform ray
        let invTrans: mat4 = this.getInverseTransform();
        let ori4: vec4 = vec4.fromValues(origin[0], origin[1], origin[2], 1);
        let dir4: vec4 = vec4.fromValues(dir[0], dir[1], dir[2], 0);
        vec4.transformMat4(ori4, ori4, invTrans);
        vec4.transformMat4(dir4, dir4, invTrans);
        let oriloc: vec3 = vec3.fromValues(ori4[0], ori4[1], ori4[2]);
        let dirloc: vec3 = vec3.fromValues(dir4[0], dir4[1], dir4[2]);

        //Ray-plane intersection
        let plane: vec3 = vec3.fromValues(0,0,midpoint[2]);
        let planeDist: vec3 = vec3.create();
        vec3.subtract(planeDist, plane, oriloc);
        let a: number = vec3.dot(vec3.fromValues(0,0,1), planeDist);
        let b: number = vec3.dot(vec3.fromValues(0,0,1), dirloc);
        let t: number = a / b;

        let p: vec3 = vec3.create();
        vec3.scale(dirloc, dirloc, t);
        vec3.add(p, dirloc, oriloc);
        //Check that P is within the bounds of the disc (not bothering to take the sqrt of the dist b/c we know the radius)
        let dist2: number = p[0] * p[0] + p[1] * p[1];
        let dist: number = vec3.dist(midpoint, p);
        // console.log("p: " + p);
        // console.log("pos: " + this.pos);
        // console.log("dist: " + dist);
        // console.log("eye: " + origin);
        // console.log("plant: " + planeDist);
        // console.log("");

        if(t > 0 && p[0] >= (-1.0 * (len / 2.0)) && p[0] <= (len / 2.0) && 
                    p[1] >= -0.5 && p[1] <= 0.5)
        {
            // InitializeIntersection(isect, t, P);
            return true;
        }
        return false;
    }

    getInverseTransform(): mat4 {
        let transform: mat4 = this.getTransform();
        let ret: mat4 = mat4.create();
        mat4.invert(ret, transform);

        return ret;
    }

    getTransform(): mat4 {
        let prevVert: Vertex = this.sym.vert;
        let p1: vec3 = this.vert.pos;
        let p2: vec3 = prevVert.pos;

        // rotate
        let rq: quat = quat.create();
        let dir: vec3 = vec3.create();
        vec3.subtract(dir, p2, p1);
        quat.rotationTo(rq, vec3.fromValues(0,1,0), dir);

        // translate
        let midpoint: vec3 = vec3.fromValues((p1[0] + p2[0]) / 2,
                                             (p1[1] + p2[1]) / 2,
                                             (p1[2] + p2[2]) / 2);

        // scale
        let len: number = vec3.dist(p1, p2);
        let s: vec3 = vec3.fromValues(len, 1.0, 0.1);

        let transformMat: mat4 = mat4.create();
        mat4.fromRotationTranslationScale(transformMat, rq, midpoint, s);
        return transformMat;
    }
}

export default HalfEdge;