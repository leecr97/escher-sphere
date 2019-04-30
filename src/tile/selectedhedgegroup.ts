import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import HalfEdge from './halfedge';

class SelectedEdgeGroup extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;

  edges: HalfEdge[];

  constructor(e: HalfEdge[]) {
    super(); // Call the constructor of the super class. This is required.
    this.edges = e;
  }

  create() {
    let indArray: number[] = [];
    let posArray: number[] = [];
    let norArray: number[] = [];

    for (let i: number = 0; i < this.edges.length; i++) {
        let curr: HalfEdge = this.edges[i];
        let posList: vec3[] = [];

        do {
            posList.push(curr.vert.pos);
            curr = curr.next;
        } while (curr != this.edges[i]);

        let n1: vec3 = vec3.create();
        vec3.subtract(n1, posList[0], posList[1]);
        let n2: vec3 = vec3.create();
        vec3.subtract(n2, posList[1], posList[2]);
        let n: vec3 = vec3.create();
        vec3.cross(n, n1, n2);

        let pos1: vec3 = this.edges[i].vert.pos;
        let pos2: vec3 = posList[posList.length - 1];

        indArray.push(i * 2, i * 2 + 1);
        posArray.push(pos1[0], pos1[1], pos1[2], 1.0,
                      pos2[0], pos2[1], pos2[2], 1.0);
        norArray.push(n[0], n[1], n[2], 0.0,
                      n[0], n[1], n[2], 0.0);
    }

    this.indices = new Uint32Array(indArray);

    this.positions = new Float32Array(posArray);
    this.normals = new Float32Array(norArray);

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

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    // gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    // console.log(`Created selectedhedge`);
  }

  setInstanceVBOs(colors: Float32Array, col1: Float32Array, col2: Float32Array, col3: Float32Array, col4: Float32Array) {
    this.col1 = col1;
    this.col2 = col2;
    this.col3 = col3;
    this.col4 = col4;
    this.colors = colors;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.col1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.col2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.col3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform4);
    gl.bufferData(gl.ARRAY_BUFFER, this.col4, gl.STATIC_DRAW);
  }

  setEdge(e: HalfEdge[]) {
    this.edges = e;
  }

  drawMode(): GLenum {
    // return gl.TRIANGLES
    return gl.LINES;
  }

//   getTransform(): mat4 {
//     return this.edge.getTransform(0.0);
//   }
}

export default SelectedEdgeGroup;