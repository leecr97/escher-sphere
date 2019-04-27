import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Face from "./face";
import HalfEdge from "./halfedge";
import Vertex from "./vertex";
import * as Loader from 'webgl-obj-loader';

class TileMesh extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    colors: Float32Array;
    normals: Float32Array;

    col1: Float32Array;
    col2: Float32Array;
    col3: Float32Array;
    col4: Float32Array;

    faces: Face[] = [];
    halfEdges: HalfEdge[] = [];
    vertices: Vertex[] = [];

    objString: string;

    constructor(objString: string) {
        super(); // Call the constructor of the super class. This is required.

        this.objString = objString;
        this.readFile();
        // console.log(objString);
    }

    create() {
        let indArray: number[] = [];
        let posArray: number[] = [];
        let norArray: number[] = [];
        let colArray: number[] = [];
        let offset: number = 0;

        for (let i: number = 0; i < this.faces.length; i++) {
            let f: Face = this.faces[i];

            let start: HalfEdge = f.start_edge;
            let curr: HalfEdge = start;
            let posList: vec3[] = [];

            // find the positions of all the vertices of this face
            // and calculate the normal of the face
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

            // populate list of indices
            let numSides: number = posList.length;
            let numTris: number = numSides - 2;
            for (let j: number = 0; j < numTris; j++) {
                indArray.push(offset);
                indArray.push(offset + j + 1);
                indArray.push(offset + j + 2);
            }
            offset = offset + numSides;

            // populate list of positions and normals
            curr = start;
            let currPos: number = 0;
            do {
                // console.log("pos: " + posList[currPos][0] + ", " + posList[currPos][1] + ", " + posList[currPos][2]);
                posArray.push(posList[currPos][0], posList[currPos][1], posList[currPos][2], 1.0);
                currPos++;
                norArray.push(n[0], n[1], n[2], 0.0);
                curr = curr.next;
                colArray.push(f.color[0], f.color[1], f.color[2], 1.0);
            } while (curr != start);
        }

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
        this.generateCol();
        this.generateNor();

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

        console.log(`Created tilemesh with ` + this.faces.length + " faces and " + this.halfEdges.length + " edges and " + this.vertices.length + " vertices.");
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

    setData(f: Face[], e: HalfEdge[], v: Vertex[]) {
        this.faces = f;
        this.halfEdges = e;
        this.vertices = v;
    }

    readFile() {
        var objText = this.objString;

        let counter: number = 0;
        // a vector of vectors, where each vector contains the index data for a face.
        let faceIndices: number[][] = [];
        let verts: Vertex[] = [];

        let lines = objText.split('\n');
        for(let i: number = 0; i < lines.length; i++){
            var line = lines[i];
            if (line.startsWith("v ")) {
                var strings = line.split(" ");
                let vpos: vec3 = vec3.fromValues(Number(strings[1]), 
                                                Number(strings[2]), 
                                                Number(strings[3]));
                let newVert: Vertex = new Vertex(vpos, counter++);
                verts.push(newVert);
            }
            if (line.startsWith("f ")) {
                var strings = line.split(" ");
                let currIndices: number[] = [];
                for (let j: number = 1; j < strings.length; j++) {
                    let curr: string = strings[j];
                    var data = curr.split("/");
                    let index: number = Number(data[0]);
                    currIndices.push(index);
                }
                faceIndices.push(currIndices);
            }
        }
        faceIndices.forEach(indices => {
            // console.log("ind: " + indices);
        });
        this.vertices = verts;
        
        this.makeFaces(faceIndices);
        this.makeSyms();
        // create();
    }

    makeFaces(data: number[][]) {
        let counter: number = 0;
        let eCounter: number = 0;

        data.forEach(indices => {
            let color: vec3 = vec3.fromValues(138.0 / 255.0, 181.0 / 255.0, 252.0 / 255.0)
            // let color: vec3 = vec3.fromValues(Math.random(),
            //                                   Math.random(),
            //                                   Math.random());
            let newFace: Face = new Face(color, counter++);
    
            // console.log(indices[0] - 1);
            let start_vert: Vertex = this.vertices[indices[0] - 1];
            let curr: HalfEdge = null;
            newFace.setStartEdge(new HalfEdge(newFace, start_vert, null, eCounter++));
            start_vert.setEdge(newFace.start_edge);
            curr = newFace.start_edge;
            this.halfEdges.push(curr);
            for (let i: number = 1; i < indices.length; i++) {
                let nextVert: Vertex = this.vertices[indices[i] - 1];
                let newEdge: HalfEdge = new HalfEdge(newFace, nextVert, null, eCounter++);
                nextVert.setEdge(newEdge);
                curr.setNext(newEdge);
                curr = newEdge;
                this.halfEdges.push(curr);
            }
            curr.setNext(newFace.start_edge);
            this.faces.push(newFace);
        });
        
    }
    
    makeSyms() {
        // make a map that pairs edges to their "previous" vertices.
        let map = new Map<HalfEdge, number>();
    
        this.faces.forEach(f => {
            let start: HalfEdge = f.start_edge;
            let second: HalfEdge = start.next;
            let curr: HalfEdge = second;
            let prev: Vertex = start.vert;
            do {
                map.set(curr, prev.id);
                prev = curr.vert;
                curr = curr.next;
            } while (curr != second);
        });
    
        // Cycle through the edges and use the map to find the one that is its sym
        // If an edge goes from vertex "A" to "B", its sym should go from "B" to "A"
        this.faces.forEach(f => {
            let edgeList: HalfEdge[] = Array.from(map.keys());
            let start: HalfEdge = f.start_edge;
            let curr: HalfEdge = start;
            do {
                let A: number = map.get(curr);
                let B: number = curr.vert.id;

                for (let i: number = 0; i < edgeList.length; i++) {
                    let check: HalfEdge = edgeList[i];
                    if (check.vert.id == A) {
                        if (map.get(check) == B) {
                            curr.sym = check;
                            // console.log("sym: " + curr.sym.id);
                            break;
                        }
                    }
                }

                curr = curr.next;
            } while (curr != start);
        });
    }

}

export default TileMesh;