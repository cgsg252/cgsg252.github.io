export function createPrim(data, gl) {
    const vert = data.vert, ind = data.ind, primitiveType = data.primitiveType;

    if (vert == null) {
        console.error("No vertices in primitive");
        return;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, vert, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    let ibuf = null;
    let count = vert.length / 3;

    if (ind != null) {
        ibuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW);
        count = ind.length;
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        vao: vao,
        vbuf: vbuf,
        ibuf: ibuf,
        primitiveType: primitiveType,
        count: count
    };
}

export function DrawPrim(prim, gl, shaderProgram) {
    gl.useProgram(shaderProgram);
    gl.bindVertexArray(prim.vao);
    if (prim.ibuf == null)
        gl.drawArrays(prim.primitiveType, 0, prim.count);
    else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prim.ibuf);
        gl.drawElements(prim.primitiveType, prim.count, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    gl.bindVertexArray(null);
}