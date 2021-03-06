import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Vertex from './vertex';

class SelectedVertexGroup extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;

  vertices: Vertex[];

  constructor(v: Vertex[]) {
    super(); // Call the constructor of the super class. This is required.
    this.vertices = v;
  }

  create() {
    let indArray: number[] = [];
    let posArray: number[] = [];
    let norArray: number[] = [];

    for (let i: number = 0; i < this.vertices.length; i++) {
        let newV: Vertex = this.vertices[i];

        indArray.push(i * 4, i * 4 + 1, i * 4 + 2,
                      i * 4, i * 4 + 2, i * 4 + 3);

        let pos: vec3 = newV.pos;
        posArray.push(pos[0] - 0.003, pos[1] - 0.003, pos[2]+0.0008, 1,
                      pos[0] + 0.003, pos[1] - 0.003, pos[2]+0.0008, 1,
                      pos[0] + 0.003, pos[1] + 0.003, pos[2]+0.0008, 1,
                      pos[0] - 0.003, pos[1] + 0.003, pos[2]+0.0008, 1);

        norArray.push(0, 0, 1, 0,
                      0, 0, 1, 0,
                      0, 0, 1, 0,
                      0, 0, 1, 0);
    }

    // this.indices = new Uint32Array([0]);
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

    // console.log(`Created selectedvert`);
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

  setVertex(v: Vertex[]) {
    this.vertices = v;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }
}

export default SelectedVertexGroup;