/**
 * Created by Alex Bol on 3/15/2017.
 */


"use strict";

import Flatten from '../flatten';
import {ray_shoot} from "../algorithms/ray_shooting";
import * as Intersection from "../algorithms/intersection";
import * as Relations from "../algorithms/relation";

/**
 * Class representing a polygon.<br/>
 * Polygon in FlattenJS is a multipolygon comprised from a set of [faces]{@link Flatten.Face}. <br/>
 * Face, in turn, is a closed loop of [edges]{@link Flatten.Edge}, where edge may be segment or circular arc<br/>
 * @type {Polygon}
 */
export class Polygon {
    /**
     * Constructor creates new instance of polygon. With no arguments new polygon is empty.<br/>
     * Constructor accepts as argument array that define loop of shapes
     * or array of arrays in case of multi polygon <br/>
     * Loop may be defined in different ways: <br/>
     * - array of shapes of type Segment or Arc <br/>
     * - array of points (Flatten.Point) <br/>
     * - array of numeric pairs which represent points <br/>
     * - box or circle object <br/>
     * Alternatively, it is possible to use polygon.addFace method
     * @param {args} - array of shapes or array of arrays
     */
    constructor(...args) {
        /**
         * Container of faces (closed loops), may be empty
         * @type {PlanarSet}
         */
        this.faces = new Flatten.PlanarSet();
        /**
         * Container of edges
         * @type {PlanarSet}
         */
        this.edges = new Flatten.PlanarSet();

        /* It may be array of something that may represent one loop (face) or
         array of arrays that represent multiple loops
         */
        if (args.length === 1 &&
            (args[0] instanceof Array || args[0] instanceof Flatten.Circle || args[0] instanceof Flatten.Box)){
            let argsArray = args[0];
            if (args[0] instanceof Array && argsArray.every((loop) => {return loop instanceof Array})) {
                if  (argsArray.every( el => {return el instanceof Array && el.length === 2 && typeof(el[0]) === "number" && typeof(el[1]) === "number"} )) {
                    this.faces.add(new Flatten.Face(this, argsArray));    // one-loop polygon as array of pairs of numbers
                }
                else {
                    for (let loop of argsArray) {   // multi-loop polygon
                        this.faces.add(new Flatten.Face(this, loop));
                    }
                }
            }
            else {
                this.faces.add(new Flatten.Face(this, argsArray));    // one-loop polygon
            }
        }
    }

    /**
     * (Getter) Returns bounding box of the polygon
     * @returns {Box}
     */
    get box() {
        return [...this.faces].reduce((acc, face) => acc.merge(face.box), new Flatten.Box());
    }

    /**
     * (Getter) Returns array of vertices
     * @returns {Array}
     */
    get vertices() {
        return [...this.edges].map(edge => edge.start);
    }

    /**
     * Create new cloned instance of the polygon
     * @returns {Polygon}
     */
    clone() {
        let polygon = new Polygon();
        for (let face of this.faces) {
            polygon.addFace(face.shapes);
        }
        return polygon;
    }

    /**
     * Return true is polygon has no edges
     * @returns {boolean}
     */
    isEmpty() {
        return this.edges.size === 0;
    }

    /**
     * Return true if polygon is valid for boolean operations
     * Polygon is valid if <br/>
     * 1. All faces are simple polygons (there are no self-intersected polygons) <br/>
     * 2. All faces are orientable and there is no island inside island or hole inside hole - TODO <br/>
     * 3. There is no intersections between faces (excluding touching) - TODO <br/>
     * @returns {boolean}
     */
    isValid() {
        let valid = true;
        // 1. Polygon is invalid if at least one face is not simple
        for (let face of this.faces) {
            if (!face.isSimple(this.edges)) {
                valid = false;
                break;
            }
        }
        // 2. TODO: check if no island inside island and no hole inside hole
        // 3. TODO: check the there is no intersection between faces
        return valid;
    }

    /**
     * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
     * @returns {number}
     */
    area() {
        let signedArea = [...this.faces].reduce((acc, face) => acc + face.signedArea(), 0);
        return Math.abs(signedArea);
    }

    /**
     * Add new face to polygon. Returns added face
     * @param {Points[]|Segments[]|Arcs[]|Circle|Box} args -  new face may be create with one of the following ways: <br/>
     * 1) array of points that describe closed path (edges are segments) <br/>
     * 2) array of shapes (segments and arcs) which describe closed path <br/>
     * 3) circle - will be added as counterclockwise arc <br/>
     * 4) box - will be added as counterclockwise rectangle <br/>
     * You can chain method face.reverse() is you need to change direction of the creates face
     * @returns {Face}
     */
    addFace(...args) {
        let face = new Flatten.Face(this, ...args);
        this.faces.add(face);
        return face;
    }

    /**
     * Delete existing face from polygon
     * @param {Face} face Face to be deleted
     * @returns {boolean}
     */
    deleteFace(face) {
        for (let edge of face) {
            let deleted = this.edges.delete(edge);
        }
        let deleted = this.faces.delete(face);
        return deleted;
    }

    /**
     * Delete chain of edges from the face.
     * @param {Face} face Face to remove chain
     * @param {Edge} edgeFrom Start of the chain of edges to be removed
     * @param {Edge} edgeTo End of the chain of edges to be removed
     */
    removeChain(face, edgeFrom, edgeTo) {
        // Special case: all edges removed
        if (edgeTo.next === edgeFrom) {
            this.deleteFace(face);
            return;
        }
        for (let edge = edgeFrom; edge !== edgeTo.next; edge = edge.next) {
            face.remove(edge);
            this.edges.delete(edge);      // delete from PlanarSet of edges and update index
            if (face.isEmpty()) {
                this.deleteFace(face);    // delete from PlanarSet of faces and update index
                break;
            }
        }
    }

    /**
     * Add point as a new vertex and split edge. Point supposed to belong to an edge.
     * When edge is split, new edge created from the start of the edge to the new vertex
     * and inserted before current edge.
     * Current edge is trimmed and updated.
     * Method returns new edge added. If no edge added, it returns edge before vertex
     * @param {Edge} edge Edge to be split with new vertex and then trimmed from start
     * @param {Point} pt Point to be added as a new vertex
     * @returns {Edge}
     */
    addVertex(pt, edge) {
        let shapes = edge.shape.split(pt);
        // if (shapes.length < 2) return;

        if (shapes[0] === null)   // point incident to edge start vertex, return previous edge
            return edge.prev;

        if (shapes[1] === null)   // point incident to edge end vertex, return edge itself
            return edge;

        let newEdge = new Flatten.Edge(shapes[0]);
        let edgeBefore = edge.prev;

        /* Insert first split edge into linked list after edgeBefore */
        edge.face.insert(newEdge, edgeBefore);

        // Insert new edge to the edges container and 2d index
        this.edges.add(newEdge);

        // Remove old edge from edges container and 2d index
        this.edges.delete(edge);

        // Update edge shape with second split edge keeping links
        edge.shape = shapes[1];

        // Add updated edge to the edges container and 2d index
        this.edges.add(edge);

        return newEdge;
    }

    /**
     * Cut polygon with line and return array of new polygons
     * @param {Multiline} multiline
     * @returns {Polygon[]}
     */
    cut(multiline) {
        let cutPolygons = [this.clone()];
        for (let edge of multiline) {
            if (edge.setInclusion(this) !== Flatten.INSIDE)
                continue;

            let cut_edge_start = edge.shape.start;
            let cut_edge_end = edge.shape.end;

            let newCutPolygons = [];
            for (let polygon of cutPolygons) {
                if (polygon.findEdgeByPoint(cut_edge_start) === undefined) {
                    newCutPolygons.push(polygon);
                }
                else {
                    let [cutPoly1, cutPoly2] = polygon.cutFace(cut_edge_start, cut_edge_end);
                    newCutPolygons.push(cutPoly1, cutPoly2);
                }
            }
            cutPolygons = newCutPolygons;
        }
        return cutPolygons;
    }

    /**
     * Cut face of polygon with a segment between two points and create two new polygons
     * Supposed that a segments between points does not intersect any other edge
     * @param {Point} pt1
     * @param {Point} pt2
     * @returns {Polygon[]}
     */
    cutFace(pt1, pt2) {
        let edge1 = this.findEdgeByPoint(pt1);
        let edge2 = this.findEdgeByPoint(pt2);
        if (edge1.face != edge2.face) return;

        // Cut face into two and create new polygon with two faces
        let edgeBefore1 = this.addVertex(pt1, edge1);
        edge2 = this.findEdgeByPoint(pt2);
        let edgeBefore2 = this.addVertex(pt2, edge2);

        let face = edgeBefore1.face;
        let newEdge1 = new Flatten.Edge(
            new Flatten.Segment(edgeBefore1.end, edgeBefore2.end)
        );
        let newEdge2 = new Flatten.Edge(
            new Flatten.Segment(edgeBefore2.end, edgeBefore1.end)
        );

        // Swap links
        edgeBefore1.next.prev = newEdge2;
        newEdge2.next = edgeBefore1.next;

        edgeBefore1.next = newEdge1;
        newEdge1.prev = edgeBefore1;

        edgeBefore2.next.prev = newEdge1;
        newEdge1.next = edgeBefore2.next;

        edgeBefore2.next = newEdge2;
        newEdge2.prev = edgeBefore2;

        // Insert new edge to the edges container and 2d index
        this.edges.add(newEdge1);
        this.edges.add(newEdge2);

        // Add two new faces
        let face1 = this.addFace(newEdge1, edgeBefore1);
        let face2 = this.addFace(newEdge2, edgeBefore2);

        // Remove old face
        this.faces.delete(face);

        return [face1.toPolygon(), face2.toPolygon()];
    }

    /**
     * Returns the first founded edge of polygon that contains given point
     * @param {Point} pt
     * @returns {Edge}
     */
    findEdgeByPoint(pt) {
        let edge;
        for (let face of this.faces) {
            edge = face.findEdgeByPoint(pt);
            if (edge != undefined)
                break;
        }
        return edge;
    }

    /**
     * Split polygon into array of polygons, where each polygon is an island with all
     * hole that it contains
     * @returns {Flatten.Polygon[]}
     */
    splitToIslands() {
        let polygons = this.toArray();      // split into array of one-loop polygons
        /* Sort polygons by area in descending order */
        polygons.sort( (polygon1, polygon2) => polygon2.area() - polygon1.area() );
        /* define orientation of the island by orientation of the first polygon in array */
        let orientation = [...polygons[0].faces][0].orientation();
        /* Create output array from polygons with same orientation as a first polygon (array of islands) */
        let newPolygons = polygons.filter( polygon => [...polygon.faces][0].orientation() === orientation);
        for (let polygon of polygons) {
            let face = [...polygon.faces][0];
            if (face.orientation() === orientation) continue;  // skip same orientation
            /* Proceed with opposite orientation */
            /* Look if any of island polygons contains tested polygon as a hole */
            for (let islandPolygon of newPolygons) {
                if (face.shapes.every(shape => islandPolygon.contains(shape))) {
                    islandPolygon.addFace(face.shapes);      // add polygon as a hole in islandPolygon
                    break;
                }
            }
        }
        // TODO: assert if not all polygons added into output
        return newPolygons;
    }

    /**
     * Reverse orientation of all faces to opposite
     * @returns {Polygon}
     */
    reverse() {
        for (let face of this.faces) {
            face.reverse();
        }
        return this;
    }

    /**
     * Returns true if polygon contains shape: no point of shape lies outside of the polygon,
     * false otherwise
     * @param {Shape} shape - test shape
     * @returns {boolean}
     */
    contains(shape) {
        if (shape instanceof Flatten.Point) {
            let rel = ray_shoot(this, shape);
            return rel === Flatten.INSIDE || rel === Flatten.BOUNDARY;
        }
        else {
            return Relations.cover(this, shape);
        }
    }

    /**
     * Return middle point of the polygon
     * @returns {Point}
     */
    middle() {
        let xsum = 0
        let ysum = 0;
        this.vertices.forEach((vertex) => {
            xsum += vertex.x;
            ysum += vertex.y;
        });

        const len = this.vertices.length;
        return new Flatten.Point(xsum/len, ysum/len);
    }

    /**
     * Return distance and shortest segment between polygon and other shape as array [distance, shortest_segment]
     * @param {Shape} shape Shape of one of the types Point, Circle, Line, Segment, Arc or Polygon
     * @returns {Number | Segment}
     */
    distanceTo(shape) {
        // let {Distance} = Flatten;

        if (shape instanceof Flatten.Point) {
            let [dist, shortest_segment] = Flatten.Distance.point2polygon(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        if (shape instanceof Flatten.Circle ||
            shape instanceof Flatten.Line ||
            shape instanceof Flatten.Segment ||
            shape instanceof Flatten.Arc) {
            let [dist, shortest_segment] = Flatten.Distance.shape2polygon(shape, this);
            shortest_segment = shortest_segment.reverse();
            return [dist, shortest_segment];
        }

        /* this method is bit faster */
        if (shape instanceof Flatten.Polygon) {
            let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Flatten.Segment()];
            let dist, shortest_segment;

            for (let edge of this.edges) {
                // let [dist, shortest_segment] = Distance.shape2polygon(edge.shape, shape);
                let min_stop = min_dist_and_segment[0];
                [dist, shortest_segment] = Flatten.Distance.shape2planarSet(edge.shape, shape.edges, min_stop);
                if (Flatten.Utils.LT(dist, min_stop)) {
                    min_dist_and_segment = [dist, shortest_segment];
                }
            }
            return min_dist_and_segment;
        }
    }

    /**
     * Return array of intersection points between polygon and other shape
     * @param shape Shape of the one of supported types <br/>
     * @returns {Point[]}
     */
    intersect(shape) {
        if (shape instanceof Flatten.Point) {
            return this.contains(shape) ? [shape] : [];
        }

        if (shape instanceof Flatten.Line) {
            return Intersection.intersectLine2Polygon(shape, this);
        }

        if (shape instanceof Flatten.Circle) {
            return Intersection.intersectCircle2Polygon(shape, this);
        }

        if (shape instanceof Flatten.Segment) {
            return Intersection.intersectSegment2Polygon(shape, this);
        }

        if (shape instanceof Flatten.Arc) {
            return Intersection.intersectArc2Polygon(shape, this);
        }

        if (shape instanceof Flatten.Polygon) {
            return Intersection.intersectPolygon2Polygon(shape, this);
        }
    }

    /**
     * Returns new polygon translated by vector vec
     * @param {Vector} vec
     * @returns {Polygon}
     */
    translate(vec) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map( shape => shape.translate(vec)));
        }
        return newPolygon;
    }

    /**
     * Return new polygon rotated by given angle around given point
     * If point omitted, rotate around origin (0,0)
     * Positive value of angle defines rotation counter clockwise, negative - clockwise
     * @param {number} angle - rotation angle in radians
     * @param {Point} center - rotation center, default is (0,0)
     * @returns {Polygon} - new rotated polygon
     */
    rotate(angle = 0, center = new Flatten.Point()) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map( shape => shape.rotate(angle, center)));
        }
        return newPolygon;
    }

    /**
     * Return new polygon transformed using affine transformation matrix
     * @param {Matrix} matrix - affine transformation matrix
     * @returns {Polygon} - new polygon
     */
    transform(matrix = new Flatten.Matrix()) {
        let newPolygon = new Polygon();
        for (let face of this.faces) {
            newPolygon.addFace(face.shapes.map( shape => shape.transform(matrix)));
        }
        return newPolygon;
    }

    /**
     * This method returns an object that defines how data will be
     * serialized when called JSON.stringify() method
     * @returns {Object}
     */
    toJSON() {
        return [...this.faces].map(face => face.toJSON());
    }

    /**
     * Transform all faces into array of polygons
     * @returns {Flatten.Polygon[]}
     */
    toArray() {
        return [...this.faces].map(face => face.toPolygon());
    }

    /**
     * Return string to draw polygon in svg
     * @param attrs  - an object with attributes for svg path element,
     * like "stroke", "strokeWidth", "fill", "fillRule", "fillOpacity"
     * Defaults are stroke:"black", strokeWidth:"1", fill:"lightcyan", fillRule:"evenodd", fillOpacity: "1"
     * @returns {string}
     */
    svg(attrs = {}) {
        let {stroke, strokeWidth, fill, fillRule, fillOpacity, id, className} = attrs;
        // let restStr = Object.keys(rest).reduce( (acc, key) => acc += ` ${key}="${rest[key]}"`, "");
        let id_str = (id && id.length > 0) ? `id="${id}"` : "";
        let class_str = (className && className.length > 0) ? `class="${className}"` : "";

        let svgStr = `\n<path stroke="${stroke || "black"}" stroke-width="${strokeWidth || 1}" fill="${fill || "lightcyan"}" fill-rule="${fillRule || "evenodd"}" fill-opacity="${fillOpacity || 1.0}" ${id_str} ${class_str} d="`;
        for (let face of this.faces) {
            svgStr += face.svg();
        }
        svgStr += `" >\n</path>`;
        return svgStr;
    }
}

Flatten.Polygon = Polygon;

/**
 * Shortcut method to create new polygon
 */
export const polygon = (...args) => new Flatten.Polygon(...args);
Flatten.polygon = polygon;

