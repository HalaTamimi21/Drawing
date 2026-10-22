const canvas = document.getElementById("gl");
const gl = canvas.getContext("webgl");

if (!gl) {
alert("WebGL not supported");
throw new Error("WebGL not supported");
}

async function loadText(url) {
const res = await fetch(url);

if (!res.ok)
throw new Error("Failed to load " + url);

return await res.text();
}

function createShader(gl, type, source) {
const sh = gl.createShader(type);

gl.shaderSource(sh, source);
gl.compileShader(sh);

if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
console.error(gl.getShaderInfoLog(sh));
gl.deleteShader(sh);
throw new Error("Shader compile failed");
}

return sh;
}

function createProgram(gl, vsSrc, fsSrc) {
const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);

const prog = gl.createProgram();

gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);

if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
console.error(gl.getProgramInfoLog(prog));
gl.deleteProgram(prog);
throw new Error("Program link failed");
}

return prog;
}

async function main() {
const [vsSource, fsSource] = await Promise.all([
loadText("shaders/vertex.glsl"),
loadText("shaders/fragment.glsl")
]);

const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

const vertices = new Float32Array([
// Triangle 1: Red - Upper Left
-0.8, 0.2, // A
-0.2, 0.2, // B
-0.5, 0.8, // C

// Triangle 2: Green - Lower Right
0.2, -0.8, // D
0.8, -0.8, // E
0.5, -0.2 // F
]);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const aPosLoc = gl.getAttribLocation(program, "a_position");

gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

const uColorLoc = gl.getUniformLocation(program, "u_color");

gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Draw the first triangle in red
gl.uniform4f(uColorLoc, 1.0, 0.0, 0.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 0, 3);

// Draw the second triangle in green
gl.uniform4f(uColorLoc, 0.0, 1.0, 0.0, 1.0);
gl.drawArrays(gl.TRIANGLES, 3, 3);
}

main().catch(err => console.error(err));