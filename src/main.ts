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
import {readTextFile} from './globals';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  SelectionMode: 1,
  MoveVerts: false,
  'Split Edge': splitEdge,
};

let time: number = 0.0;
let square: Square;
let screenQuad: ScreenQuad;
let sphere: Icosphere;
let tileMesh: TileMesh;

let selectedVertex: SelectedVertex;
let selectedHEdge: SelectedHEdge;
// let selectedFace: SelectedFace;
let sVertex: Vertex;
let sHedge: HalfEdge;
// let sFace: Face;

let screenX: number;
let screenY: number;

let hedges: HalfEdge[];
let vertices: Vertex[];
let faces: Face[];
let selectionMode: number = 1;

let drag: boolean = false;
let down: boolean = false;
let moving: boolean = false;

function loadInitialScene() {
  // square = new Square();
  // square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  // sphere = new Icosphere(vec3.fromValues(0,0,0), 5, 1);
  // sphere.create();

  // Set up instanced rendering data arrays here.
  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  let cubeobj: string = readTextFile('./src/obj/icosphere.obj');
  tileMesh = new TileMesh(cubeobj);
  // tileMesh.setData(faces, hedges, vertices);
  tileMesh.create();
  vertices = tileMesh.vertices;
  hedges = tileMesh.halfEdges;
  faces = tileMesh.faces;

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

  sVertex = tileMesh.vertices[0];
  sHedge = tileMesh.halfEdges[0];
  // sFace = tileMesh.faces[0];

  console.log(`Created tilemesh with ` + 
              tileMesh.faces.length + " faces and " + 
              tileMesh.halfEdges.length + " edges and " + 
              tileMesh.vertices.length + " vertices.");
}

function reloadMesh() {
  tileMesh.setData(faces, hedges, vertices);

  // Set up instanced rendering data arrays here.
  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

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
}

function loadSelections() {
  // Set up instanced rendering data arrays here.
  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  // selected vertex 
  selectedVertex = new SelectedVertex(sVertex);
  selectedVertex.create();

  let vgroup: number = sVertex.group;
  let vertGroup: Vertex[] = tileMesh.vertMap.get(vgroup);
  let len: number = 1;

  // if (vertGroup == null) {
    colorsArray = [255.0 / 255.0, 255.0 / 255.0, 255.0 / 255.0, 1.0];
    col1Array = [1, 0, 0, 0];
    col2Array = [0, 1, 0, 0];
    col3Array = [0, 0, 1, 0];
    col4Array = [0, 0, 0, 1];
  // }
  // else {
  //   for (let i: number = 0; i < vertGroup.length; i++) {
  //     let v: Vertex = vertGroup[i];

  //     colorsArray.push(255.0 / 255.0);
  //     colorsArray.push(255.0 / 255.0);
  //     colorsArray.push(255.0 / 255.0);
  //     colorsArray.push(1.0);

  //     col1Array.push(v.pos[0]);
  //     col1Array.push(0.0);
  //     col1Array.push(0.0);
  //     col1Array.push(0.0);

  //     col2Array.push(0.0);
  //     col2Array.push(v.pos[1]);
  //     col2Array.push(0.0);
  //     col2Array.push(0.0);

  //     col3Array.push(0.0);
  //     col3Array.push(0.0);
  //     col3Array.push(v.pos[2]);
  //     col3Array.push(0.0);

  //     col4Array.push(1.0);
  //     col4Array.push(1.0);
  //     col4Array.push(1.0);
  //     col4Array.push(1.0);
  //   }
  //   len = vertGroup.length;
  // }
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  selectedVertex.setInstanceVBOs(colors, col1, col2, col3, col4);
  selectedVertex.setNumInstances(len);

  // edges
  selectedHEdge = new SelectedHEdge(sHedge);
  selectedHEdge.create();
  colorsArray = [];

  let egroup: number = sHedge.group;
  let hedgeGroup: HalfEdge[] = tileMesh.edgeMap.get(egroup);
  // console.log(hedgeGroup.length);
  
  // for (let i: number = 0; i < hedgeGroup.length; i++) {
  //   let t: mat4 = hedgeGroup[i].getTransform(0.0);
  //   // console.log(t);

  //   colorsArray.push(255.0 / 255.0);
  //   colorsArray.push(255.0 / 255.0);
  //   colorsArray.push(255.0 / 255.0);
  //   colorsArray.push(1.0);

  //   col1Array.push(t[0]);
  //   col1Array.push(t[1]);
  //   col1Array.push(t[2]);
  //   col1Array.push(t[3]);

  //   col2Array.push(t[4]);
  //   col2Array.push(t[5]);
  //   col2Array.push(t[6]);
  //   col2Array.push(t[7]);

  //   col3Array.push(t[8]);
  //   col3Array.push(t[9]);
  //   col3Array.push(t[10]);
  //   col3Array.push(t[11]);

  //   col4Array.push(t[12]);
  //   col4Array.push(t[13]);
  //   col4Array.push(t[14]);
  //   col4Array.push(t[15]);
  // }
  colorsArray = [255.0 / 255.0, 0.0 / 255.0, 0.0 / 255.0, 1.0];
  colors = new Float32Array(colorsArray);
  col1 = new Float32Array(col1Array);
  col2 = new Float32Array(col2Array);
  col3 = new Float32Array(col3Array);
  col4 = new Float32Array(col4Array);
  selectedHEdge.setInstanceVBOs(colors, col1, col2, col3, col4);
  selectedHEdge.setNumInstances(1);

  // selectedFace = new SelectedFace(sFace);
  // selectedFace.create();
  // selectedFace.setInstanceVBOs(col1, col2, col3, col4);
  // selectedFace.setNumInstances(1);
}

function intersectScene(eye: vec3, dir: vec3): boolean {
  // if ray intersects face/hedge/vert, change selected that and return true 
  let ret: boolean = false;
  let closest: number = 1000000;

  // console.log(dir[0] + ", " + dir[1] + ", " + dir[2]);
  
  if (selectionMode == 0) {
    let tempPt: vec3 = vec3.create();
    vertices.forEach(v => {
      if (v.intersect(eye, dir, tempPt)) {
        let dist: number = vec3.dist(eye, v.pos);
        if (dist < closest) {
          closest = dist;
          sVertex = v;
          ret = true;
        }
      }
    });
    loadSelections();
  }
  else if (selectionMode == 1) {
    hedges.forEach(e => {
      if (e.intersect(eye, dir)) {
        let dist: number = vec3.dist(eye, e.vert.pos);
        if (dist < closest) {
          closest = dist;
          // selectedHEdge.setEdge(e);
          sHedge = e;
          ret = true;
          // console.log("found edge " + e.id);
          // console.log("pos: " + e.vert.pos);
          // console.log("id: " + e.id);
        }
      }
    });
    loadSelections();
  }

  return ret;
}

function splitEdge() {
  let ind: number = hedges.indexOf(sHedge);
  // console.log("id1: " + sHedge.id);
  let newVert: Vertex = tileMesh.splitEdge(tileMesh.halfEdges[ind]);
  sVertex = newVert;
  reloadMesh();
  loadSelections();
}

function main() {
  // window.addEventListener('keypress', function (e) {
  //   // console.log(e.key);
  //   switch(e.key) {
  //     case 'w':
  //     // wPressed = true;
  //     break;
  //     case 'a':
  //     // aPressed = true;
  //     break;
  //     case 's':
  //     // sPressed = true;
  //     break;
  //     case 'd':
  //     // dPressed = true;
  //     break;
  //   }
  // }, false);

  // window.addEventListener('keyup', function (e) {
  //   switch(e.key) {
  //     case 'w':
  //     // wPressed = false;
  //     break;
  //     case 'a':
  //     // aPressed = false;
  //     break;
  //     case 's':
  //     // sPressed = false;
  //     break;
  //     case 'd':
  //     // dPressed = false;
  //     break;
  //   }
  // }, false);

  window.addEventListener("mousedown", function(e){
    drag = false;
    down = true;
  }, false);
  window.addEventListener("mousemove", function(e){
    drag = true;

    if (down && moving) {
      // console.log("drag");
      screenX = e.clientX;
      screenY = e.clientY;
      let ray_dir: vec3 = camera.raycast(screenX, screenY);
    
      if (sVertex.movable) {
        let tempPt: vec3 = vec3.create();
        var temp = {pt: tempPt};
        // make sure mouse is on the selected vertex
        if (sVertex.intersect(camera.position, ray_dir, temp)) {
          tempPt = temp.pt;
          // console.log(tempPt);
          // move vertex
          let ind: number = vertices.indexOf(sVertex);
          // console.log(ind);
          vertices[ind].pos = tempPt;
          sVertex = vertices[ind];
          reloadMesh();
          loadSelections();
          // sVertex.pos = tempPt;
          // loadSelections();
        }
      }
      
    }
      
  }, false);
  window.addEventListener("mouseup", function(e){
    down = false;
    if(drag === false){
        // console.log("click");
        screenX = e.clientX;
        screenY = e.clientY;
        // console.log(screenX + ", " + screenY);

        // dont register clicks in the gui area
        if (screenX > 550 && screenX < 795 && screenY < 102) {
          return;
        }

        // raycast 
        let ray_dir: vec3 = camera.raycast(screenX, screenY);
        intersectScene(camera.position, ray_dir);
    }
    else if(drag === true){
        // console.log("drag");
    }
  }, false);

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
  gui.add(controls, 'SelectionMode', {Vertex: 0, Edge: 1});
  gui.add(controls, 'MoveVerts');
  gui.add(controls, 'Split Edge');
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
  loadInitialScene();
  loadSelections();

  // const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
  // const camera = new Camera(vec3.fromValues(10, 40, 70), vec3.fromValues(0, 30, 0));
  // const camera = new Camera(vec3.fromValues(0, 30, 50), vec3.fromValues(0, 30, 0));
  const camera = new Camera(vec3.fromValues(0, 0, 2), vec3.fromValues(0, 0, 0));

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

    if (controls.SelectionMode != selectionMode) {
      selectionMode = controls.SelectionMode;
    }
    if (controls.MoveVerts != moving) {
      moving = controls.MoveVerts;
      camera.toggleFreeze();
    }

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
      // selectedFace,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.setDimensions(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.setDimensions(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
