import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import HalfEdge from './halfedge';

class SelectedEdge extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;

  edge: HalfEdge;

  constructor(e: HalfEdge) {
    super(); // Call the constructor of the super class. This is required.
    this.edge = e;
  }

  create() {
    let curr: HalfEdge = this.edge;
    let posList: vec3[] = [];

    do {
        posList.push(curr.vert.pos);
        curr = curr.next;
    } while (curr != this.edge);
    
    let n1: vec3 = vec3.create();
    vec3.subtract(n1, posList[0], posList[1]);
    let n2: vec3 = vec3.create();
    vec3.subtract(n2, posList[1], posList[2]);
    let n: vec3 = vec3.create();
    vec3.cross(n, n1, n2);

    let pos1: vec3 = this.edge.vert.pos;
    let pos2: vec3 = posList[posList.length - 1];
    // console.log("pos1: " + pos1[0] + ", " + pos1[1] + ", " + pos1[2]);
    // console.log("pos2: " + pos2[0] + ", " + pos2[1] + ", " + pos2[2]);

    this.indices = new Uint32Array([0,1]);
    this.positions = new Float32Array([pos1[0], pos1[1], pos1[2], 1.0,
                                       pos2[0], pos2[1], pos2[2], 1.0]);
    this.normals = new Float32Array([n[0], n[1], n[2], 0.0,
                                     n[0], n[1], n[2], 0.0]);
    this.colors = new Float32Array([1, 1, 0, 1.0,
                                    1, 0, 0, 1.0]);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateCol();

    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTransform4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    console.log(`Created selectedhedge`);
  }

  setInstanceVBOs(col1: Float32Array, col2: Float32Array, col3: Float32Array, col4: Float32Array) {
    this.col1 = col1;
    this.col2 = col2;
    this.col3 = col3;
    this.col4 = col4;
    // this.colors = colors;

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    // gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.col1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.col2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.col3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform4);
    gl.bufferData(gl.ARRAY_BUFFER, this.col4, gl.STATIC_DRAW);
  }

  setEdge(e: HalfEdge) {
    this.edge = e;
  }

  drawMode(): GLenum {
    return gl.LINES;
  }
}

export default SelectedEdge;