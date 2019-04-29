import {vec3, vec4, mat4, quat, mat3} from 'gl-matrix';
import {gl} from '../globals';
import Vertex from './vertex';
import Face from './face';

class HalfEdge {
    vert: Vertex;
    face: Face;
    id: number;
    next: HalfEdge;
    sym: HalfEdge;
    group: number;
    transform: mat4;

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
    setGroup(g: number) {
        this.group = g;
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
        let transform: mat4 = this.getTransform(1.0);
        let ret: mat4 = mat4.create();
        mat4.invert(ret, transform);

        return ret;
    }

    findAngle(v1: vec3, v2: vec3) : number {
        let l1: number = vec3.length(v1);
        let l2: number = vec3.length(v2);
        let dot: number = vec3.dot(v1, v2);

        return Math.acos(dot / (l1 * l2));
    }

    getTransform(yscale: number): mat4 {
        // let curr: HalfEdge = this;
        // let posList: vec3[] = [];

        // do {
        //     posList.push(curr.vert.pos);
        //     curr = curr.next;
        // } while (curr != this);

        // let p1: vec3 = this.vert.pos;
        // let p2: vec3 = posList[posList.length - 1];

        let prevVert: Vertex = this.sym.vert;
        let p1: vec3 = this.vert.pos;
        let p2: vec3 = prevVert.pos;
        let len: number = vec3.dist(p1, p2);
        // console.log("p1: " + p1);
        // console.log("p2: " + p2);
        // console.log("");
        // console.log(len);

        // rotate
        // let dir: vec3 = vec3.create();
        // vec3.subtract(dir, p2, p1);
        // // x axis
        // let xaxis: vec3 = vec3.fromValues(1,0,0);
        // let xangle: number = this.findAngle(vec3.fromValues(0,1,0), dir);
        // // y axis
        // let yaxis: vec3 = vec3.fromValues(0,1,0);
        // let yangle: number = this.findAngle(vec3.fromValues(0,0,1), dir);
        // // z axis
        // let zaxis: vec3 = vec3.fromValues(0,0,1);
        // let zangle: number = this.findAngle(vec3.fromValues(0,1,0), dir);

        // let xq: quat = quat.create();
        // quat.setAxisAngle(xq, xaxis, xangle);
        // let yq: quat = quat.create();
        // quat.setAxisAngle(yq, yaxis, yangle);
        // let zq: quat = quat.create();
        // quat.setAxisAngle(zq, zaxis, zangle);

        // let rq: quat = quat.create();
        // quat.multiply(rq, xq, yq);
        // quat.multiply(rq, rq, zq);
        
        // rotate
        let rq: quat = quat.create();
        let dir: vec3 = vec3.create();
        vec3.subtract(dir, p2, p1);
        quat.rotationTo(rq, vec3.fromValues(0,1,0), dir);

        // let a: vec3 = vec3.create();
        // vec3.subtract(a, p2, p1);
        // let b: vec3 = vec3.fromValues(0,1,0);
        // // let lenB: number = vec3.len(b);
        // let proj: vec3 = vec3.create();
        // // let temp: vec3 = vec3.create();
        // vec3.cross(proj, a, b);
        // vec3.cross(proj, b, proj);

        // let yaw: number = this.findAngle(vec3.fromValues(1,0,0), proj);
        // let yawQuat: quat = quat.create();
        // quat.setAxisAngle(yawQuat, vec3.fromValues(0,1,0), yaw);

        // let elevation: number = vec3.dot(a, proj);
        // let projperp: vec3 = vec3.create();
        // vec3.rotateY(projperp, projperp, proj, 90.0);
        // vec3.normalize(projperp, projperp);
        // let eleQuat: quat = quat.create();
        // quat.setAxisAngle(eleQuat, projperp, elevation);

        // quat.multiply(rq, yawQuat, eleQuat);

        // let a: vec3 = vec3.fromValues(1,0,0);
        // let b: vec3 = vec3.create();
        // vec3.subtract(b, p2, p1);
        // vec3.normalize(b,b);
        // let v: vec3 = vec3.create();
        // vec3.cross(v, a, b);
        // let c: number = vec3.dot(a,b);
        // let vx: mat3 = mat3.fromValues(0, v[2], -1.0 * v[1],
        //                                -1.0 * v[2], 0, v[0], 
        //                                v[1], -1.0 * v[0], 0);
        // let vx2: mat3 = mat3.create();
        // mat3.multiply(vx2, vx, vx);
        // mat3.multiplyScalar(vx2, vx2, 1.0 / (1 + c));
        // let i: mat3 = mat3.create();
        // mat3.identity(i);
        // let r: mat3 = mat3.create();
        // mat3.add(r, r, i);
        // mat3.add(r, r, vx);
        // mat3.add(r, r, vx2);
        // quat.fromMat3(rq, r);
        // quat.normalize(rq, rq);

        // translate
        let midpoint: vec3 = vec3.fromValues((p1[0] + p2[0]) / 2,
                                             (p1[1] + p2[1]) / 2,
                                             (p1[2] + p2[2]) / 2);

        // scale
        let s: vec3 = vec3.fromValues(len, yscale, 0.1);

        let transformMat: mat4 = mat4.create();
        mat4.fromRotationTranslationScale(transformMat, rq, p1, s);
        return transformMat;
    }
}

export default HalfEdge;