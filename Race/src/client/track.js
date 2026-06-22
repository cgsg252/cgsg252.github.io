import { vec2 } from "gl-matrix";

let direction = vec2.fromValues(0.0, 0.0), directionWidth = vec2.fromValues(0.0, 0.0), beginLeft = vec2.fromValues(0.0, 0.0),
    endLeft = vec2.fromValues(0.0, 0.0), beginRight = vec2.fromValues(0.0, 0.0), endRight = vec2.fromValues(0.0, 0.0), dist, neededPoints, i;

let grid = {}, gridCellSize = 1500.0, stepSize = 30.0;

function addToGrid(x, y) {
    // work with grid
    let gridX = Math.floor(x / gridCellSize), gridY = Math.floor(y / gridCellSize);
    let key = `${gridX},${gridY}`;
    if (!grid[key])
        grid[`${gridX},${gridY}`] = [];

    // check if point was created
    let isExist = false;
    for (let i = 0; i < grid[key].length; i += 2)
        if (grid[key][i] === x && grid[key][i + 1] === y) {
            isExist = true;
            break;
        }

    // add point
    if (!isExist)
        grid[key].push(x, y);
}

function drawStraight(ctx, begin, end, width) {
    vec2.subtract(direction, end, begin);
    vec2.normalize(directionWidth, direction);
    vec2.multiply(directionWidth, directionWidth, vec2.fromValues(width / 2.0, width / 2.0));

    vec2.add(beginLeft, begin, vec2.fromValues(-directionWidth[1], directionWidth[0]));
    vec2.add(beginRight, begin, vec2.fromValues(directionWidth[1], -directionWidth[0]));

    vec2.add(endLeft, beginLeft, direction);
    vec2.add(endRight, beginRight, direction);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(beginLeft[0], beginLeft[1]);
    ctx.lineTo(endLeft[0], endLeft[1]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(beginRight[0], beginRight[1]);
    ctx.lineTo(endRight[0], endRight[1]);
    ctx.stroke();

    dist = vec2.dist(begin, end);
    neededPoints = dist / stepSize;
    vec2.normalize(direction, direction);
    let directionStepX = direction[0] * stepSize, directionStepY = direction[1] * stepSize;
    for (let i = 0.0; i < neededPoints; i++) {
        addToGrid(begin[0], begin[1]);
        begin[0] += directionStepX;
        begin[1] += directionStepY;
    }
}

let radius = 0.0, startDir = vec2.fromValues(0.0, 0.0), start = vec2.fromValues(1.0, 0.0), startAngle = 0.0, endAngle = 0.0;

function drawTurn(ctx, begin, center, angle, width, clockwise) {
    radius = vec2.dist(begin, center);
    vec2.subtract(startDir, begin, center);
    vec2.normalize(startDir, startDir);
    startAngle = Math.atan2(startDir[1], startDir[0]);
    endAngle = startAngle + angle;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(center[0], center[1], Math.abs(radius - width / 2), startAngle, endAngle, clockwise);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center[0], center[1], radius + width / 2, startAngle, endAngle, clockwise);
    ctx.stroke();

    // Calculate arc length and steps
    const arcLength = radius * Math.abs(angle);
    const steps = Math.ceil(arcLength / stepSize);

    // Loop through the arc
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = startAngle + t * angle;  // Current angle

        // Count point position
        const px = center[0] + radius * Math.cos(a);
        const py = center[1] + radius * Math.sin(a);

        addToGrid(px, py);
    }
}

// draw Monza track
function drawMonza(ctx, width, startX, startY) {
    // start finist straight
    drawStraight(ctx, vec2.fromValues(startX, startY), vec2.fromValues(startX - 5700, startY), width);

    // 1 and 2 turns
    drawTurn(ctx, vec2.fromValues(startX - 5700, startY), vec2.fromValues(startX - 5700, startY - 1.5 * width), Math.PI / 2.0, width, false);
    drawTurn(ctx, vec2.fromValues(startX - 5700 - 1.5 * width, startY - 1.5 * width), vec2.fromValues(startX - 5700 - 3.0 * width, startY - 1.5 * width), -Math.PI / 2.0, width, true);

    // 3 chicane
    drawTurn(ctx, vec2.fromValues(startX - 5700 - 3.0 * width, startY - 3.0 * width), vec2.fromValues(startX - 5700 - 3.0 * width, startY - 3.0 * width - 5000), Math.PI / 2.0, width, false);

    // 4 and 5 turns
    drawTurn(ctx, vec2.fromValues(startX - 10700 - 3.0 * width, startY - 3.0 * width - 5000), vec2.fromValues(startX - 10700 - 4.5 * width, startY - 3.0 * width - 5000), -Math.PI / 2.0, width, true);
    drawTurn(ctx, vec2.fromValues(startX - 10700 - 4.5 * width, startY - 4.5 * width - 5000), vec2.fromValues(startX - 10700 - 4.5 * width, startY - 6.0 * width - 5000), Math.PI / 2.0, width, false);

    // straight T5 T6
    drawStraight(ctx, vec2.fromValues(startX - 10700 - 6.0 * width, startY - 6.0 * width - 5000), vec2.fromValues(startX - 10700 - 6.0 * width, startY - 6.0 * width - 6300), width);

    // 6 turn
    drawTurn(ctx, vec2.fromValues(startX - 10700 - 6.0 * width, startY - 6.0 * width - 6300), vec2.fromValues(startX - 10700 - 4.5 * width, startY - 6.0 * width - 6300), Math.PI / 2.0, width, false);

    // straight T6 T7
    drawStraight(ctx, vec2.fromValues(startX - 10700 - 4.5 * width, startY - 7.5 * width - 6300), vec2.fromValues(startX - 8700 - 4.5 * width, startY - 7.5 * width - 6300), width);

    // 7 turn 
    drawTurn(ctx, vec2.fromValues(startX - 8700 - 4.5 * width, startY - 7.5 * width - 6300), vec2.fromValues(startX - 8700 - 4.5 * width, startY - 6.0 * width - 6300), Math.PI / 2.0, width, false);

    // straight T7 T8
    drawStraight(ctx, vec2.fromValues(startX - 8700 - 3.0 * width, startY - 6.0 * width - 6300), vec2.fromValues(startX - 8700 - 3.0 * width, startY - 6.0 * width - 4800), width);

    // 8 and 9 and 10 turns
    drawTurn(ctx, vec2.fromValues(startX - 8700 - 3.0 * width, startY - 6.0 * width - 4800), vec2.fromValues(startX - 8700 - 1.5 * width, startY - 6.0 * width - 4800), -Math.PI / 2.0, width, true);
    drawTurn(ctx, vec2.fromValues(startX - 8700 - 1.5 * width, startY - 4.5 * width - 4800), vec2.fromValues(startX - 8700 - 1.5 * width, startY - 3.0 * width - 4800), Math.PI / 2.0, width, false);
    drawTurn(ctx, vec2.fromValues(startX - 8700, startY - 3.0 * width - 4800), vec2.fromValues(startX - 8700 + 1.5 * width, startY - 3.0 * width - 4800), -Math.PI / 2.0, width, true);

    // Straight T10 T11
    drawStraight(ctx, vec2.fromValues(startX - 8700 + 1.5 * width, startY - 1.5 * width - 4800), vec2.fromValues(startX + 1.5 * width, startY - 1.5 * width - 4800), width);

    // 11 chicane
    drawTurn(ctx, vec2.fromValues(startX + 1.5 * width, startY - 1.5 * width - 4800), vec2.fromValues(startX + 1.5 * width, startY - 0.75 * width - 2400), Math.PI, width, false);

    // straight finish
    drawStraight(ctx, vec2.fromValues(startX + 1.5 * width, startY), vec2.fromValues(startX, startY), width);

    // start and finist line
    let i, j, isWhite = true;
    for (i = -width / 8.0; i < width / 4.0; i += width / 16.0) {
        for (j = -width / 2.0; j < width / 2.0; j += width / 16.0) {
            if (isWhite) {
                ctx.fillStyle = "white";
                isWhite = false;
            }
            else {
                ctx.fillStyle = "black";
                isWhite = true;
            }
            ctx.fillRect(i + startX, j + startY, width / 16.0, width / 16.0);
        }
        isWhite = !isWhite;
    }
}

let x = 0.0, y = 0.0;

function drawCoordSystem(context, camera, globalWidth, globalHeight) {
    context.lineWidth = 1;


    context.strokeStyle = "#00FF001F";
    for (x = 0.0; x <= globalWidth; x += 50.0) {
        context.beginPath();
        context.moveTo(x, 0.0);
        context.lineTo(x, globalHeight);
        context.stroke();
    }

    for (y = 0.0; y <= globalHeight; y += 50.0) {
        context.beginPath();
        context.moveTo(0.0, y);
        context.lineTo(globalWidth, y);
        context.stroke();
    }

    context.strokeStyle = "#00D7B6";
    for (x = 0.0; x <= globalWidth; x += gridCellSize) {
        context.beginPath();
        context.moveTo(x, 0.0);
        context.lineTo(x, globalHeight);
        context.stroke();
    }

    for (y = 0.0; y <= globalHeight; y += gridCellSize) {
        context.beginPath();
        context.moveTo(0.0, y);
        context.lineTo(globalWidth, y);
        context.stroke();
    }
}

function checkBorderOfTrack(car) {
    let foundTrack = false;
    let minDistSq = Infinity;
    let posX = Math.floor(car.pos[0] / gridCellSize), posY = Math.floor(car.pos[1] / gridCellSize), trackWidth = 800.0;

    const offsets = [
        [0, 0],   // Current cell
        [1, 0],   // Right
        [-1, 0],  // Left
        [0, 1],   // Down
        [0, -1]   // Up
    ];

    for (let offset of offsets) {
        let key = `${posX + offset[0]},${posY + offset[1]}`;
        if (grid[key]) {
            for (let i = 0; i < grid[key].length; i += 2) {
                let dx = car.pos[0] - grid[key][i];
                let dy = car.pos[1] - grid[key][i + 1];
                let distSq = dx * dx + dy * dy;

                if (distSq < minDistSq) {
                    minDistSq = distSq;
                }

                // Early exit if we find a point very close (on track)
                if (distSq < (trackWidth / 2) * (trackWidth / 2)) {
                    foundTrack = true;
                    break;
                }
            }
        }
        if (foundTrack) break; // Exit outer loop if on track
    }

    // Apply slowdown based on distance
    if (!foundTrack) {
        car.speed *= 0.90;
    }
}

function drawDebug(context, car) {
    let posX = Math.floor(car.pos[0] / gridCellSize), posY = Math.floor(car.pos[1] / gridCellSize)

    const offsets = [
        [0, 0],   // Current cell
        [1, 0],   // Right
        [-1, 0],  // Left
        [0, 1],   // Down
        [0, -1]   // Up
    ];

    for (let offset of offsets) {
        let key = `${posX + offset[0]},${posY + offset[1]}`;
        if (grid[key]) {
            for (let i = 0; i < grid[key].length; i += 2) {
                context.fillRect(grid[key][i] - 1, grid[key][i + 1] - 1, 3, 3);
            }
        }
    }
}

export function drawTrack(context, camera, globalWidth, globalHeight, car) {
    context.save();
    context.translate(-camera.pos[0], -camera.pos[1]);
    drawCoordSystem(context, camera, globalWidth, globalHeight);
    drawMonza(context, 800.0, 20000, 20000);
    checkBorderOfTrack(car);
    context.restore();
}