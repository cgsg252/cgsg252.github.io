import { add } from './math.js'
import { Pane } from 'tweakpane'

let gl;
let startTime;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}
let WindowW = 930.0, WindowH = 930.0, WindowH0 = 0.0, WindowW0 = 0.0, MouseX = 0.0, MouseY = 0.0,
    IsDown = false, MoveY = 0.0, MoveX = 0.0, Scroll = 1.0, CoefX = 0.0, CoefY = 0.0;

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let window_height, window_width, u_time_location, movex, movey, movewheel, color, factorTime, factorAdd, mousex, mousey,
    coefx, coefy;
const params = {
    time_fractal_factor: -0.45,
    add_fractal_factor: -0.10,
    color: { r: 255, g: 0, b: 255 },
    title: "Julia fractal"
};

function loadShaderText(uri) {
    return fetch(uri)
        .then((response) => {
            if (!response.ok) {
                throw "Resource not found";
            }
            return response.text();
        })
        .then((text) => {
            return text;
        });
}

function initShaders() {
    Promise.all([
        loadShaderText("./shaders/vert.glsl"),
        loadShaderText("./shaders/frag.glsl"),
    ])
        .then((shaders) => {
            console.log("shader load");
            const vs = getShader(shaders[0], gl.VERTEX_SHADER);
            const fs = getShader(shaders[1], gl.FRAGMENT_SHADER);

            const program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                alert("Program linkage error");
                return;
            }

            gl.useProgram(program);

            u_time_location = gl.getUniformLocation(program, "u_time");
            window_height = gl.getUniformLocation(program, "window_height");
            window_width = gl.getUniformLocation(program, "window_width");
            movey = gl.getUniformLocation(program, "movey");
            movex = gl.getUniformLocation(program, "movex");
            movewheel = gl.getUniformLocation(program, "scroll");
            color = gl.getUniformLocation(program, "color");
            factorTime = gl.getUniformLocation(program, "factortime");
            factorAdd = gl.getUniformLocation(program, "factoradd");
            mousex = gl.getUniformLocation(program, "MouseX");
            mousey = gl.getUniformLocation(program, "MouseY");
            coefx = gl.getUniformLocation(program, "coefX");
            coefy = gl.getUniformLocation(program, "coefY");
        })
        .catch((error) => {
            console.log(error);
        });
}

let vertexBuffer;
function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0, 1, 0, 1);

    gl.viewport(WindowW0, WindowH0, WindowW, WindowH);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let timeFromStart = (Date.now() - startTime);
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1f(window_height, WindowH);
    gl.uniform1f(window_width, WindowW);
    gl.uniform1f(movey, MoveY);
    gl.uniform1f(movex, MoveX);
    gl.uniform1f(movewheel, Scroll);
    gl.uniform3f(color, params.color.r / 255, params.color.g / 255, params.color.b / 255);
    gl.uniform1f(factorTime, params.time_fractal_factor);
    gl.uniform1f(factorAdd, params.add_fractal_factor);
    gl.uniform1f(mousex, MouseX);
    gl.uniform1f(mousey, MouseY);
    gl.uniform1f(coefx, CoefX);
    gl.uniform1f(coefy, CoefY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(drawScene);
}

let oldScroll = 0.0, mouseCenterX, mouseCenterY;

export function onStart() {
    let canvas = document.getElementById("webgl-canvas");

    canvas.onmousemove = (ev) => {
        console.log(`(${ev.x}, ${ev.y})`);
        if (IsDown) {
            MoveX -= (ev.x - MouseX) * Scroll;
            MoveY += (ev.y - MouseY) * Scroll;
        }
        MouseX = ev.x;
        MouseY = ev.y;
    };
    canvas.onmousedown = (ev) => {
        IsDown = true;
        console.log(1);
    };
    canvas.onmouseup = (ev) => {
        IsDown = false;
        console.log(2);
    };
    canvas.onwheel = (ev) => {
        let mouseFractalX = (MouseX - 930.0 * 0.5) * Scroll + MoveX;
        let mouseFractalY = ((930.0 - MouseY) - 930.0 * 0.5) * Scroll + MoveY;

        if (ev.deltaY < 0) {
            Scroll *= 0.85;
        } else if (ev.deltaY > 0) {
            Scroll /= 0.85;
        }

        if (Scroll > 1.0) {
            Scroll = 1.0;
        }

        MoveX = mouseFractalX - (MouseX - 930.0 * 0.5) * Scroll;
        MoveY = mouseFractalY - ((930.0 - MouseY) - 930.0 * 0.5) * Scroll;

        if (Scroll === 1.0) {
            MoveX = 0.0;
            MoveY = 0.0;
        }

        CoefX = 0.0;
        CoefY = 0.0;

        console.log(3);
    };
    initGL(canvas);
    initShaders();
    initBuffer();

    startTime = Date.now();
    drawScene();
}

window.addEventListener("load", () => {
    console.log("Window load");
    console.log(add(1, 2));

    const pane = new Pane();

    const folder = pane.addFolder({
        title: 'Fractal',
        expanded: true
    });

    pane.addBinding(params, "time_fractal_factor");
    pane.addBinding(params, "add_fractal_factor");
    pane.addBinding(params, "color");
    pane.addBinding(params, "title");
    onStart();
})