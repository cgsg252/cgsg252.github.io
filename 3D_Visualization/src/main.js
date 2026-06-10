import { Pane } from 'tweakpane'
import { mat4, vec3 } from 'gl-matrix';
import { createPrim, DrawPrim } from './prim.js';

let gl;
let startTime;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.enable(gl.DEPTH_TEST);
}
let WindowW = 930.0, WindowH = 930.0, WindowH0 = 0, WindowW0 = 0, MouseX = 0, MouseY = 0,
    IsDown = false, MoveY = 0, MoveX = 0, Scroll = 0;

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let u_time_location, color, u_model_location, window_height, window_width, iteration, zoom;
const params = {
    color: { r: 255, g: 0, b: 255 },
    sensensitivity_X: 0.03,
    sensensitivity_Y: 0.03,
    iteration: 3,
    zoom: 0.1
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

let shaderProgram;

function initShaders() {
    Promise.all([
        loadShaderText("./shaders/vert.glsl"),
        loadShaderText("./shaders/frag.glsl"),
    ])
        .then((shaders) => {
            console.log("shader load");
            const program = gl.createProgram();
            const vs = getShader(shaders[0], gl.VERTEX_SHADER);
            const fs = getShader(shaders[1], gl.FRAGMENT_SHADER);

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
            iteration = gl.getUniformLocation(program, "iteration");
            zoom = gl.getUniformLocation(program, "zoom");
            color = gl.getUniformLocation(program, "color");
            u_model_location = gl.getUniformLocation(program, "u_model");
            shaderProgram = program;
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

let primitive, rotationX = 0, rotationY = 0;
const modelMatrix = mat4.create();

function drawScene() {
    gl.clearColor(0, 0, 0, 1);

    gl.viewport(WindowW0, WindowH0, WindowW, WindowH);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rotationX = (MoveX * -params.sensensitivity_X) * Math.PI / 180.0;
    rotationY = (MoveY * -params.sensensitivity_Y) * Math.PI / 180.0;

    const maxPitch = 89 * Math.PI / 180.0;
    if (rotationY > maxPitch)
        rotationY = maxPitch;
    if (rotationY < -maxPitch)
        rotationY = -maxPitch;

    mat4.identity(modelMatrix);
    mat4.rotate(modelMatrix, modelMatrix, rotationY, [1.0, 0.0, 0.0]);
    mat4.rotate(modelMatrix, modelMatrix, rotationX, [0.0, 1.0, 0.0]);

    let timeFromStart = (Date.now() - startTime);

    if (shaderProgram != null) {
        gl.uniform1f(u_time_location, timeFromStart / 1000.0);
        gl.uniform1f(window_height, WindowH);
        gl.uniform1f(window_width, WindowW);
        gl.uniform1i(iteration, params.iteration);
        gl.uniform1f(zoom, params.zoom);
        gl.uniform3f(color, params.color.r / 255, params.color.g / 255, params.color.b / 255);
        gl.uniformMatrix4fv(u_model_location, false, modelMatrix);

        DrawPrim(primitive, gl, shaderProgram);
    }
    window.requestAnimationFrame(drawScene);
}

export function onStart() {
    let canvas = document.getElementById("webgl-canvas");

    canvas.onmousemove = (ev) => {
        console.log(`(${ev.x}, ${ev.y})`);
        if (IsDown) {
            MoveY = MoveY - MouseY + ev.y;
            MoveX = MoveX + MouseX - ev.x;
        }
        MouseX = ev.x;
        MouseY = ev.y;
    };
    canvas.onmousedown = (ev) => {
        IsDown = true;
        console.log("Mouse down");
    };
    canvas.onmouseup = (ev) => {
        IsDown = false;
        console.log("Mouse up");
    };
    canvas.onwheel = (ev) => {
        if (ev.deltaY < 0)
            Scroll += 15;
        else if (ev.deltaY > 0)
            Scroll -= 15;
        console.log("Mouse wheel move");
    };
    initGL(canvas);
    initShaders();
    initBuffer();

    const vertexData = new Float32Array([
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0
    ]);

    const indexData = new Uint16Array([
        0, 1, 2,
        0, 2, 3
    ]);

    let primdata = {
        vert: vertexData,
        ind: indexData,
        primitiveType: gl.TRIANGLES
    }
    primitive = createPrim(primdata, gl);

    startTime = Date.now();
    drawScene();
}

window.addEventListener("load", () => {
    console.log("Window load");

    const pane = new Pane();

    pane.addBinding(params, "color");
    pane.addBinding(params, "sensensitivity_X", {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Sensitivity X'
    });
    pane.addBinding(params, "sensensitivity_Y", {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Sensitivity Y'
    });
    pane.addBinding(params, 'iteration', {
        min: 1,
        max: 5,
        step: 1,
        label: 'Count of Iterations'
    });
    pane.addBinding(params, 'zoom', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Zoom'
    });
    onStart();
})