'use strict';

import Flatten from '../../index';

import {Point, Vector, Circle, Line, Segment, Arc, Box, Polygon, Edge, Face, Ray} from '../../index';
import {point, vector, circle, line, segment, arc, ray} from '../../index';

describe('#Flatten.Arc', function() {
    it('May create new instance of Arc', function () {
        let arc = new Arc();
        expect(arc).toBeInstanceOf(Arc);
    });
    it('Default constructor constructs full circle unit arc with zero center and sweep 2PI CCW', function() {
        let arc = new Arc();
        expect(arc.pc).toEqual({x: 0, y: 0});
        expect(arc.sweep).toEqual(Flatten.PIx2);
        expect(arc.counterClockwise).toEqual(Flatten.CCW);
    });
    it('Constructor creates CCW arc if parameter counterClockwise is omitted', function () {
        let arc = new Arc(new Point(), 1, Math.PI/4, 3*Math.PI/4);
        expect(arc.sweep).toEqual(Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CCW);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true 1', function () {
        let arc = new Arc(new Point(), 1, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        expect(arc.sweep).toEqual(Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CCW);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true 2', function () {
        let arc = new Arc(new Point(), 1, 3*Math.PI/4, Math.PI/4, Flatten.CCW);
        expect(arc.sweep).toEqual(3*Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CCW);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true 3', function () {
        let arc = new Arc(new Point(3,4), 1, Math.PI/4, -Math.PI/4, Flatten.CCW);
        expect(arc.sweep).toEqual(3*Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CCW);
    });
    it('Constructor can create different CCW arcs if counterClockwise=true 4', function () {
        let arc = new Arc(new Point(2,-2), 1, -Math.PI/4, Math.PI/4, Flatten.CCW);
        expect(arc.sweep).toEqual(Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CCW);
    });
    it('Constructor can create different CW arcs if counterClockwise=false 1', function () {
        let arc = new Arc(new Point(), 1, Math.PI/4, 3*Math.PI/4, Flatten.CW);
        expect(arc.sweep).toEqual(3*Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CW);
    });
    it('Constructor can create different CW arcs if counterClockwise=false 2', function () {
        let arc = new Arc(new Point(), 1, 3*Math.PI/4, Math.PI/4, Flatten.CW);
        expect(arc.sweep).toEqual(Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CW);
    });
    it('Constructor can create different CW arcs if counterClockwise=false 3', function () {
        let arc = new Arc(new Point(3,4), 1, Math.PI/4, -Math.PI/4, Flatten.CW);
        expect(arc.sweep).toEqual(Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CW);
    });
    it('Constructor can create different CW arcs if counterClockwise=false 4', function () {
        let arc = new Arc(new Point(2,-2), 1, -Math.PI/4, Math.PI/4, Flatten.CW);
        expect(arc.sweep).toEqual(3*Math.PI/2);
        expect(arc.counterClockwise).toEqual(Flatten.CW);
    });
    it('In order to construct full circle, set end_angle = start_angle + 2pi', function () {
        let arc = new Arc(new Point(), 5, Math.PI, 3*Math.PI, true);
        expect(arc.sweep).toEqual(2*Math.PI);
    });
    it('Constructor creates zero arc when end_angle = start_angle', function () {
        let arc = new Arc(new Point(), 5, Math.PI/4, Math.PI/4, true);
        expect(arc.sweep).toEqual(0);
    });
    it('New arc may be constructed by function call', function() {
        expect(arc(point(), 5, Math.PI, 3*Math.PI, true)).toEqual(new Arc(new Point(), 5, Math.PI, 3*Math.PI, true));
    });

    function degreesToRadians(degrees) {
        return degrees * Math.PI/180;
    }
    describe('start point', () => {
        it('Getter arc.start returns start point', function () {
            let arc = new Arc(new Point(), 1, -Math.PI/4, Math.PI/4, true);
            expect(arc.start).toEqual({x:Math.cos(-Math.PI/4),y:Math.sin(-Math.PI/4)});
        });

        describe('rotated clockwise', () => {
            it('12 to 3', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(90), 0, Flatten.CW);
    
                expect(arc.start.x).toBeCloseTo(0);
                expect(arc.start.y).toBeCloseTo(10);
                
                expect(arc.end.x).toBeCloseTo(10);
                expect(arc.end.y).toBeCloseTo(0);
            });

            it('3 to 6', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(0), degreesToRadians(270), Flatten.CW);
    
                expect(arc.start.x).toBeCloseTo(10);
                expect(arc.start.y).toBeCloseTo(0);
                
                expect(arc.end.x).toBeCloseTo(0);
                expect(arc.end.y).toBeCloseTo(-10);
            });

            it('6 to 9', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(270), degreesToRadians(180), Flatten.CW);
    
                expect(arc.start.x).toBeCloseTo(0);
                expect(arc.start.y).toBeCloseTo(-10);
                
                expect(arc.end.x).toBeCloseTo(-10);
                expect(arc.end.y).toBeCloseTo(0);
            });

            it('9 to 12', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(180), degreesToRadians(90), Flatten.CW);
    
                expect(arc.start.x).toBeCloseTo(-10);
                expect(arc.start.y).toBeCloseTo(0);
                
                expect(arc.end.x).toBeCloseTo(0);
                expect(arc.end.y).toBeCloseTo(10);
            });

            it('12 to 6', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(90), degreesToRadians(270), Flatten.CW);
    
                expect(arc.start.x).toBeCloseTo(0);
                expect(arc.start.y).toBeCloseTo(10);
                
                expect(arc.end.x).toBeCloseTo(0);
                expect(arc.end.y).toBeCloseTo(-10);
            });
        });


        describe('rotated anti-clockwise', () => {
            it('3 to 12', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(0), degreesToRadians(90), Flatten.CCW);
    
                expect(arc.start.x).toBeCloseTo(10);
                expect(arc.start.y).toBeCloseTo(0);
                
                expect(arc.end.x).toBeCloseTo(0);
                expect(arc.end.y).toBeCloseTo(10);
            });

            it('6 to 3', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(270), degreesToRadians(0), Flatten.CCW);
    
                expect(arc.start.x).toBeCloseTo(0);
                expect(arc.start.y).toBeCloseTo(-10);
                
                expect(arc.end.x).toBeCloseTo(10);
                expect(arc.end.y).toBeCloseTo(0);
            });

            it('9 to 6', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(180), degreesToRadians(270), Flatten.CCW);
    
                expect(arc.start.x).toBeCloseTo(-10);
                expect(arc.start.y).toBeCloseTo(0);
                
                expect(arc.end.x).toBeCloseTo(0);
                expect(arc.end.y).toBeCloseTo(-10);
            });

            it('12 to 9', () => {
                let arc = new Arc(new Point(0,0), 10, degreesToRadians(90), degreesToRadians(180), Flatten.CCW);
    
                expect(arc.start.x).toBeCloseTo(0);
                expect(arc.start.y).toBeCloseTo(10);
                
                expect(arc.end.x).toBeCloseTo(-10);
                expect(arc.end.y).toBeCloseTo(0);
            });
        });
    });

    describe('end point', () => {
        it('Getter arc.end returns end point', function () {
            let arc = new Arc(new Point(), 1, -Math.PI/4, Math.PI/4, true);
            expect(arc.end).toEqual({x:Math.cos(Math.PI/4),y:Math.sin(Math.PI/4)});
        });    
    });


    it('Getter arc.length returns arc length', function () {
        let arc = new Arc(new Point(), 1, -Math.PI/4, Math.PI/4, true);
        expect(arc.length).toEqual(Math.PI/2);
    });

    it('Getter arc.length returns arc length', function () {
        let arc = new Arc(new Point(), 5, -Math.PI/4, Math.PI/4, false);
        expect(arc.length).toEqual(5*3*Math.PI/2);
    });
    it('Getter arc.box returns arc bounding box, CCW case', function () {
        let arc = new Arc(new Point(), 1, -Math.PI/4, Math.PI/4, true);
        let box = arc.box;
        expect(Flatten.Utils.EQ(box.xmin,Math.sqrt(2)/2)).toEqual(true);
        expect(Flatten.Utils.EQ(box.ymin,-Math.sqrt(2)/2)).toEqual(true);
        expect(Flatten.Utils.EQ(box.xmax,1)).toEqual(true);
        expect(Flatten.Utils.EQ(box.ymax,Math.sqrt(2)/2)).toEqual(true);
    });
    it('Getter arc.box returns arc bounding box, CW case', function () {
        let arc = new Arc(new Point(), 1, -Math.PI/4, Math.PI/4, false);
        let box = arc.box;
        expect(Flatten.Utils.EQ(box.xmin,-1)).toEqual(true);
        expect(Flatten.Utils.EQ(box.ymin,-1)).toEqual(true);
        expect(Flatten.Utils.EQ(box.xmax,Math.sqrt(2)/2)).toEqual(true);
        expect(Flatten.Utils.EQ(box.ymax,1)).toEqual(true);
    });
    it('Getter arc.box returns arc bounding box, circle case', function () {
        let arc = circle(point(200,200), 75).toArc(false);
        let box = arc.box;
        expect(Flatten.Utils.EQ(box.xmin,125)).toEqual(true);
        expect(Flatten.Utils.EQ(box.ymin,125)).toEqual(true);
        expect(Flatten.Utils.EQ(box.xmax,275)).toEqual(true);
        expect(Flatten.Utils.EQ(box.ymax,275)).toEqual(true);
    });
    describe('#Flatten.Arc.breakToFunctional', function() {
        it('Case 1. No intersection with axes', function () {
            let arc = new Arc(new Point(), 1, Math.PI/6, Math.PI/3, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(1);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 2. One intersection, two sub arcs', function () {
            let arc = new Arc(new Point(), 1, Math.PI/6, 3*Math.PI/4, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(2);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].startAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 3. One intersection, two sub arcs, CW', function () {
            let arc = new Arc(new Point(), 1, Math.PI/6, -Math.PI/6, false);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(2);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, 0)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].startAngle, 0)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 4. One intersection, start at extreme point', function () {
            let arc = new Arc(new Point(), 1, Math.PI/2, 3*Math.PI/4, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(1);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 5. 2 intersections, 3 parts', function () {
            let arc = new Arc(new Point(), 1, Math.PI/4, 5*Math.PI/4, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(3);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, Math.PI)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[2].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 6. 2 intersections, 3 parts, CW', function () {
            let arc = new Arc(new Point(), 1, 3*Math.PI/4, -Math.PI/4, false);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(3);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].startAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[1].endAngle, 0)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[2].startAngle, 0)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[2].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 7. 2 intersections on extreme points, 1 parts, CW', function () {
            let arc = new Arc(new Point(), 1, Math.PI/2, 0, false);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(1);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, Math.PI/2)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[0].endAngle, 0)).toEqual(true);
        });
        it('Case 7. 4 intersections on extreme points, 5 parts', function () {
            let arc = new Arc(new Point(), 1, Math.PI/3, Math.PI/6, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(5);
            expect(Flatten.Utils.EQ(f_arcs[0].startAngle, arc.startAngle)).toEqual(true);
            expect(Flatten.Utils.EQ(f_arcs[4].endAngle, arc.endAngle)).toEqual(true);
        });
        it('Case 8. Full circle, 4 intersections on extreme points, 4 parts', function () {
            let arc = new Arc(new Point(), 1, Math.PI/2, Math.PI/2 + 2*Math.PI, true);
            let f_arcs = arc.breakToFunctional();
            expect(f_arcs.length).toEqual(4);
        });
    });
    describe('#Flatten.Arc.intersect', function() {
        it('Intersect arc with segment', function() {
            let arc = new Arc(point(), 1, 0, Math.PI, true);
            let segment = new Segment(-1, 0.5, 1, 0.5);
            let ip = arc.intersect(segment);
            expect(ip.length).toEqual(2);
        });
        it('Intersect arc with line', function () {
            let line = new Line(point(1, 0), vector(1, 0));
            let arc = new Arc(point(1, 0), 3, -Math.PI/3, Math.PI/3, Flatten.CW);
            let ip = arc.intersect(line);
            expect(ip.length).toEqual(2);
        });
        it('Intersect arc with circle, same center and radius - return two end points', function () {
            let circle = new Circle(point(1, 0), 3);
            let arc = new Arc(point(1, 0), 3, -Math.PI/3, Math.PI/3, Flatten.CW);
            let ip = arc.intersect(circle);
            expect(ip.length).toEqual(2);
        });
        it('Intersect arc with arc', function() {
            let arc1 = new Arc(point(), 1, 0, Math.PI, true);
            let arc2 = new Arc(point(0,1), 1, Math.PI, 2*Math.PI, true);
            let ip = arc1.intersect(arc2);
            expect(ip.length).toEqual(2);
        });
        it('Intersect arc with arc, case of touching', function () {
            let arc1 = new Arc(point(), 1, 0, Math.PI, true);
            let arc2 = new Arc(point(0,2), 1, -Math.PI/4, -3*Math.PI*4, false);
            let ip = arc1.intersect(arc2);
            expect(ip.length).toEqual(1);
            expect(ip[0]).toEqual({x:0,y:1});
        });
        it('Intersect arc with arc, overlapping case', function () {
            let arc1 = new Arc(point(), 1, 0, Math.PI, true);
            let arc2 = new Arc(point(), 1, -Math.PI/2, Math.PI/2, true);
            let ip = arc1.intersect(arc2);
            expect(ip.length).toEqual(2);
            expect(ip[0].equalTo(point(1,0))).toEqual(true);
            expect(ip[1].equalTo(point(0,1))).toEqual(true);
        });
        it('Intersect arc with arc, overlapping case, 4 points', function () {
            let arc1 = new Arc(point(), 1, -Math.PI/4, 5*Math.PI/4, true);
            let arc2 = new Arc(point(), 1, Math.PI/4, 3*Math.PI/4, false);
            let ip = arc1.intersect(arc2);
            expect(ip.length).toEqual(4);
        });
        it('Intersect arc with polygon', function() {
            let points = [
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 200),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ];
            let polygon = new Polygon();
            polygon.addFace(points);
            let arc = new Arc(point(150,50), 50, Math.PI/3, 5*Math.PI/3, Flatten.CCW);
            expect(arc.intersect(polygon).length).toEqual(1);
        });
        it('Intersect arc with box', function() {
            let points = [
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 200),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ];
            let polygon = new Polygon();
            polygon.addFace(points);
            let arc = new Arc(point(150,50), 50, Math.PI/3, 5*Math.PI/3, Flatten.CCW);
            expect(arc.intersect(polygon.box).length).toEqual(1);
        });
    });
    describe('sweep calculates correct length', () => {
        describe('clockwise', () => {
            it('cw 90 degrees', () => {
                let arc = new Arc(point(), 10, 0, Math.PI/2, Flatten.CW);
                expect(arc.sweep).toEqual(Math.PI/2);
            })
    
            it('cw 180 degrees', () => {
                let arc = new Arc(point(), 10, 0, Math.PI, Flatten.CW);
                expect(arc.sweep).toEqual(Math.PI);
            })
    
            it('cw 270 degrees 1', () => {
                let arc = new Arc(point(), 10, 0, Math.PI*1.5, Flatten.CW);
                expect(arc.sweep).toEqual(Math.PI*1.5);
            })

            it('cw 270 degrees 2', () => {
                let arc = new Arc(point(), 10, Math.PI / 2, Math.PI*2, Flatten.CW);
                expect(arc.sweep).toEqual(Math.PI*1.5);
            })   
          
            it('cw 360 degrees', () => {
                let arc = new Arc(point(), 10, 0, Math.PI*2, Flatten.CW);
                expect(arc.sweep).toEqual(Math.PI*2);
            })
        })

        describe('counter clockwise', () => {
            it('ccw 90 degrees', () => {
                let arc = new Arc(point(), 10, 0, Math.PI/2, Flatten.CCW);
                expect(arc.sweep).toEqual(Math.PI/2);
            })
    
            it('ccw 180 degrees', () => {
                let arc = new Arc(point(), 10, 0, Math.PI, Flatten.CCW);
                expect(arc.sweep).toEqual(Math.PI);
            })
    
            it('ccw 270 degrees 1', () => {
                let arc = new Arc(point(), 10, 0, Math.PI*1.5, Flatten.CCW);
                expect(arc.sweep).toEqual(Math.PI*1.5);
            })
    
            it('ccw 270 degrees 2', () => {
                let arc = new Arc(point(), 10, Math.PI / 2, Math.PI*2, Flatten.CCW);
                expect(arc.sweep).toEqual(Math.PI*1.5);
            })

            it('ccw 360 degrees', () => {
                let arc = new Arc(point(), 10, 0, Math.PI*2, Flatten.CCW);
                expect(arc.sweep).toEqual(Math.PI*2);
            })
        })    
    })

    it('Calculate signed area under circular arc, full circle case, CCW', function() {
        let arc = new Arc(point(0,1), 1, 0, 2*Math.PI, true);
        let area = arc.definiteIntegral();
        expect( Flatten.Utils.EQ(area, -Math.PI)).toEqual(true);
    });
    it('Calculate signed area under circular arc, full circle case, CW', function() {
        let arc = new Arc(point(0,1), 1, 0, 2*Math.PI, Flatten.CW);
        let area = arc.definiteIntegral();
        expect( Flatten.Utils.EQ(area, Math.PI)).toEqual(true);
    });
    it('It can calculate tangent vector in start point, CCW case', function () {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        let tangent = arc.tangentInStart();
        expect(tangent.equalTo(vector(Math.cos(3*Math.PI/4), Math.sin(3*Math.PI/4)))).toBeTruthy();
    });
    it('It can calculate tangent vector in start point, CW case', function () {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CW);
        let tangent = arc.tangentInStart();
        expect(tangent.equalTo(vector(Math.cos(7*Math.PI/4), Math.sin(7*Math.PI/4)))).toBeTruthy();
    });
    it('It can calculate tangent vector in end point, CCW case', function () {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        let tangent = arc.tangentInEnd();
        expect(tangent.equalTo(vector(Math.cos(Math.PI/4), Math.sin(Math.PI/4)))).toBeTruthy();
    });
    it('It can calculate tangent vector in end point, CW case', function () {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CW);
        let tangent = arc.tangentInEnd();
        expect(tangent.equalTo(vector(Math.cos(5*Math.PI/4), Math.sin(5*Math.PI/4)))).toBeTruthy();
    });
    it('It can calculate middle point case 1 full circle', function() {
        let arc = new Circle(point(), 3).toArc();
        let middle = arc.middle();
        expect(middle.equalTo(point(3,0))).toBeTruthy();
    });
    it('It can calculate middle point case 2 ccw', function() {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        let middle = arc.middle();
        expect(middle.equalTo(point(0,5))).toBeTruthy();
    });
    it('It can calculate middle point case 3 cw', function() {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CW);
        let middle = arc.middle();
        expect(middle.equalTo(point(0,-5))).toBeTruthy();
    });
    it('It can calculate middle point case 4 cw, startAngle > endAngle', function() {
        let arc = new Arc(point(), 5, Math.PI/4, -Math.PI/4, Flatten.CW);
        let middle = arc.middle();
        expect(middle.equalTo(point(5,0))).toBeTruthy();
    });
    it('Can reverse arc', function() {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        let reversed_arc = arc.reverse();
        expect(reversed_arc.counterClockwise).toEqual(Flatten.CW);
        expect(Flatten.Utils.EQ(arc.sweep,reversed_arc.sweep)).toBeTruthy();
    })
    it('Method svg() without parameters creates svg string with default attributes', function() {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        let svg = arc.svg();
        expect(svg.search("stroke")).not.toEqual(-1);
        expect(svg.search("stroke-width")).not.toEqual(-1);
        expect(svg.search("fill")).not.toEqual(-1);
    })
    it('Method svg() with extra parameters may add additional attributes', function() {
        let arc = new Arc(point(), 5, Math.PI/4, 3*Math.PI/4, Flatten.CCW);
        let svg = arc.svg({id:"123",className:"name"});
        expect(svg.search("stroke")).not.toEqual(-1);
        expect(svg.search("stroke-width")).not.toEqual(-1);
        expect(svg.search("fill")).not.toEqual(-1);
        expect(svg.search("id")).not.toEqual(-1);
        expect(svg.search("class")).not.toEqual(-1);
    })

    it('Method svg() can draw a anti-clockwise arc', function() {
        let arc = new Arc(point(), 10, 0, Math.PI/2, Flatten.CCW);
        let svg = arc.svgAttrs({id:"123",className:"name"});
        expect(svg['d']['m']).toEqual("M10,0");
        expect(svg['d']['a']).toEqual("A10,10 0 0,1 6.123233995736766e-16,10");
    })

    it('Method svg() can draw a clockwise arc', function() {
        let arc = new Arc(point(), 5, 0, Math.PI/2, Flatten.CW);
        let svg = arc.svg({id:"123",className:"name"});
        expect(svg).toEqual(`<path d=\"M5,0 A5,5 0 1,0 3.061616997868383e-16,5\" stroke=\"black\" stroke-width=\"1\" fill=\"none\" id=\"123\" class=\"name\" />`);
    })
});
