const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
/** Pick n random points 0 and x and 0 and y
 * @param {int} max
 * @param {int} x
 * @param {int} y
 * @return array of circle centers
 */
function pickPoints(max, x, y) {
    const centers = [];
    for (let i = 0; i < max; i++) {
        centers.push({
            x: Math.random() * x,
            y: Math.random() * y,
            radius: 0
        })
    }
    return centers;
}

/** Find midpoint between two points
 * @param {Object} a point {x,y}
 * @param {Object} b point {x,y}
 * @return midpoint between two points
 */
function midpoint(a, b) {
    return {x: (a.x+b.x)/2, y: (a.y+b.y)/2};
}

const distMemo = {};
/** Find distance between two points
 * @param {Object} a point {x,y}
 * @param {Object} b point {x,y}
 * @return {Integer} distance between two points
 */
function distance(a, b) {
    const dx = a.x-b.x;
    const dy = a.y-b.y;
    // console.log(a.x, a.y, b.x, b.y, "a, b");
    return Math.sqrt(dx * dx + dy * dy);
}

/** Expand all centers to become largest circle that fits
 * @param {Array} centers
 * @return array of expanded circles
 */
function expandCircles(circles) {
    while(true) {
        let currCenters, i;
        currCenters = closestPoints(circles);
        // console.log(currCenters, "currCenters");

        if (currCenters.a.radius) break;
        currCenters.a.radius = distance(currCenters.a, currCenters.b);
        if (!currCenters.b.radius) {
            currCenters.a.radius /= 2;
            currCenters.b.radius = currCenters.a.radius;
            drawCircle(currCenters.b, ctx);
        } else {
            currCenters.a.radius -= currCenters.b.radius;
        }
        drawCircle(currCenters.a, ctx);

    }
    return circles;
}


function closestPoint(a, points) {
    let dist = Infinity, closestB;
    for (let i = 0; i < points.length; i++) {
        if (a == points[i]) continue;
        const currDist = distance(a, points[i]) - points[i].radius;
        if (currDist < dist) {
            dist = currDist;
            closestB = points[i];
        }
    }
    return closestB;
}

function closestPoints(points) {
    let closest = points[0];
    let closestB, currClosestB;
    let dist = distance(closest, points[1]);
    let closestDist = dist;
    for (let i = 0; i < points.length; i++) {
        if(points[i].radius) continue;
        currClosestB = closestPoint(points[i], points);
        dist = distance(points[i], currClosestB);
        if (dist < closestDist) {
            closest = points[i];
            closestDist = dist;
            closestB = currClosestB;
        }
    }
    return {a: closest, b: closestB};
}
let points = [];

function drawCircle(circle, ctx) {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function collides(a, points) {
    for (let i = 0; i < points.length; i++) {
        if (distance(a, points[i]) - points[i].radius <= 0) return true;
    }
    return false;
}

function zoomIn(points, max, depth, ctx) {
    const width = max.x, height = max.y;
    const newPoints = [];
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < points.length; i++) {
        if (points[i].x < width / 2) {
            points[i].x -= (depth * -(points[i].x - width / 2)) + depth / 10;
            if (points[i].x + points[i].radius < 0) continue;
        } else {
            points[i].x += (depth * (points[i].x - width / 2)) + depth / 10;
            if (points[i].x - points[i].radius > max.x) continue;
        }
        if (points[i].y < height / 2) {
            points[i].y -= (depth * -(points[i].y - height / 2)) + depth / 10;
            if (points[i].y + points[i].radius < 0) continue;
        } else {
            points[i].y += (depth * (points[i].y - height / 2)) + depth / 10;
            if (points[i].y - points[i].radius > max.y) continue;
        }
        newPoints.push(points[i]);
        drawCircle(points[i], ctx)
    }
    points = newPoints;
}

setInterval(() => {
    zoomIn(points, {x: ctx.canvas.width, y: ctx.canvas.height}, ctx.canvas.width/1000000, ctx);
}, 15);

setInterval(() => {
    const newPoint = {
        x: Math.random() * ctx.canvas.width,
        y: Math.random() * ctx.canvas.height,
        radius: 0
    }
    let i = 0;
    while(collides(newPoint, points)) {
        newPoint.x = Math.random() * ctx.canvas.width;
        newPoint.y = Math.random() * ctx.canvas.height;
    }
    if (points.length < 1) {
        newPoint.radius = Math.random() * ctx.canvas.width / 10;
        points.push(newPoint);
        drawCircle(newPoint, ctx);
        return;
    }
    const closest = closestPoint(newPoint, points);

    newPoint.radius = distance(newPoint, closest) - closest.radius;
    points.push(newPoint);
    drawCircle(newPoint, ctx);
}, 10);
