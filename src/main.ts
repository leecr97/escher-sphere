import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Icosphere from './geometry/Icosphere';
import TileMesh from './tile/tilemesh';
import Vertex from './tile/vertex'
import HalfEdge from './tile/halfedge'
import Face from './tile/face'
import SelectedVertex from './tile/selectedvertex'
import SelectedHEdge from './tile/selectedhedge'
import SelectedFace from './tile/selectedface'

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {

};

let time: number = 0.0;
let square: Square;
let screenQuad: ScreenQuad;
let sphere: Icosphere;
let tileMesh: TileMesh;
let selectedVertex: SelectedVertex;
let selectedHEdge: SelectedHEdge;
let selectedFace: SelectedFace;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  sphere = new Icosphere(vec3.fromValues(0,0,0), 5, 1);
  sphere.create();

  // Set up instanced rendering data arrays here.
  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  // draw sphere
  // colorsArray = [255.0 / 255.0, 0.0 / 255.0, 0.0 / 255.0, 1.0];

  // col1Array = [5, 0, 0, 0];
  // col2Array = [0, 5, 0, 0];
  // col3Array = [0, 0, 5, 0];
  // col4Array = [0, 30, 0, 1];
  // let colors : Float32Array = new Float32Array(colorsArray);
  // let col1 : Float32Array = new Float32Array(col1Array);
  // let col2 : Float32Array = new Float32Array(col2Array);
  // let col3 : Float32Array = new Float32Array(col3Array);
  // let col4 : Float32Array = new Float32Array(col4Array);
  // sphere.setInstanceVBOs(colors, col1, col2, col3, col4);
  // sphere.setNumInstances(1);

  // draw squares
  // for (let i: number = 0; i < 4; i++) {
  //   colorsArray.push(255.0 / 255.0);
  //   colorsArray.push(255.0 / 255.0);
  //   colorsArray.push(255.0 / 255.0);
  //   colorsArray.push(1.0);

  //   col1Array.push(15);
  //   col1Array.push(0);
  //   col1Array.push(0);
  //   col1Array.push(0);

  //   col2Array.push(0);
  //   col2Array.push(15);
  //   col2Array.push(0);
  //   col2Array.push(0);

  //   col3Array.push(0);
  //   col3Array.push(0);
  //   col3Array.push(15);
  //   col3Array.push(0);
  // }
  // col4Array = [-15, 15, 0, 1,
  //              15, 15, 0, 1,
  //              15, 45, 0, 1,
  //              -15, 45, 0, 1];

  // let colors : Float32Array = new Float32Array(colorsArray);
  // let col1 : Float32Array = new Float32Array(col1Array);
  // let col2 : Float32Array = new Float32Array(col2Array);
  // let col3 : Float32Array = new Float32Array(col3Array);
  // let col4 : Float32Array = new Float32Array(col4Array);
  // square.setInstanceVBOs(colors, col1, col2, col3, col4);
  // square.setNumInstances(4);

  // tile mesh
  let vertices: Vertex[] = [];
  let v1: Vertex = new Vertex(vec3.fromValues(-15,15,0), 0);
  let v2: Vertex = new Vertex(vec3.fromValues(15, 15,0), 0);
  let v3: Vertex = new Vertex(vec3.fromValues(15, 45,0), 0);
  let v4: Vertex = new Vertex(vec3.fromValues(-15,45,0), 0);
  vertices.push(v1, v2, v3, v4);

  let hedges: HalfEdge[] = [];
  let h1: HalfEdge = new HalfEdge(v1, 0);
  v1.setEdge(h1);
  let h2: HalfEdge = new HalfEdge(v2, 1);
  v2.setEdge(h2);
  let h3: HalfEdge = new HalfEdge(v3, 2);
  v3.setEdge(h3);

  let h4: HalfEdge = new HalfEdge(v1, 3);
  let h5: HalfEdge = new HalfEdge(v3, 4);
  let h6: HalfEdge = new HalfEdge(v4, 5);
  v4.setEdge(h6);
  h1.setNext(h2);
  h2.setNext(h3);
  h3.setNext(h1);

  h4.setNext(h5);
  h5.setNext(h6);
  h6.setNext(h4);

  h1.setSym(h5);
  h2.setSym(null);
  h3.setSym(null);
  h4.setSym(null);
  h5.setSym(h1);
  h6.setSym(null);

  let faces: Face[] = [];
  let f1: Face = new Face(vec3.fromValues(138.0 / 255.0, 181.0 / 255.0, 252.0 / 255.0), 0);
  f1.setEdge(h1);
  h1.setFace(f1);
  h2.setFace(f1);
  h3.setFace(f1);
  let f2: Face = new Face(vec3.fromValues(138.0 / 255.0, 181.0 / 255.0, 252.0 / 255.0), 0);
  f2.setEdge(h4);
  h4.setFace(f2);
  h5.setFace(f2);
  h6.setFace(f2);
  
  hedges.push(h1, h2, h3, h4, h5, h6);
  faces.push(f1, f2);

  tileMesh = new TileMesh(faces, hedges, vertices);
  tileMesh.create();

  // colorsArray = [255.0 / 255.0, 0.0 / 255.0, 0.0 / 255.0, 1.0];
  col1Array = [1, 0, 0, 0];
  col2Array = [0, 1, 0, 0];
  col3Array = [0, 0, 1, 0];
  col4Array = [0, 0, 0, 1];
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  tileMesh.setInstanceVBOs(col1, col2, col3, col4);
  tileMesh.setNumInstances(1);

  // selected vertex and hedge and face
  selectedVertex = new SelectedVertex(v1);
  selectedVertex.create();
  // col4Array = [v1.pos[0], v1.pos[1], v1.pos[2], 1];
  // col4 = new Float32Array(col4Array);
  selectedVertex.setInstanceVBOs(col1, col2, col3, col4);
  selectedVertex.setNumInstances(1);

  selectedHEdge = new SelectedHEdge(h6);
  selectedHEdge.create();
  selectedHEdge.setInstanceVBOs(col1, col2, col3, col4);
  selectedHEdge.setNumInstances(1);

  selectedFace = new SelectedFace(f1);
  selectedFace.create();
  selectedFace.setInstanceVBOs(col1, col2, col3, col4);
  selectedFace.setNumInstances(1);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  // gui.add(controls, 'Iterations', 0, 5);
  // gui.add(controls, 'Season', {Summer: 0, Fall: 1, Winter: 2, Spring: 3});
  // gui.add(controls, 'Angle', 0, 45);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  // const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
  // const camera = new Camera(vec3.fromValues(10, 40, 70), vec3.fromValues(0, 30, 0));
  const camera = new Camera(vec3.fromValues(0, 30, 50), vec3.fromValues(0, 30, 0));
  // const camera = new Camera(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const tileShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/tile-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/tile-frag.glsl')),
  ])

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      // square,
      // sphere,
      // tileMesh,
      // selectedFace,
    ]);
    renderer.render(camera, tileShader, [
      tileMesh,
      selectedVertex,
      selectedHEdge,
      selectedFace,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
