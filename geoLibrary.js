/****** 
    math things
    
*********/

function randPoint() {
    var x = p.random(0,p.width);
    var y = p.random(0,p.height);
    return new Point(x,y);
}

highlightedEdges = [];



/************************
    Primitives and such
    
    
******************/




function Vertex(id,x,y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.myLink = null;
}

Vertex.prototype.draw = function() {
    //scale this so it fits the viewport essentially

    var newX = (this.x / maxVertexX) * 0.8 * p.width + 0.1 * p.width;
    var newY = (this.y / maxVertexY) * 0.8 * p.height + 0.1 * p.height;

    p.point(newX,newY);
    //p.point(this.x,this.y);
}

Vertex.prototype.getScaledCoords = function() {

    var newX = (this.x / maxVertexX) * 0.8 * p.width + 0.1 * p.width;
    var newY = (this.y / maxVertexY) * 0.8 * p.height + 0.1 * p.height;
    
    return new Point(newX,newY);
}

Vertex.prototype.getCoords = function() {
    return {'x':this.x,'y':this.y}
}

function Segment(p1,p2) {
    this.p1 = p1;
    this.p2 = p2;
}

Segment.prototype.lightSegment = function() {
    p.strokeCap(p.ROUND);
    p.colorMode(p.HSB);
    p.strokeWeight(2);
    p.stroke(p.color(100,100,100,200));
}

Segment.prototype.normalSegment = function() {
    p.strokeCap(p.ROUND);
    p.colorMode(p.RGB);
    p.strokeWeight(4);
    p.stroke(0,0,0);
}

function Edge(v1,v2) {
    this.v1 = v1;
    this.v2 = v2;

    var ids = [v1.id,v2.id];
    ids.sort();
    this.id = String(ids[0]) + String(ids[1]);
}

Edge.prototype.draw = function() {
    //now a line between each
    Segment.prototype.normalSegment();
    var c1 = this.v1.getScaledCoords();
    var c2 = this.v2.getScaledCoords();
    
    p.line(c1.x,c1.y,c2.x,c2.y);

    //draw each point / vertex
    Point.prototype.normalPoint();
    this.v1.draw();
    Point.prototype.highlightedPoint();
    this.v2.draw();
}

Edge.prototype.orientTest = function(point) {
    return orient2D(this.v1,this.v2,point);
}

Edge.prototype.getNeighborTris = function(inputLibrary) {
    if(!inputLibrary)
    {
        inputLibrary = tLibrary;
    }
    result = inputLibrary.getTrisOnEdge(this);
    return result;
}

Edge.prototype.numNeighbors = function() {
    result = this.getNeighborTris();
    return result.length;
}

Edge.prototype.convexPointTest = function(point) {
    //ok so this edge has only one neighboring tri,
    //and we want to see if this point is on the opposite side
    var myNeighbors = this.getNeighborTris();
    if(myNeighbors.length != 1)
    {
        throw new Error("did convex point test on an edge with multiple or 0 neighboring tris");
    }
    var otherPoint = myNeighbors[0].getThirdPoint(this);

    //test if on same side
    var ss = Triangle.prototype.sameSide;
    return !ss(this.v1,this.v2,otherPoint,point);

}

    
function orient2D(pp,q,r) {
    var m1 = $M([
        [pp.x - r.x, pp.y - r.y],
        [q.x - r.x, q.y - r.y]
    ]);
    var det = m1.det() * -1;
    return det;
}


function Point(x,y) {
    this.x = x;
    this.y = y;
    
    this.strokeWidth = 2;
    this.id = Math.round(Math.random()*1000);
}

Point.prototype.draw = function() {
    var r = Point.prototype.drawSize;
    p.ellipse(this.x,this.y,r,r);

    //p.point(this.x,this.y);
}

Point.prototype.normalSize = 8;
Point.prototype.highlightSize = 8;
Point.prototype.drawSize = 5;

Point.prototype.getScaledCoords = function() {
    return this;
}

Point.prototype.highlightedPoint = function() {
    Point.prototype.drawSize = Point.prototype.highlightSize;
    p.colorMode(p.RGB);
    p.strokeWeight(2);
    p.stroke(p.color(0,21,255));
    p.fill(p.color(133,143,255));
}

Point.prototype.normalPoint = function() {
    Point.prototype.drawSize = Point.prototype.normalSize;
    p.colorMode(p.RGB);
    p.strokeWeight(2);
    p.stroke(0,0,0);
    p.fill(255,255,255);
}


function Circle(x,y,radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

Circle.prototype.draw = function() {
    p.colorMode(p.HSB);
    
    p.stroke(0,0,255);
    p.fill(p.map(this.radius,0,300,0,255),255,p.dist(0,0,this.x,this.y)*50,50);

	p.ellipse(this.x,this.y,this.radius*2,this.radius*2);
    p.colorMode(p.RGB);
}

Circle.prototype.circleFromPoints = function (p1,p2,p3) {
	//from openprocessing.org/visuals/?visual=45489

	//first get circles
	var slope1 = (p1.y - p2.y) / (p1.x - p2.x);
	var slope2 = (p2.y - p3.y) / (p2.x - p3.x);

	if(Math.abs(slope1 - slope2) < 0.01)
	{
        throw new Error("that circumcirlce is invalid, points are on top of each other");
		return;
	}

	var centerX = (slope1 * slope2 * (p3.y - p1.y) + slope1*(p2.x + p3.x) - slope2*(p1.x + p2.x))/(2*(slope1-slope2));
	var centerY = -1/slope1 * (centerX - (p1.x + p2.x)/2) + (p1.y + p2.y)/2;
	var radius = p.dist(centerX,centerY,p2.x,p2.y);
    
    if(!centerX || !centerY || !radius)
    {
        console.log("warning -- invalid circumcircle");
        return null;
        throw new Error("invalid circumcircle, center or radius is undefined");
    }
    var c = new Circle(centerX,centerY,radius);
    return c;
}

Circle.prototype.testPointInside = function(testPoint) {
    //essentially get the distance from here to the center, and then
    //test that against the radius
    var distance = p.dist(this.x,this.y,testPoint.x,testPoint.y);
    return distance <= this.radius;
}

Circle.prototype.inCircle = function(a,b,c,d) {
    var m = $M([
        [a.x - d.x, a.y - d.y, Math.pow(a.x-d.x,2) + Math.pow(a.y-d.y,2)],
        [b.x - d.x, b.y - d.y, Math.pow(b.x-d.x,2) + Math.pow(b.y-d.y,2)],
        [c.x - d.x, c.y - d.y, Math.pow(c.x-d.x,2) + Math.pow(c.y-d.y,2)]
    ]);

    var det = m.det();
    if(det > 0)
    {
        //console.log("inside");
        return true;
    }
    else
    {
        return false;
        //console.log("outside");
    }
    return det;
}

/*****************************
    The triangle holder library!

    Initially this will be a simple collection of triangles (with ids, etc)
    but eventually it will be abstracted out to links and such


***********************/

function compareTwoVertices(a,b) {
    return a.id - b.id;
}

function Triangle(v1,v2,v3) {
    var rawVertices = [v1,v2,v3];
    this.vertices = rawVertices.sort(compareTwoVertices);
    this.hasGeneratedCircle = false;

    this.vertexMap = {};
    for(var i = 0; i < 3; i++)
    {
        this.vertexMap[this.vertices[i].id] = true;
    }

    this.myCircumCircle = null;

    this.generateId();
}

Triangle.prototype.generateId = function() {
    var startingId = "";

    for(var i = 0; i < 3; i++)
    {
        var v = this.vertices[i];
        startingId += String(v.id);
    }

    this.id = startingId;
}

Triangle.prototype.getEdges = function() {
    //make an edge for a->b, b->c, and c->a
    var a = this.vertices[0];
    var b = this.vertices[1];
    var c = this.vertices[2];

    var e1 = new Edge(a,b);
    var e2 = new Edge(b,c);
    var e3 = new Edge(c,a);

    return [e1,e2,e3];
}

Triangle.prototype.getCircumcircle = function() {
    if(this.hasGeneratedCircle)
    {
        return this.myCircumcircle;
    }
    this.hasGeneratedCircle = true;

    var v1 = this.vertices[0];
    var v2 = this.vertices[1];
    var v3 = this.vertices[2];
    
    var c = Circle.prototype.circleFromPoints(v1,v2,v3);
    this.myCircumcircle = c;
    return c;
}

Triangle.prototype.sameSide = function(p,q,r,testPoint) {
    triResult = orient2D(p,q,r);
    triSign = Math.round(triResult / Math.abs(triResult));

    pointResult = orient2D(p,q,testPoint);
    pointSign = Math.round(pointResult / Math.abs(pointResult));

    return pointSign == triSign;
}

Triangle.prototype.testInCircumcircle = function(testPoint) {
    //do the geometric primitive
    return Circle.prototype.inCircle(this.vertices[0],this.vertices[1],this.vertices[2],testPoint);
}

Triangle.prototype.drawHighlighted = function() {

    Point.prototype.highlightedPoint();
    //draw the points
    for(var i = 0; i < 3; i++)
    {
        var point = this.vertices[i].getScaledCoords();
        point.draw();
    }
    
    Segment.prototype.lightSegment();
    for(var i = 0; i < 3; i++)
    {
        var next = i + 1;
        if(next >= 3)
        {
            next = 0;
        }
        var p1 = this.vertices[i].getScaledCoords();
        var p2 = this.vertices[next].getScaledCoords();
        
        p.line(p1.x,p1.y,p2.x,p2.y);
    }
    p.fill(p.color(133,143,255));
    p.triangle( this.vertices[0].x,this.vertices[0].y,
                this.vertices[1].x,this.vertices[1].y,
                this.vertices[2].x,this.vertices[2].y);
    p.noFill();
}



Triangle.prototype.draw = function() {
    //with scaled coordinates
    
    Point.prototype.normalPoint();
    //draw the points
    for(var i = 0; i < 3; i++)
    {
        var point = this.vertices[i].getScaledCoords();
        point.draw();
    }
    
    Segment.prototype.lightSegment();
    for(var i = 0; i < 3; i++)
    {
        var next = i + 1;
        if(next >= 3)
        {
            next = 0;
        }
        var p1 = this.vertices[i].getScaledCoords();
        var p2 = this.vertices[next].getScaledCoords();
        
        p.line(p1.x,p1.y,p2.x,p2.y);
    }
}

Triangle.prototype.drawCircumcircle = function() {
    //with scaled coordinates
    var c = this.getCircumcircle();
    if(c)
    {
        c.draw();
    }
}

Triangle.prototype.drawBoth = function() {
    this.drawCircumcircle();
    this.draw();
}

Triangle.prototype.containsEdge = function(testEdge) {
    var v1 = testEdge.v1;
    var v2 = testEdge.v2;

    return this.vertexMap[v1.id] && this.vertexMap[v2.id];
}

Triangle.prototype.getThirdPoint = function(testEdge) {
    var v1 = testEdge.v1;
    var v2 = testEdge.v2;
    if(!this.vertexMap[v1.id] || !this.vertexMap[v2.id])
    {
        throw new Error("error! asked for a third point when edge points not here");
    }

    for(var i = 0; i < 3; i++)
    {
        var myV = this.vertices[i];
        if(myV.id != v1.id && myV.id != v2.id)
        {
            return myV;
        }
    }
}

Triangle.prototype.containsPoint = function(testPoint) {
    var a = this.vertices[0];
    var b = this.vertices[1];
    var c = this.vertices[2];

    //not too bad -- just do the sameside test for all
    var ss = Triangle.prototype.sameSide;

    return ss(a,b,c,testPoint) && ss(b,c,a,testPoint) && ss(c,a,b,testPoint);
}


function triLibrary() {
    this.tris = [];
    this.highlightedTris = {};
}

triLibrary.prototype.addTri = function(tri) {
    this.tris.push(tri);
}

triLibrary.prototype.highlightTriById = function(triId) {
    this.highlightedTris[triId] = true;
}

triLibrary.prototype.highlightTri = function(tri) {
    this.highlightedTris[tri.id] = true;
}

triLibrary.prototype.pointInsideAnyTri = function(point) {
    if(this.getTriContainingPoint(point))
    {
        return true;
    }
    return false;
}

triLibrary.prototype.getTriContainingPoint = function(point) {

    for(var i = 0; i < this.tris.length; i++)
    {
        if(this.tris[i].containsPoint(point))
        {
            return this.tris[i];
        }
    }
    return null;
}

triLibrary.prototype.highlightTrisContainingPoint = function(point) {
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(thisTri.containsPoint(point))
        {
            if(this.highlightedTris[thisTri.id])
            {
                this.highlightedTris[thisTri.id] = false;
            }
            else
            {
                this.highlightedTris[thisTri.id] = true;
            }
        }
    }
}

triLibrary.prototype.drawAllTris = function(mode) {
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(this.highlightedTris[thisTri.id])
        {
            thisTri.drawHighlighted();
        }
        else if(mode)
        {
            thisTri.drawBoth();
        }
        else
        {
            thisTri.draw();
        }
    }
}

triLibrary.prototype.getTrisOnEdge = function(edge) {
    resultTris = [];
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(thisTri.containsEdge(edge))
        {
            resultTris.push(thisTri);
        }
    }

    if(resultTris.length > 2)
    {
        throw new Error("Error -- more than 2 tries on an edge");
    }

    return resultTris;
}

triLibrary.prototype.getEdgesWithOneTri = function() {
    //horrible running time
    var singleEdges = [];

    for(var i = 0; i < this.tris.length; i++)
    {
        var theseEdges = this.tris[i].getEdges();
        for(var j = 0; j < theseEdges.length; j++)
        {
            var e = theseEdges[j];
            console.log(e.numNeighbors());
            if(e.numNeighbors() == 1)
            {
                singleEdges.push(e);
            }
        }
    }

    return singleEdges;
}


triLibrary.prototype.deleteTri = function(tri) {
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(thisTri.id == tri.id)
        {
            this.tris.splice(i,1);
            return;
        }
    }
    throw new Error("error -- this library does not contain that tri");
}

function insertPointInsideTri(seedTri,point) {
    //by definition, the point is inside the triangle so
    //its inside the triangle's circumcirlce

    //we will have a few things... a closed set of edges
    //that we have checked, a closed set of tris that we have checked,
    //etc

    checkedTris = {};
    checkedEdges = {};

    trisToDelete = [];
    edgesToJoin = [];

    edgesToCheck = [];

    //add this initial triangle
    trisToDelete.push(seedTri);
    checkedTris[seedTri.id] = true;

    edgesToCheck = edgesToCheck.concat(seedTri.getEdges());

    while(edgesToCheck.length > 0)
    {
        //pop an edge to check
        var edge = edgesToCheck.pop();
        if(checkedEdges[edge.id])
        {
            continue;
        }
        checkedEdges[edge.id] = true;
        console.log("checking this edge",edge);

        //for this edge, check if neighboring tris contain this point
        neighborTris = edge.getNeighborTris();

        var numContains = 0;

        //examine neighbor triangles
        for(var i = 0; i < neighborTris.length; i++)
        {
            var tri = neighborTris[i];

            //see if it contains this point
            if(tri.testInCircumcircle(point))
            {
                //it needs to be deleted, so add it to the list and push
                //the edges here
                trisToDelete.push(tri);
                numContains++;
                neighborContains = true;
                edgesToCheck = edgesToCheck.concat(tri.getEdges());
            }
        }
        //if our neighbors were good, we want to join this edge
        if(numContains != 2)
        {
            edgesToJoin.push(edge);
        }
        //else, we need to delete this tri and add its edges to the queue, which we just did

    }

    //ok now we have edges to join, go make a bunch of triangles and delete these triangles
    for(var i = 0; i < trisToDelete.length; i++)
    {
        tLibrary.deleteTri(trisToDelete[i]);
    }

    //make triangles with our edges
    joinAllEdgesToPoint(edgesToJoin,point,drawMode);

}

function insertAnyPoint(point,testLibrary) {
    if(!testLibrary)
    {
        testLibrary = tLibrary;
    }
    //see if theres a tri containing this point
    var result = testLibrary.getTriContainingPoint(point);
    if(result)
    {
        insertPointInsideTri(result,point);
    }
    else
    {
        insertPointOutsideConvexHull(point,testLibrary);
    }
}

function insertPointOutsideConvexHull(point,testLibrary) {
    //ok so basically get all the singleton edges, and then see if they are
    //visible, and if they are, connect them
    if(!testLibrary)
    {
        testLibrary = tLibrary;
    }

    var singleEdges = tLibrary.getEdgesWithOneTri();

    var edgesToConnect = [];

    //find all the edges that are visible to me
    for(var i = 0; i < singleEdges.length; i++)
    {
        var e = singleEdges[i];
        if(e.convexPointTest(point))
        {
            edgesToConnect.push(e);
        }
    }
    joinAllEdgesToPoint(edgesToConnect,point);
}


function joinAllEdgesToPoint(edgesToConnect,point,switcher)
{
    //TODO
    //connect all of these
    for(var i = 0; i < edgesToConnect.length; i++)
    {
        var e = edgesToConnect[i];
        if(switcher)
        {
            highlightedEdges.push(e);
        }
        else
        {
        var t = new Triangle(point,e.v1,e.v2);
        tLibrary.addTri(t);
        }
    }
}




function Link(myVertex) {
    this.parentVertex = myVertex;
    this.vertices = [];
}

Link.prototype.addVertex = function(vertex) {
    this.vertices.push(vertex);
}

Link.prototype.draw = function() {
    this.drawEdges();
}

Link.prototype.drawEdges = function() {
    var myCoords = this.parentVertex.getScaledCoords();
    var myX = myCoords.x;
    var myY = myCoords.y;

    for(key in this.vertices)
    {
        var v = this.vertices[key];
        var coords = v.getScaledCoords();
        var x = coords.x;
        var y = coords.y;

        p.line(myX,myY,x,y);
    }
}


