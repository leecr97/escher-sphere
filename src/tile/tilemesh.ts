import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import Face from "./face";
import HalfEdge from "./halfedge";
import Vertex from "./vertex";

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

    vertCount: number = 0;
    edgeCount: number = 0;
    faceCount: number = 0;

    edgeMap: Map<number, HalfEdge[]>;
    vertMap: Map<number, Vertex[]>;

    constructor(objString: string) {
        super(); // Call the constructor of the super class. This is required.

        this.objString = objString;
        this.edgeMap = new Map<number, HalfEdge[]>();
        this.vertMap = new Map<number, Vertex[]>();

        this.readFile();
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
        // this.colors = new Float32Array(colArray);

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

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        // gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        // console.log(`Created tilemesh with ` + this.faces.length + " faces and " + this.halfEdges.length + " edges and " + this.vertices.length + " vertices.");
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

    setData(f: Face[], e: HalfEdge[], v: Vertex[]) {
        this.faces = f;
        this.halfEdges = e;
        this.vertices = v;
        this.create();
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
                newVert.setMovable(false);
                newVert.setGroup(0);
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
        this.vertices = verts;
        this.vertCount = counter;
        this.vertMap.set(0, verts);
        
        this.makeFaces(faceIndices);
        this.makeSyms();
        // create();
    }

    makeFaces(data: number[][]) {
        let counter: number = 0;
        let eCounter: number = 0;

        for (let i: number = 0; i < data[0].length; i++) {
            let edgeArray: HalfEdge[] = [];
            this.edgeMap.set(i, edgeArray);
        }

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
            curr.setGroup(0);
            this.edgeMap.get(0).push(curr);
            this.halfEdges.push(curr);
            for (let i: number = 1; i < indices.length; i++) {
                // console.log("edge group: " + i);
                let nextVert: Vertex = this.vertices[indices[i] - 1];
                let newEdge: HalfEdge = new HalfEdge(newFace, nextVert, null, eCounter++);

                nextVert.setEdge(newEdge);
                curr.setNext(newEdge);
                curr = newEdge;
                curr.setGroup(i);
                this.edgeMap.get(i).push(curr);
                this.halfEdges.push(curr);
            }
            curr.setNext(newFace.start_edge);
            this.faces.push(newFace);
        });
        
        this.edgeCount = eCounter;
        this.faceCount = counter;
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

    splitEdge(he1: HalfEdge): Vertex
    {
        let ret: Vertex;
        let newVerts: Vertex[] = [];
        let vertGroup: number = this.vertMap.size;
        let newHedges: HalfEdge[] = []
        let edgeGroup: number = this.edgeMap.size;
        
        let he2: HalfEdge = he1.sym;
        let V1: Vertex = he1.vert;
        let V2: Vertex = he2.vert;
        let avePos: vec3 = vec3.fromValues(((V1.pos[0] + V2.pos[0]) / 2),
                ((V1.pos[1] + V2.pos[1]) / 2),
                ((V1.pos[2] + V2.pos[2]) / 2));
        let V3: Vertex = new Vertex(avePos, this.vertCount++);
        V3.setMovable(true);
        V3.setGroup(vertGroup);
        newVerts.push(V3);
        this.vertices.push(V3);
        ret = V3;

        let he1b: HalfEdge = new HalfEdge(null, null, null, this.edgeCount++);
        let he2b: HalfEdge = new HalfEdge(null, null, null, this.edgeCount++);
        he1b.setGroup(edgeGroup);
        he2b.setGroup(edgeGroup);
        newHedges.push(he1b);
        newHedges.push(he2b);
        this.halfEdges.push(he1b);
        this.halfEdges.push(he2b);
        
        he1b.vert = he1.vert;
        he2b.vert = he2.vert;
        he1b.face = he1.face;
        he2b.face = he2.face;
        he1b.next = he1.next;
        he2b.next = he2.next;
        he1.next = he1b;
        he2.next = he2b;
        he1.vert = V3;
        V3.setEdge(he1);
        he2.vert = V3;
        he1.sym = he2b;
        he2b.sym = he1;
        he2.sym = he1b;
        he1b.sym = he2;

        let num: number = he1.group;
        let hedgeGroup: HalfEdge[] = this.edgeMap.get(num);

        for (let i: number = 0; i < hedgeGroup.length; i++) {
            let he11: HalfEdge = hedgeGroup[i];
            if (he11.id == he1.id) continue;

            let he21: HalfEdge = he11.sym;
            let V11: Vertex = he11.vert;
            let V21: Vertex = he21.vert;
            let avePos1: vec3 = vec3.fromValues(((V11.pos[0] + V21.pos[0]) / 2),
                    ((V11.pos[1] + V21.pos[1]) / 2),
                    ((V11.pos[2] + V21.pos[2]) / 2));
            let V31: Vertex = new Vertex(avePos1, this.vertCount++);
            V31.setMovable(true);
            V31.setGroup(vertGroup);
            newVerts.push(V31);
            this.vertices.push(V31);

            let he1b1: HalfEdge = new HalfEdge(null, null, null, this.edgeCount++);
            let he2b1: HalfEdge = new HalfEdge(null, null, null, this.edgeCount++);
            he1b1.setGroup(edgeGroup);
            he2b1.setGroup(edgeGroup);
            newHedges.push(he1b1);
            newHedges.push(he2b1);
            this.halfEdges.push(he1b1);
            this.halfEdges.push(he2b1);

            he1b1.vert = he11.vert;
            he2b1.vert = he21.vert;
            he1b1.face = he11.face;
            he2b1.face = he21.face;
            he1b1.next = he11.next;
            he2b1.next = he21.next;
            he11.next = he1b1;
            he21.next = he2b1;
            he11.vert = V31;
            V31.setEdge(he11);
            he21.vert = V31;
            he11.sym = he2b1;
            he2b1.sym = he11;
            he21.sym = he1b1;
            he1b1.sym = he21;
        }

        this.vertMap.set(vertGroup, newVerts);
        this.edgeMap.set(edgeGroup, newHedges);

        return ret;
    }

    extrude(f: Face) {
        // set up edge and vert map stuff
        let edgeNum: number = this.edgeMap.size;
        let vertNum: number = this.vertMap.size;

        // extrude
        let center: vec3 = f.getCenter();
        let start: HalfEdge = f.start_edge;
        let h0: HalfEdge = start;

        //find direction for extrusion and multiply by magnitude of variable
        let pos1: vec3 = h0.vert.pos;
        let pos2: vec3 = h0.next.vert.pos;
        let pos3: vec3 = h0.next.next.vert.pos;
        let norm: vec3 = vec3.create();
        let v32: vec3 = vec3.create();
        vec3.subtract(v32, pos3, pos2);
        let v12: vec3 = vec3.create();
        vec3.subtract(v12, pos1, pos2);
        vec3.cross(norm, v32, v12);
        let extrusionMag: number = 0.1;
        let vecChangePos: vec4 = vec4.fromValues(norm[0]*extrusionMag,
                                                 norm[1]*extrusionMag,
                                                 norm[2]*extrusionMag,
                                                 0.0);

        //prev values to be set for later iterations of the while loop
        let prevV2: Vertex = null;
        let prevH3: HalfEdge = null;

        let firstH5: HalfEdge = null;
        let firstV3: Vertex = null;

        let first: boolean = true;
        let counter: number = 0;
        while (first || h0.id != start.id) {
            let eGroup: HalfEdge[] = this.edgeMap.get(edgeNum + counter);
            if (eGroup == null) {
                eGroup = [];
                this.edgeMap.set(edgeNum + counter, eGroup);
            }
            let vGroup: Vertex[] = this.vertMap.get(vertNum + counter);
            if (vGroup == null) {
                vGroup = [];
                this.vertMap.set(vertNum + counter, vGroup);
            }

            //checking if this is the last iteration of the loop
            let last: boolean = h0.next.id == start.id;
            //h0 is the current to be extruded face's current edge

            //h1 is h0's original sym
            let h1: HalfEdge = h0.sym;
            //v0 is h0's original vertex
            let v0: Vertex = h0.vert;
            //v1 will be h1's original vertex
            let v1: Vertex = h1.vert;
            //v2 will be set to v1 with the added extruded position
            let prevPos: vec4 = vec4.fromValues(v0.pos[0], v0.pos[1], v0.pos[2], 1.0);
            let dirCenter: vec3 = vec3.create();
            vec3.subtract(dirCenter, center, v0.pos);
            vec3.normalize(dirCenter, dirCenter);
            vec3.scale(dirCenter, dirCenter, 0.05);
            vec4.add(prevPos, prevPos, vec4.fromValues(dirCenter[0], dirCenter[1], dirCenter[2], 0.0));

            let extrudedPos: vec4 = vec4.create();
            vec4.add(extrudedPos, prevPos, vecChangePos);

            let vertexIter: number = this.vertices.length;
            vertexIter += 1; //bc the obj file indexing starts at 1 instead of 0
            let v2: Vertex = null;
            if (last) {
                v2 = firstV3;
            } else {
                v2 = new Vertex(vec3.fromValues(extrudedPos[0], extrudedPos[1], extrudedPos[2]),
                        vertexIter+1); //having v2 with higher index count bc will be stored in next iter
                v2.setMovable(false);
                v2.setGroup(vertNum + counter);
                this.vertMap.get(vertNum + counter).push(v2);
            }

            //v3 will be set to a previous iterations v2
            let v3: Vertex = null;
            if (first) {
                //create new vertex since its previous was never created
                let prevPos: vec4 = vec4.fromValues(v1.pos[0], v1.pos[1], v1.pos[2], 1.0);
                let dirCenter: vec3 = vec3.create();
                vec3.subtract(dirCenter, center, v1.pos);
                vec3.normalize(dirCenter, dirCenter);
                vec3.scale(dirCenter, dirCenter, 0.05);
                vec4.add(prevPos, prevPos, vec4.fromValues(dirCenter[0], dirCenter[1], dirCenter[2], 0.0));

                let extrudedPos: vec4 = vec4.create();
                vec4.add(extrudedPos, prevPos, vecChangePos);
                v3 = new Vertex(vec3.fromValues(extrudedPos[0], extrudedPos[1], extrudedPos[2]),
                                        vertexIter);
                v3.setMovable(false);
                v3.setGroup(vertNum + counter);
                this.vertMap.get(vertNum + counter).push(v3);
            } else {
                //otherwise just set to prev iteration's v2 (to keep the faces joined)
                v3 = prevV2;
            }

            //create new half edges h3, h4, h5, h6
            let halfEdgeIdIter: number = this.halfEdges.length;
            halfEdgeIdIter += 1;
            let h3: HalfEdge = new HalfEdge(null, null, null, halfEdgeIdIter);
            let h4: HalfEdge = new HalfEdge(null, null, null, halfEdgeIdIter+1);
            let h5: HalfEdge = new HalfEdge(null, null, null, halfEdgeIdIter+2);
            let h6: HalfEdge = new HalfEdge(null, null, null, halfEdgeIdIter+3);
            h3.setGroup(edgeNum + counter);
            this.edgeMap.get(edgeNum + counter).push(h3);
            h4.setGroup(edgeNum + counter);
            this.edgeMap.get(edgeNum + counter).push(h4);
            h5.setGroup(edgeNum + counter);
            this.edgeMap.get(edgeNum + counter).push(h5);
            h6.setGroup(edgeNum + counter);
            this.edgeMap.get(edgeNum + counter).push(h6);

            //h0 will point to v2
            h0.setVertex(v2);
            //h3 will point to v2
            //h4 will point to v3
            //h5 will point to v1
            //h6 will point to v0
            h3.setVertex(v2);
            h4.setVertex(v3);
            h5.setVertex(v1);
            h6.setVertex(v0);

            //(reciprical actions)
            //h0 will be sym with h4
            //h6 will be sym with h1
            //h5 will be sym with h3 from prev iteration
            //h3 will be sym with next iteration h5
            h0.setSym(h4);
            h4.setSym(h0);
            h6.setSym(h1);
            h1.setSym(h6);
            if (!first) { //aka prevH3 is not null then
                h5.setSym(prevH3);
                prevH3.setSym(h5);
            }
            //h3 will be handled in next iteration
            //but if last iteration, then handle now
            if (last) {
                h3.setSym(firstH5);
                firstH5.setSym(h3);
            }

            //h3's next is h4
            //h4's next is h5
            //h5's next is h6
            //h6's next is h3
            h3.setNext(h4);
            h4.setNext(h5);
            h5.setNext(h6);
            h6.setNext(h3);

            //face will be added whose start edge is h4 and color is random
            //create new Face
            let color: vec3 = vec3.fromValues(153.0 / 255.0, 191.0 / 255.0, 255.0 / 255.0);
            let faceIter: number = this.faces.length;
            faceIter += 1;
            let face: Face = new Face(color, faceIter);
            face.setStartEdge(h4);

            //h3 will point to face
            //h4 will point to face
            //h5 will point to face
            //h6 will point to face
            h3.setFace(face);
            h4.setFace(face);
            h5.setFace(face);
            h6.setFace(face);

            //add h3 to mesh
            //add h4 to mesh
            //add h5 to mesh
            //add h6 to mesh
            //add v2 to mesh
            //add face to mesh
            this.halfEdges.push(h3);
            this.halfEdges.push(h4);
            this.halfEdges.push(h5);
            this.halfEdges.push(h6);
            this.vertices.push(v3); //dont do v2 bc it will stored in the next iter
            this.faces.push(face);

            //if first update first h5 and first v3
            if (first) {
                firstH5 = h5;
                firstV3 = v3;
            }
            //iterate h0
            h0 = h0.next;
            //set prevV2 for next iteration
            prevV2 = v2;
            //set prevH3 for next iteration to the current h3
            prevH3 = h3;

            first = false;
            counter++;
        }

        // geom_halfMesh.create();
        // hFace.create();
        // hHEdge.create();
        // hVert.create();
        // this.update();
    }

}

export default TileMesh;