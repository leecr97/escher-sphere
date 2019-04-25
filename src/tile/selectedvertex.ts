import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Vertex from './vertex';

class SelectedVertex extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  offsets: Float32Array; // Data for bufTranslate

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;

  vertex: Vertex;

  constructor(v: Vertex) {
    super(); // Call the constructor of the super class. This is required.
    this.vertex = v;
  }

  create() {

    this.indices = new Uint32Array([0]);
    let pos: vec3 = this.vertex.pos;
    this.positions = new Float32Array([pos[0], pos[1], pos[2], 1]);
    this.colors = new Float32Array([1, 1, 1, 1.0]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    // this.generateTranslate();

    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTransform4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    console.log(`Created selectedvert`);
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

  setVertex(v: Vertex) {
    this.vertex = v;
  }

  drawMode(): GLenum {
    return gl.POINTS;
  }
}

export default SelectedVertex;