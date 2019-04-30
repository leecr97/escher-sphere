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
import SelectedEdgeGroup from './tile/selectedhedgegroup'
import SelectedVertexGroup from './tile/selectedvertgroup'
import SelectedFace from './tile/selectedface'
import {readTextFile} from './globals';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  SelectionMode: 1,
  MoveVerts: false,
  'Add Vertex': splitEdge,
  'Extrude': extrude,
  Red: 138,
  Green: 181,
  Blue: 252,
};

let time: number = 0.0;
let square: Square;
let screenQuad: ScreenQuad;
let sphere: Icosphere;
let tileMesh: TileMesh;

let selectedVertex: SelectedVertex;
let selectedHEdge: SelectedHEdge;
let selectVerts: SelectedVertexGroup;
let selectHedges: SelectedEdgeGroup;
let selectedFace: SelectedFace;
let sVertex: Vertex;
let sHedge: HalfEdge;
let sFace: Face;

let screenX: number;
let screenY: number;

let hedges: HalfEdge[];
let vertices: Vertex[];
let faces: Face[];
let selectionMode: number = 1;

let drag: boolean = false;
let down: boolean = false;
let moving: boolean = false;
let extruded: boolean = false;

let red: number = 138;
let green: number = 181;
let blue: number = 252;

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
  tileMesh.create();
  vertices = tileMesh.vertices;
  hedges = tileMesh.halfEdges;
  faces = tileMesh.faces;

  colorsArray = [red / 255.0, green / 255.0, blue / 255.0, 1.0];
  col1Array = [1, 0, 0, 0];
  col2Array = [0, 1, 0, 0];
  col3Array = [0, 0, 1, 0];
  col4Array = [0, 0, 0, 1];
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  tileMesh.setInstanceVBOs(colors, col1, col2, col3, col4);
  tileMesh.setNumInstances(1);

  sVertex = tileMesh.vertices[Math.floor(Math.random() * tileMesh.vertices.length)];
  sHedge = tileMesh.halfEdges[Math.floor(Math.random() * tileMesh.halfEdges.length)];
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

  colorsArray = [red / 255.0, green / 255.0, blue / 255.0, 1.0];
  col1Array = [1, 0, 0, 0];
  col2Array = [0, 1, 0, 0];
  col3Array = [0, 0, 1, 0];
  col4Array = [0, 0, 0, 1];
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  tileMesh.setInstanceVBOs(colors, col1, col2, col3, col4);
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
  colorsArray = [255.0 / 255.0, 255.0 / 255.0, 0.0 / 255.0, 1.0];
  col1Array = [1, 0, 0, 0];
  col2Array = [0, 1, 0, 0];
  col3Array = [0, 0, 1, 0];
  col4Array = [0, 0, 0, 1];
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  selectedVertex.setInstanceVBOs(colors, col1, col2, col3, col4);
  selectedVertex.setNumInstances(1);

  let vgroup: number = sVertex.group;
  let vertGroup: Vertex[];
  if (vgroup == 0 ) {
    vertGroup = [];
  }
  else {
    vertGroup = tileMesh.vertMap.get(vgroup);
  }
  selectVerts = new SelectedVertexGroup(vertGroup);
  selectVerts.create();
  colorsArray = [255.0 / 255.0, 255.0 / 255.0, 0.0 / 255.0, 1.0];
  colors = new Float32Array(colorsArray);
  selectVerts.setInstanceVBOs(colors, col1, col2, col3, col4);
  selectVerts.setNumInstances(1);

  // edges
  selectedHEdge = new SelectedHEdge(sHedge);
  selectedHEdge.create();
  colorsArray = [255.0 / 255.0, 255.0 / 255.0, 0.0 / 255.0, 1.0];
  colors = new Float32Array(colorsArray);
  selectedHEdge.setInstanceVBOs(colors, col1, col2, col3, col4);
  selectedHEdge.setNumInstances(1);

  let egroup: number = sHedge.group;
  let hedgeGroup: HalfEdge[];
  hedgeGroup = tileMesh.edgeMap.get(egroup);

  selectHedges = new SelectedEdgeGroup(hedgeGroup);
  selectHedges.create();
  colorsArray = [255.0 / 255.0, 0.0 / 255.0, 0.0 / 255.0, 1.0];
  colors = new Float32Array(colorsArray);
  selectHedges.setInstanceVBOs(colors, col1, col2, col3, col4);
  selectHedges.setNumInstances(1);

  // selectedFace = new SelectedFace(sFace);
  // selectedFace.create();
  // selectedFace.setInstanceVBOs(col1, col2, col3, col4);
  // selectedFace.setNumInstances(1);
}

function intersectScene(eye: vec3, dir: vec3): boolean {
  // if ray intersects hedge/vert, change selected that and return true 
  let ret: boolean = false;
  let closest: number = 1000000;
  
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
          sHedge = e;
          ret = true;
        }
      }
    });
    loadSelections();
  }

  return ret;
}

function splitEdge() {
  let ind: number = hedges.indexOf(sHedge);
  let newVert: Vertex = tileMesh.splitEdge(tileMesh.halfEdges[ind]);
  sVertex = newVert;
  reloadMesh();
  loadSelections();
}

function extrude() {
  if (!extruded) {
    extruded = true;
    let num: number = tileMesh.faces.length;
    for (let i: number = 0; i < num; i++) {
      tileMesh.extrude(tileMesh.faces[i]);
    }
    reloadMesh();
    loadSelections();
  }
}

function main() {

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
    
      if (sVertex.movable && !extruded) {
        let tempPt: vec3 = vec3.create();
        var temp = {pt: tempPt};
        // make sure mouse is on the selected vertex
        if (sVertex.intersect(camera.position, ray_dir, temp)) {
          tempPt = temp.pt;

          // move vertex
          let ind: number = vertices.indexOf(sVertex);
          let dist: vec3 = vec3.create();
          vec3.subtract(dist, tempPt, vertices[ind].pos);
          let forward: vec3 = vec3.create();
          var forwardRef = {forw: forward};
          vertices[ind].move(dist, forwardRef);
          forward = forwardRef.forw;

          let group: number = vertices[ind].group;
          let vertGroup: Vertex[] = tileMesh.vertMap.get(group);
          for (let i : number = 0; i < vertGroup.length; i++) {
            let indd: number = vertices.indexOf(vertGroup[i]);
            if (indd == ind) continue;
            vertices[indd].moveSym(dist, forward);
          }
          // vertices[ind].move(dist);
          sVertex = vertices[ind];


          reloadMesh();
          loadSelections();
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
        if (screenX > 1020 && screenX < 1265 && screenY < 102) {
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
  var sf = gui.addFolder('Sphere Color')
  sf.add(controls, 'Red', 0, 255);
  sf.add(controls, 'Green', 0, 255);
  sf.add(controls, 'Blue', 0, 255);

  gui.add(controls, 'SelectionMode', {Vertex: 0, Edge: 1});
  gui.add(controls, 'MoveVerts');
  gui.add(controls, 'Add Vertex');
  gui.add(controls, 'Extrude');


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
    if (controls.Red != red) {
      red = controls.Red;
      reloadMesh();
    }
    if (controls.Green != green) {
      green = controls.Green;
      reloadMesh();
    }
    if (controls.Blue != blue) {
      blue = controls.Blue;
      reloadMesh();
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
      selectVerts,
      selectHedges,
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
