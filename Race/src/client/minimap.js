import { vec2 } from "gl-matrix";

let scaleX = 0.0, scaleY = 0.0, contextMM, glbWidth, glbHeight, x, y, mWidth, mHeight;

function drawCoordSystemMM() {
    contextMM.lineWidth = 1;
    contextMM.strokeStyle = "#00D7B6";

    for (x = 0.0; x <= glbWidth * scaleX; x += 1500.0 * scaleX) {
        contextMM.beginPath();
        contextMM.moveTo(x, 0.0);
        contextMM.lineTo(x, glbHeight * scaleY);
        contextMM.stroke();
    }

    for (y = 0.0; y <= glbHeight * scaleY; y += 1500.0 * scaleY) {
        contextMM.beginPath();
        contextMM.moveTo(0.0, y);
        contextMM.lineTo(glbWidth * scaleX, y);
        contextMM.stroke();
    }
}

function drawCarMM(car) {
    if (!car || !car.pos)
        return;

    const pos = new Float32Array(car.pos);
    const x = pos[0];
    const y = pos[1];

    contextMM.fillStyle = "red";
    contextMM.fillRect(x * scaleX - 2.0, y * scaleY - 2.0, 5, 5);
}

let direction = vec2.fromValues(0.0, 0.0), directionWidth = vec2.fromValues(0.0, 0.0), beginLeft = vec2.fromValues(0.0, 0.0),
    endLeft = vec2.fromValues(0.0, 0.0), beginRight = vec2.fromValues(0.0, 0.0), endRight = vec2.fromValues(0.0, 0.0);

function drawStraightMM(ctx, begin, end, width) {
    begin[0] = begin[0] * scaleX;
    begin[1] = begin[1] * scaleY;
    end[0] = end[0] * scaleX;
    end[1] = end[1] * scaleY;
    width = width * scaleX;

    vec2.subtract(direction, end, begin);
    vec2.normalize(directionWidth, direction);
    vec2.multiply(directionWidth, directionWidth, vec2.fromValues(width / 2.0, width / 2.0));

    vec2.add(beginLeft, begin, vec2.fromValues(-directionWidth[1], directionWidth[0]));
    vec2.add(beginRight, begin, vec2.fromValues(directionWidth[1], -directionWidth[0]));

    vec2.add(endLeft, beginLeft, direction);
    vec2.add(endRight, beginRight, direction);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(beginLeft[0], beginLeft[1]);
    ctx.lineTo(endLeft[0], endLeft[1]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(beginRight[0], beginRight[1]);
    ctx.lineTo(endRight[0], endRight[1]);
    ctx.stroke();
}

let radius = 0.0, startDir = vec2.fromValues(0.0, 0.0), start = vec2.fromValues(1.0, 0.0), startAngle = 0.0, endAngle = 0.0;

function drawTurnMM(ctx, begin, center, angle, width, clockwise) {
    begin[0] = begin[0] * scaleX;
    begin[1] = begin[1] * scaleY;
    center[0] = center[0] * scaleX;
    center[1] = center[1] * scaleY;
    width = width * scaleX;

    radius = vec2.dist(begin, center);
    vec2.subtract(startDir, begin, center);
    vec2.normalize(startDir, startDir);
    startAngle = Math.atan2(startDir[1], startDir[0]);
    endAngle = startAngle + angle;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(center[0], center[1], Math.abs(radius - width / 2), startAngle, endAngle, clockwise);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center[0], center[1], radius + width / 2, startAngle, endAngle, clockwise);
    ctx.stroke();
}

function drawMonza(ctx, width, startX, startY) {
    // start finist straight
    drawStraightMM(ctx, vec2.fromValues(startX, startY), vec2.fromValues(startX - 5700, startY), width);

    // 1 and 2 turn
    drawTurnMM(ctx, vec2.fromValues(startX - 5700, startY), vec2.fromValues(startX - 5700, startY - 1.5 * width), Math.PI / 2.0, width, false);
    drawTurnMM(ctx, vec2.fromValues(startX - 5700 - 1.5 * width, startY - 1.5 * width), vec2.fromValues(startX - 5700 - 3.0 * width, startY - 1.5 * width), -Math.PI / 2.0, width, true);

    // 3 chicane
    drawTurnMM(ctx, vec2.fromValues(startX - 5700 - 3.0 * width, startY - 3.0 * width), vec2.fromValues(startX - 5700 - 3.0 * width, startY - 3.0 * width - 5000), Math.PI / 2.0, width, false);

    // 4 and 5 turn
    drawTurnMM(ctx, vec2.fromValues(startX - 10700 - 3.0 * width, startY - 3.0 * width - 5000), vec2.fromValues(startX - 10700 - 4.5 * width, startY - 3.0 * width - 5000), -Math.PI / 2.0, width, true);
    drawTurnMM(ctx, vec2.fromValues(startX - 10700 - 4.5 * width, startY - 4.5 * width - 5000), vec2.fromValues(startX - 10700 - 4.5 * width, startY - 6.0 * width - 5000), Math.PI / 2.0, width, false);

    // straight T5 T6
    drawStraightMM(ctx, vec2.fromValues(startX - 10700 - 6.0 * width, startY - 6.0 * width - 5000), vec2.fromValues(startX - 10700 - 6.0 * width, startY - 6.0 * width - 6300), width);

    // 6 turn
    drawTurnMM(ctx, vec2.fromValues(startX - 10700 - 6.0 * width, startY - 6.0 * width - 6300), vec2.fromValues(startX - 10700 - 4.5 * width, startY - 6.0 * width - 6300), Math.PI / 2.0, width, false);

    // straight T6 T7
    drawStraightMM(ctx, vec2.fromValues(startX - 10700 - 4.5 * width, startY - 7.5 * width - 6300), vec2.fromValues(startX - 8700 - 4.5 * width, startY - 7.5 * width - 6300), width);

    // 7 turn 
    drawTurnMM(ctx, vec2.fromValues(startX - 8700 - 4.5 * width, startY - 7.5 * width - 6300), vec2.fromValues(startX - 8700 - 4.5 * width, startY - 6.0 * width - 6300), Math.PI / 2.0, width, false);

    // straight T7 T8
    drawStraightMM(ctx, vec2.fromValues(startX - 8700 - 3.0 * width, startY - 6.0 * width - 6300), vec2.fromValues(startX - 8700 - 3.0 * width, startY - 6.0 * width - 4800), width);

    // 8 and 9 turns
    drawTurnMM(ctx, vec2.fromValues(startX - 8700 - 3.0 * width, startY - 6.0 * width - 4800), vec2.fromValues(startX - 8700 - 1.5 * width, startY - 6.0 * width - 4800), -Math.PI / 2.0, width, true);
    drawTurnMM(ctx, vec2.fromValues(startX - 8700 - 1.5 * width, startY - 4.5 * width - 4800), vec2.fromValues(startX - 8700 - 1.5 * width, startY - 3.0 * width - 4800), Math.PI / 2.0, width, false);
    drawTurnMM(ctx, vec2.fromValues(startX - 8700, startY - 3.0 * width - 4800), vec2.fromValues(startX - 8700 + 1.5 * width, startY - 3.0 * width - 4800), -Math.PI / 2.0, width, true);

    // straight T10 T11
    drawStraightMM(ctx, vec2.fromValues(startX - 8700 + 1.5 * width, startY - 1.5 * width - 4800), vec2.fromValues(startX + 1.5 * width, startY - 1.5 * width - 4800), width);

    // 11 chicane
    drawTurnMM(ctx, vec2.fromValues(startX + 1.5 * width, startY - 1.5 * width - 4800), vec2.fromValues(startX + 1.5 * width, startY - 0.75 * width - 2400), Math.PI, width, false);

    // straight finish
    drawStraightMM(ctx, vec2.fromValues(startX + 1.5 * width, startY), vec2.fromValues(startX, startY), width);

    // start and finist line
    width = width * scaleX;
    startX = startX * scaleX;
    startY = startY * scaleY;
    let i, j, isWhite = true;
    for (i = -width / 2.0; i < width / 2.0; i += width / 2.0) {
        for (j = -width / 2.0; j < width / 2.0; j += width / 2.0) {
            if (isWhite) {
                ctx.fillStyle = "white";
                isWhite = !isWhite;
            }
            else {
                ctx.fillStyle = "black";
                isWhite = !isWhite;
            }
            ctx.fillRect(i + startX, j + startY, width / 2.0, width / 2.0);
        }
        isWhite = !isWhite;
    }
}

export function initMinimap(globalWidth, globalHeight, minimap) {
    minimap.width = minimap.clientWidth;
    minimap.height = minimap.clientHeight;
    mHeight = minimap.height;
    mWidth = minimap.width;
    scaleX = minimap.clientWidth / globalWidth;
    scaleY = minimap.clientHeight / globalHeight;
    contextMM = minimap.getContext("2d");
    glbHeight = globalHeight;
    glbWidth = globalWidth;
}

let frameCounter = 0.0;

export function drawMinimap(carsOfPlayers) {
    frameCounter += 1.0;
    if (frameCounter % 4.0 !== 0.0)
        return;
    if (contextMM) {
        contextMM.clearRect(0, 0, mWidth, mHeight);

        contextMM.fillStyle = "black";
        contextMM.fillRect(0, 0, mWidth, mHeight);
        drawCoordSystemMM();
        drawMonza(contextMM, 800.0, 20000, 20000);
        for (let name in carsOfPlayers) {
            drawCarMM(carsOfPlayers[name]);
        }
    }
}