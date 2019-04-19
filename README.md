# Escher Sphere Construction Kit
Name: Crystal Lee

PennKey: leecr

Email: leecr@seas.upenn.edu

[Website](crystaljlee.com)

## Live Project Demo
[Link](https://leecr97.github.io/escher-sphere/)

## Project Description
This project is an implementation of the paper "Escher Sphere Construction Kit" by Jane Yen and Carlo Séquin.

The term "Escher Spheres" is used to describe spherically symmetric sculptures created by the 20th century modern artist M.C. Escher. The Escher Sphere Construction Kit is a computer-aided design program to create our own Escher Spheres by creating spherical tessellations and manipulating them using symmetry groups.

To assist in creating Escher Spheres, this project makes use of the half-edge data structure. The half-edge data structure is a way to create a manifold mesh. The naive way to create a mesh would be to explicitly connect every (i.e. each element stores all its adjacent elements.) However, this implementation is complex and slow to construct and operate on. Using the half-edge implementation, each half-edge only stores its face to its left, the next half-edge in the ring, the symmetric half edge on the face adjacent to it, and the vertex between itself and the next half-edge. Each face stores a single pointer to any one of the half edges that loops around it, and each vertex stores a pointer to one of the half edges that points to it.

## Current Progress
Currently, I have completed my implementation of the half-edge data structure, which I have tested by manually creating a mesh of a square with two identical triangular faces. I have also implemented the ability to select an edge, face, or vertex, although for now the selected elements are hardcoded and cannot be changed.

Further work: 
-Selecting and moving vertices, with corresponding vertices moving on corresponding faces. 
-Adding new vertices onto edges, with matching vertices being added onto other edges.
-Creating a half-edge structure from an icospheric mesh.
-Giving the user the ability to choose symmetry groups.

## Images
The half-edge mesh, with the bottom-most triangular face and the top-most edge selected.
![](images/progress1.png)
The bottom vertex is also selected, but the point is too small to be easily visible at the moment.

## References
[Escher Sphere Construction Kit](https://github.com/leecr97/escher-sphere/blob/master/EscherSphere.pdf) by Jane Yen and Carlo Séquin