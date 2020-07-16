/**
 * Created by Alex Bol on 9/8/2017.
 */
'use strict';

import { expect } from 'chai';
import Flatten from '../../index';

import {arc, Point, Circle, Box, point, Segment} from '../../index';

describe('#Flatten.Box', function() {
    it('May create new instance of Box', function () {
        let box = new Box();
        expect(box).to.be.an.instanceof(Box);
    });
    it('Method intersect returns true if two boxes intersected', function () {
        let box1 = new Box(1, 1, 3, 3);
        let box2 = new Box(-3, -3, 2, 2);
        expect(box1.intersect(box2)).to.equal(true);
    });
    it('Method expand expands current box with other', function () {
        let box1 = new Box(1, 1, 3, 3);
        let box2 = new Box(-3, -3, 2, 2);
        expect(box1.merge(box2)).to.deep.equal({xmin:-3, ymin:-3, xmax:3, ymax:3});
    });
    it('Method svg() without parameters creates svg string with default attributes', function() {
        let box = new Box(-30, -30, 20, 20);
        let svg = box.svg();
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("fill")).to.not.equal(-1);
    });
    it('Method svg() with extra parameters may add additional attributes', function() {
        let box = new Box(-30, -30, 20, 20);
        let svg = box.svg({id:"123",className:"name"});
        expect(svg.search("stroke")).to.not.equal(-1);
        expect(svg.search("stroke-width")).to.not.equal(-1);
        expect(svg.search("fill")).to.not.equal(-1);
        expect(svg.search("id")).to.not.equal(-1);
        expect(svg.search("class")).to.not.equal(-1);
    });

    describe('#Flatten.Box.contains', function() {Segment
        it('Can correctly identify when it contains points', function() {
            let box = new Box(0,0,100,100);
            expect(box.contains(point(0,0))).to.equal(true);
            expect(box.contains(point(100,100))).to.equal(true);
            expect(box.contains(point(0,100))).to.equal(true);
            expect(box.contains(point(100,0))).to.equal(true);
            expect(box.contains(point(50,50))).to.equal(true);

            expect(box.contains(point(150,100))).to.equal(false);
            expect(box.contains(point(150,150))).to.equal(false);
            expect(box.contains(point(-10,100))).to.equal(false);
            expect(box.contains(point(100,-10))).to.equal(false);
        });

        it('Can correctly identify when it contains a box', function() {
            let box = new Box(0,0,100,100);
            expect(box.contains(new Box(0,0,100,100))).to.equal(true);
            expect(box.contains(new Box(10,10,50,50))).to.equal(true);

            expect(box.contains(new Box(-10,0,100,100))).to.equal(false);
            expect(box.contains(new Box(0,-10,100,100))).to.equal(false);
            expect(box.contains(new Box(0,0,110,100))).to.equal(false);
            expect(box.contains(new Box(0,0,100,110))).to.equal(false);

            expect(box.contains(new Box(-100,-100,200,200))).to.equal(false);
        });        
        it('Can correctly identify when it contains a segment', function() {
            let box = new Box(0,0,100,100);
            expect(box.contains(new Segment(point(0,0),point(100,100)))).to.equal(true);
            expect(box.contains(new Segment(point(10,10),point(90,90)))).to.equal(true);

            expect(box.contains(new Segment(point(-10,10),point(100,100)))).to.equal(false);
            expect(box.contains(new Segment(point(10,-10),point(100,100)))).to.equal(false);
            expect(box.contains(new Segment(point(10,10),point(110,100)))).to.equal(false);
            expect(box.contains(new Segment(point(10,10),point(100,110)))).to.equal(false);
            expect(box.contains(new Segment(point(110,110),point(120,120)))).to.equal(false);
        });
        it('Can correctly identify when it contains a circle', function() {
            let box = new Box(0,0,100,100);
            expect(box.contains(new Circle(point(50,50),50))).to.equal(true);
            expect(box.contains(new Circle(point(20,40),10))).to.equal(true);

            expect(box.contains(new Circle(point(80,80),40))).to.equal(false);
            expect(box.contains(new Circle(point(-10,-10),30))).to.equal(false);
        });
        it('Can correctly identify when it contains an arc', function() {
            let box = new Box(0,0,100,100);

            expect(box.contains(arc(point(50,50), 30, 0, Math.PI*2))).to.equal(true);

            expect(box.contains(arc(point(100,50), 30,  0 * Math.PI/180, 90 * Math.PI/180, true))).to.equal(false);
            expect(box.contains(arc(point(100,50), 30,  90 * Math.PI/180, 180 * Math.PI/180, true))).to.equal(true);
            expect(box.contains(arc(point(100,50), 30,  180 * Math.PI/180, 270 * Math.PI/180, true))).to.equal(true);
            expect(box.contains(arc(point(100,50), 30,  270 * Math.PI/180, 360 * Math.PI/180, true))).to.equal(false);

            expect(box.contains(arc(point(100,50), 30, 0, Math.PI*2))).to.equal(false);
        });
    });
    describe('#Flatten.Box.DistanceTo', function() {
        describe('Can measure distance between box and point', function() {
            it('Has point to the top right of the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(200, 100);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(196.9771560359221);
                expect(shortest_segment.ps).to.deep.equal({x:20,y:20})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
            it('Has point to the right of the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(200, 10);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(180);
                expect(shortest_segment.ps).to.deep.equal({x:20,y:10})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
            it('Has point to the bottom right of the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(200, -100);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(196.9771560359221);
                expect(shortest_segment.ps).to.deep.equal({x:20,y:-20})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
            it('Has point to the underneath the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(10, -100);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(80);
                expect(shortest_segment.ps).to.deep.equal({x:10,y:-20})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
            it('Has point to the bottom left of the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(-100, -100);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(113.13708498984761);
                expect(shortest_segment.ps).to.deep.equal({x:-20,y:-20})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
            it('Has point to the left of the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(-100, 10);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(80);
                expect(shortest_segment.ps).to.deep.equal({x:-20,y:10})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
            it('Has point to the top left of the box', function() {
                let box = new Box(-20,-20, 20, 20);
                let pt = point(-100, 80);

                let [dist, shortest_segment] = box.distanceTo(pt);
                expect(dist).to.equal(100);
                expect(shortest_segment.ps).to.deep.equal({x:-20,y:20})
                expect(shortest_segment.pe).to.deep.equal(pt);
            });
       });






        xit('Can measure distance between box and circle', function() {
            let c1 = circle(point(200,200), 50);
            let c2 = circle(point(200,230), 100);

            let [dist, shortest_segment] = c1.distanceTo(c2);
            expect(dist).to.equal(20);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 130});
        });
        xit('Can measure distance between box and line', function() {
            let c = circle(point(200,200), 50);
            let l = line(point(200,130), vector(0,1));

            let [dist, shortest_segment] = c.distanceTo(l);
            expect(dist).to.equal(20);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 130});
        });
        xit('Can measure distance between box and segment', function() {
            let c = circle(point(200,200), 50);
            let seg = segment(point(200,130), point(220,130));

            let [dist, shortest_segment] = c.distanceTo(seg);
            expect(dist).to.equal(20);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 130});
        });
        xit('Can measure distance between box and arc', function() {
            let c = circle(point(200,200), 50);
            let a = circle(point(200,100), 20).toArc();

            let [dist, shortest_segment] = c.distanceTo(a);
            expect(dist).to.equal(30);
            expect(shortest_segment.ps).to.deep.equal({"x": 200, "y": 150});
            expect(shortest_segment.pe).to.deep.equal({"x": 200, "y": 120});
        });
        xit('Can measure distance between box and polygon', function () {
            let points = [
                point(100, 20),
                point(250, 75),
                point(350, 75),
                point(300, 270),
                point(170, 200),
                point(120, 350),
                point(70, 120)
            ];

            let poly = new Polygon();
            poly.addFace(points);
            poly.addFace([circle(point(175,150), 30).toArc()]);

            let c = circle(point(300,25), 25);

            let [dist, shortest_segment] = c.distanceTo(poly);

            expect(dist).to.equal(25);
            expect(shortest_segment.ps).to.deep.equal({"x": 300, "y": 50});
            expect(shortest_segment.pe).to.deep.equal({"x": 300, "y": 75});
        })
    });
});

