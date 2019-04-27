import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Face from './face';
import HalfEdge from './halfedge'

class SelectedFace extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;

  face: Face;

  constructor(f: Face) {
    super(); // Call the constructor of the super class. This is required.
    this.face = f;
  }

  create() {

    let start: HalfEdge = this.face.start_edge;
    let curr: HalfEdge = start;
    let posList: vec3[] = [];
    let newCol: vec3 = vec3.fromValues(2.0 - this.face.color[0],
                                       2.0 - this.face.color[1],
                                       2.0 - this.face.color[2]);

    do {
        posList.push(curr.vert.pos);
        curr = curr.next;
    } while (curr != start);
    
    let n1: vec3 = vec3.create();
    vec3.subtract(n1, posList[0], posList[1]);
    let n2: vec3 = vec3.create();
    vec3.subtract(n2, posList[1], posList[2]);
    let n: vec3 = vec3.create();
    vec3.cross(n, n1, n2);
    curr = start;

    let indArray: number[] = [];
    let posArray: number[] = [];
    let norArray: number[] = [];
    let colArray: number[] = [];

    let index: number = 0;

    indArray.push(index);
    posArray.push(posList[0][0], posList[0][1], posList[0][2], 1.0);
    norArray.push(n[0], n[1], n[2], 0.0);
    colArray.push(newCol[0], newCol[1], newCol[2], 1.0);
    for (let i: number = 1; i < posList.length; i++) {
      // console.log("pos: " + posList[i][0] + ", " + posList[i][1] + ", " + posList[i][2]);
      index++;
      indArray.push(index);
      indArray.push(index);
      posArray.push(posList[i][0], posList[i][1], posList[i][2], 1.0);
      norArray.push(n[0], n[1], n[2], 0.0);
      colArray.push(newCol[0], newCol[1], newCol[2], 1.0);
    }
    indArray.push(0);

    // indArray = [0,1,2,0,2,3]; // hardcoded indices rn, have to change

    // indArray.forEach(element => {
    //   console.log("i: " + element);
    // });

    // console.log("ind: " + indArray.length);
    // console.log("pos: " + posArray.length);
    // console.log("nor: " + norArray.length);
    // console.log("col: " + colArray.length);

    this.indices = new Uint32Array(indArray);
    this.positions = new Float32Array(posArray);
    this.normals = new Float32Array(norArray);
    this.colors = new Float32Array(colArray);

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

    // console.log(`Created selectedface`);
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

  setFace(f: Face) {
    this.face = f;
  }

  drawMode(): GLenum {
    return gl.LINES;
  }
}

export default SelectedFace;