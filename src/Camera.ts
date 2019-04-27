var CameraControls = require('3d-view-controls');
import {vec3, mat4, vec2} from 'gl-matrix';

class Camera {
  controls: any;
  projectionMatrix: mat4 = mat4.create();
  viewMatrix: mat4 = mat4.create();
  fovy: number = 45;
  aspectRatio: number = 1;
  near: number = 0.1;
  far: number = 1000;
  position: vec3 = vec3.create();
  direction: vec3 = vec3.create();
  target: vec3 = vec3.create();
  up: vec3 = vec3.create();
  right: vec3 = vec3.create();
  forward: vec3 = vec3.create();

  width: number;
  height: number;

  constructor(position: vec3, target: vec3) {
    const canvas = <HTMLCanvasElement> document.getElementById('canvas');

    this.controls = CameraControls(canvas, {
      eye: position,
      center: target,
    });

    vec3.add(this.target, this.position, this.direction);
    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);

    this.position = this.controls.eye;
    this.up = this.controls.up;
    vec3.subtract(this.forward, this.target, this.position);
    vec3.normalize(this.forward, this.forward);
    vec3.cross(this.right, this.forward, this.up);
    vec3.normalize(this.right, this.right);
  }

  setAspectRatio(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
  }

  setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  updateProjectionMatrix() {
    mat4.perspective(this.projectionMatrix, this.fovy, this.aspectRatio, this.near, this.far);
  }

  update() {
    this.controls.tick();

    vec3.add(this.target, this.position, this.direction);
    this.position = vec3.fromValues(this.controls.eye[0], this.controls.eye[1], this.controls.eye[2]);
    this.target = vec3.fromValues(this.controls.center[0], this.controls.center[1], this.controls.center[2]);
    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);

    this.position = this.controls.eye;
    this.up = vec3.fromValues(this.controls.up[0], this.controls.up[1], this.controls.up[2]);
    vec3.normalize(this.up, this.up);
    vec3.subtract(this.forward, this.target, this.position);
    vec3.normalize(this.forward, this.forward);
    vec3.cross(this.right, this.forward, this.up);
    vec3.normalize(this.right, this.right);
    vec3.cross(this.up, this.right, this.forward);
    vec3.normalize(this.up, this.up);
  }

  // raycast(pt: vec2): vec3
  // {
  //     return this.raycast(pt[0], pt[1]);
  // }

  raycast(x: number, y: number): vec3
  {
    let ndc_x: number = (2 * x/this.width - 1);
    let ndc_y: number = (1 - 2 * y/this.height);
    return this.raycastNDC(ndc_x, ndc_y);
  }

  raycastNDC(ndc_x: number, ndc_y: number): vec3
  {
    let dir: vec3 = vec3.create()
    vec3.subtract(dir, this.target, this.position);
    let len: number = vec3.length(dir);

    let R: vec3 = vec3.create();
    vec3.cross(R, dir, this.up);
    vec3.normalize(R, R);
    let V: vec3 = vec3.create();
    vec3.scale(V, this.up, Math.tan(this.fovy / 2.0) * len);
    let H: vec3 = vec3.create();
    vec3.scale(H, R, this.aspectRatio * len * Math.tan(this.fovy / 2.0));

    let P: vec3 = vec3.create();
    vec3.scale(H, H, ndc_x);
    vec3.scale(V, V, ndc_y);
    vec3.add(P, this.target, H);
    vec3.add(P, P, V);

    let result: vec3 = vec3.create();
    vec3.subtract(result, P, this.position);
    vec3.normalize(result, result);
    return result;
  }
};

export default Camera;
