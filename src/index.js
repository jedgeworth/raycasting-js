/**
 * index.js
 *
 * Entry point of application.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

require('normalize.css/normalize.css');
require('./styles/index.scss');

const ProjectionPlane = require('./lib/EdgeCast/ProjectionPlane');
const Player = require('./lib/EdgeCast/Player');
const Vector2 = require('./lib/EdgeCast/Vector2');
const IVector2 = require('./lib/EdgeCast/IVector2');
const GameMap = require('./lib/EdgeCast/GameMap');

const viewportCanvas = document.getElementById('viewport');
const mapCanvas = document.getElementById('map');

const viewportCtx = viewportCanvas.getContext('2d');
const mapCtx = mapCanvas.getContext('2d');

let renderAllRays = false;

const rayPoints = [];           // Vector2[]
const mapIntersectPoints = [];  // Vector2[]
const rayLengths = [];          // Float[]
const rayTexCoords = [];        // Int[]

const mapPixelSize = 640;
const mapResolution = 64;

const mapData = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];


let gameMap = null;
let projectionPlane = null;
let player = null;


document.addEventListener("DOMContentLoaded", () => {

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    initWorld();

    setInterval(() => {
        handleKeys();
        drawMap();
        castRays();
        drawViewport();
    }, 15);

});

document.getElementById('renderAllRays').addEventListener('change', (event) => {
    renderAllRays = event.target.checked;
});




/**
 * Setup any objects.
 */
function initWorld() {

    gameMap = new GameMap(mapData, mapPixelSize);
    projectionPlane = new ProjectionPlane(320, 200, 60);

    player = new Player();
    player.x = 96.0;
    player.y = 224.0;
    player.rotation = 60.0;


    for (let i = 0; i < projectionPlane.width; i += 1) {
        rayPoints[i] = new Vector2();
        mapIntersectPoints[i] = new Vector2();
        rayLengths[i] = 0.0;
        rayTexCoords[i] = 0;
    }
}


/**
 * Create the rays to sample the game world.
 */
function castRays() {
    let hHit = false;
    let vHit = false;

    let hDist = 0.0;
    let vDist = 0.0;

    let squareX = 0.0;
    let squareY = 0.0;

    let rayCastingUp = false;
    let rayCastingRight = false;

    let stepX = 0.0;
    let stepY = 0.0;
    let rayAngle = 0.0;
    let rayCorrection = 0.0;

    let debugLineStartPoint = new Vector2(0, 0);
    let debugLineEndPoint = new Vector2(0, 0);

    let hRayPoint = new Vector2(0, 0);
    let vRayPoint = new Vector2(0, 0);

    for (let ray = 0; ray < projectionPlane.width; ray += 1) {
        hHit = false;
        vHit = false;

        // Determine ray angle
        if (ray == projectionPlane.centreWidth) {
            rayAngle = player.rotation;
        } else {
            rayAngle = player.rotation - 30 + (0.1875 * ray);
            rayCorrection = rayAngle - player.rotation;
        }

        // Determine ray direction
        rayCastingUp = (rayAngle > 0.0 && rayAngle <= 180.0);
        rayCastingRight = !(rayAngle > 90.0 && rayAngle <= 270.0);

        document.getElementById('isUp').textContent = rayCastingUp ? 'Up' : 'Down';
        document.getElementById('isRight').textContent = rayCastingRight ? 'Right' : 'Left';

        //
        // Test for horizontal intersections
        //

        if (rayCastingUp) {
            rayPoints[ray].y = parseFloat( parseInt(player.y / gameMap.mapResolution) * gameMap.mapResolution - 1.0 );
            stepY = -gameMap.mapResolution;
        } else {
            rayPoints[ray].y = parseFloat( parseInt(player.y / gameMap.mapResolution) * gameMap.mapResolution + gameMap.mapResolution );
            stepY = gameMap.mapResolution;
        }

        // We can get x position using TOA (remember Soh Cah Toa from Trigonometry)
        rayPoints[ray].x = player.x + (player.y - rayPoints[ray].y) / Math.tan(projectionPlane.toRadians(rayAngle));

        stepX = (stepY * -1) / Math.tan(projectionPlane.toRadians(rayAngle));

        debugLineStartPoint.x = player.x;
        debugLineStartPoint.y = player.y;



        while (!hHit) {
            hHit = gameMap.testHit(rayPoints[ray]);

            hRayPoint.x = rayPoints[ray].x;
            hRayPoint.y = rayPoints[ray].y;

            rayPoints[ray].x += stepX;
            rayPoints[ray].y += stepY;

            // if (ray == projectionPlane.centreWidth || renderAllRays) {
            //     drawCircle(mapCtx, hRayPoint.x, hRayPoint.y, 5, "green");
            //     drawLine(mapCtx, debugLineStartPoint.x, debugLineStartPoint.y, hRayPoint.x, hRayPoint.y, "green");
            // }

            debugLineStartPoint.x = hRayPoint.x;
            debugLineStartPoint.y = hRayPoint.y;
        }

        squareX = player.x - hRayPoint.x;
        squareY = player.y - hRayPoint.y;
        hDist = Math.sqrt( (squareX * squareX) + (squareY * squareY) );
        hDist = hDist * Math.cos(projectionPlane.toRadians(rayCorrection));


        //
        // Test for vertical intersections
        //

        if (rayCastingRight) {
            rayPoints[ray].x = parseFloat(parseInt(player.x / gameMap.mapResolution) * gameMap.mapResolution + gameMap.mapResolution );
            stepX = gameMap.mapResolution;
        } else {
            rayPoints[ray].x = parseFloat(parseInt(player.x / gameMap.mapResolution) * gameMap.mapResolution - 1.0);
            stepX = -gameMap.mapResolution;
        }

        rayPoints[ray].y = player.y + (player.x - rayPoints[ray].x) * Math.tan(projectionPlane.toRadians(rayAngle));

        stepY = parseInt(stepX * -1) * Math.tan(projectionPlane.toRadians(rayAngle));

        debugLineStartPoint.x = player.x;
        debugLineStartPoint.y = player.y;

        while (!vHit) {
            vHit = gameMap.testHit(rayPoints[ray]);

            vRayPoint.x = rayPoints[ray].x;
            vRayPoint.y = rayPoints[ray].y;

            rayPoints[ray].x += stepX;
            rayPoints[ray].y += stepY;

            // if (ray == projectionPlane.centreWidth || renderAllRays) {
            //     drawCircle(mapCtx, vRayPoint.x, vRayPoint.y, 5, "red");
            //     drawLine(mapCtx, debugLineStartPoint.x, debugLineStartPoint.y, vRayPoint.x, vRayPoint.y, "red");
            // }

            debugLineStartPoint.x = vRayPoint.x;
            debugLineStartPoint.y = vRayPoint.y;
        }

        squareX = player.x - vRayPoint.x;
        squareY = player.y - vRayPoint.y;
        vDist = Math.sqrt( (squareX * squareX) + (squareY * squareY) );
        vDist = vDist * Math.cos(projectionPlane.toRadians(rayCorrection));

        if (vDist <= hDist) {
            rayLengths[ray] = vDist;
            rayPoints[ray] = vRayPoint;
            rayTexCoords[ray] = parseInt(vRayPoint.y % mapResolution);

            debugLineEndPoint.x = vRayPoint.x;
            debugLineEndPoint.y = vRayPoint.y;
        } else {
            rayLengths[ray] = hDist;
            rayPoints[ray] = hRayPoint;
            rayTexCoords[ray] = parseInt(hRayPoint.x % mapResolution);

            debugLineEndPoint.x = hRayPoint.x;
            debugLineEndPoint.y = hRayPoint.y;
        }


        if (ray == projectionPlane.centreWidth || renderAllRays) {
            drawLine(mapCtx, player.x, player.y, debugLineEndPoint.x, debugLineEndPoint.y, "red");
        }

    }
}


/**
 * Draw the game map to the map canvas.
 */
function drawMap() {

    mapCtx.clearRect(0, 0, gameMap.mapPixelSize, gameMap.mapPixelSize);

    // Draw the grid cells.
    for (let i = 0; i < gameMap.mapRects.length; i += 1) {
        drawMapRect(mapCtx, gameMap.mapRects[i]);
    }

    // Draw the player location.
    drawCircle(mapCtx, player.x, player.y, 5);
}


/**
 * Draw the pixel columns to the viewport.
 */
function drawViewport() {
    viewportCtx.clearRect(0, 0, projectionPlane.width, projectionPlane.height);

    drawRect(viewportCtx, 0, 0, projectionPlane.width, projectionPlane.height / 2, 'lightblue');
    drawRect(viewportCtx, 0, projectionPlane.height / 2, projectionPlane.width, projectionPlane.height / 2, 'yellow');

    let sliceHeight = 0;
    let sliceHeightHalf = 0;
    let columnStart = 0;

    let sliceTexScale = 0;

    for (let col = 0; col < projectionPlane.width; col += 1) {
        sliceHeight = parseInt(mapResolution / rayLengths[col] * 100);
        sliceHeightHalf = sliceHeight / 2;

        columnStart = projectionPlane.centreHeight - sliceHeightHalf;

        //sliceTexScale = wallTexture.height / sliceHeight;

        for (let pixel = 0; pixel < sliceHeight; pixel += 1) {
            if (pixel >= projectionPlane.height || pixel < 0 || columnStart < 0) {
                break;
            }

            drawPixel(viewportCtx, projectionPlane.width - col, columnStart + pixel, 'white');
        }
    }
}




function drawMapRect(ctx, mapRect) {

    if (mapRect.flag == 1) {
        ctx.fillStyle = "#ccc";
    } else {
        ctx.fillStyle = "#fff";
    }

    ctx.beginPath();
    ctx.fillRect(mapRect.x, mapRect.y, mapRect.w, mapRect.h);
    ctx.rect(mapRect.x, mapRect.y, mapRect.w, mapRect.h);
    ctx.stroke();
}

function drawRect(ctx, x, y, w, h, color) {

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.fillRect(x, y, w, h);
    ctx.stroke();
}

function drawPixel(ctx, x, y, color) {

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    ctx.stroke();
    ctx.fillStyle = "#000";
}

function drawCircle(ctx, x, y, radius, color) {

    if (color !== undefined) {
        ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2* Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#000";
}

function drawLine(ctx, x, y, xEnd, yEnd, color) {

    if (color !== undefined) {
        ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    ctx.strokeStyle = "#000";
}




/**
 * Handle keypresses.
 *
 * TODO: Move this into its own class.
 */
const currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {

    if (currentlyPressedKeys[87]) {
      // W
        player.x += Math.sin(projectionPlane.toRadians(player.rotation + 90)) * 5.0;
        player.y += Math.cos(projectionPlane.toRadians(player.rotation + 90)) * 5.0;
    }

    if (currentlyPressedKeys[83]) {
      // S
        player.x -= Math.sin(projectionPlane.toRadians(player.rotation + 90)) * 5.0;
        player.y -= Math.cos(projectionPlane.toRadians(player.rotation + 90)) * 5.0;
    }

    if (currentlyPressedKeys[65]) {
      // A
      player.rotation += 5.1;
    }

    if (currentlyPressedKeys[68]) {
      // D
      player.rotation -= 5.1;
    }

    if (player.rotation >= 360.0) {
        player.rotation -= 360.0;
    }

    if (player.rotation < 0.0) {
        player.rotation += 360.0;
    }
  }
