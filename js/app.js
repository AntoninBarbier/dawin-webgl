// Recupération des shaders GLSL

function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if (xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

// Variables globales du programme

var attribColor, attribPos, canvas, gl, mouseTracker, program, uniformPerspectiveMat,
    uniformTransformMat;

var buffers = [];

var vertexPositions = [];
var vertexColors = [];

var translationValues = { x: 0, y: 0, z: -6.0 };
var rotationValues = { x: 0, y: 0, z: 0 };
var zoom = 1.0;

var yFov = 45 * Math.PI / 180;

function initContext() {
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert("Votre navigateur ne supporte pas WebGL");
    }

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}

function initShaders() {

    //  init sources
    var vertexSource = loadText('shaders/vertex.glsl');
    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSource);

    var fragmentSource = loadText('shaders/fragment.glsl');
    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSource);

    // compile & debug
    gl.compileShader(vertex);
    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader !', gl.getShaderInfoLog(vertex));
    }
    gl.compileShader(fragment);
    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader !', gl.getShaderInfoLog(fragment));
    }

    //  Program creation
    program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, vertex);
    gl.linkProgram(program);
    // debug
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

}

function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribColor = gl.getAttribLocation(program, "color");
    uniformTransformMat = gl.getUniformLocation(program, "transformation");
    uniformPerspectiveMat = gl.getUniformLocation(program, "perspective");
}

function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 12, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribColor, 4, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 9, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

function initPerspective() {
    const aspect = canvas.width / canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;
    var perspectiveMat = mat4.create();
    mat4.perspective(perspectiveMat, yFov, aspect, zNear, zFar);
    gl.uniformMatrix4fv(uniformPerspectiveMat, false, perspectiveMat);
}

function refreshBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["pos"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
}

function generateTransformMatrix() {
    let res = mat4.create();
    let rotationQuat = quat.create();
    quat.rotateX(rotationQuat, rotationQuat, -rotationValues.x);
    quat.rotateY(rotationQuat, rotationQuat, -rotationValues.y);
    quat.rotateZ(rotationQuat, rotationQuat, -rotationValues.z);
    let translationVec = vec3.fromValues(translationValues.x, translationValues.y, translationValues.z);
    let scaleVec = vec3.fromValues(zoom, zoom, zoom);
    mat4.fromRotationTranslationScale(res, rotationQuat, translationVec, scaleVec);
    return res;
}

function initSquare() {
    vertexPositions.push(...[
        // Front face
        -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
        1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0, -1.0, -1.0, -1.0,
        1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
        1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0, -1.0, -1.0, -1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
    ]);
    vertexColors.push(...([
        Array(6).fill([0.7, 0.2, 0.2, 1.0]).flat(),
        Array(6).fill([0.38, 0.7, 0.5, 1.0]).flat(),
        Array(6).fill([0.4, 0.67, 0.7, 1.0]).flat(),
        Array(6).fill([0.9, 0.75, 0.33, 1.0]).flat(),
        Array(6).fill([0.39, 1.0, 0.73, 1.0]).flat(),
        Array(6).fill([0.9, 0.49, 1.0, 1.0]).flat()
    ].flat()));
    refreshBuffers();

}

function getTransformationValues() {

    xTranslation = document.getElementById('xTranslation');
    xTranslation.addEventListener('input', function () {
        translationValues.x = this.value;
    });

    yTranslation = document.getElementById('yTranslation');
    yTranslation.addEventListener('input', function () {
        translationValues.y = this.value;
    });

    zTranslation = document.getElementById('zTranslation');
    zTranslation.addEventListener('input', function () {
        translationValues.z = this.value;
    });

    xRotation = document.getElementById('xRotation');
    xRotation.addEventListener('input', function () {
        rotationValues.x = this.value;
    });

    yRotation = document.getElementById('yRotation');
    yRotation.addEventListener('input', function () {
        rotationValues.y = this.value;
    });

    zRotation = document.getElementById('zRotation');
    zRotation.addEventListener('input', function () {
        rotationValues.z = this.value;
    });

    zoom = document.getElementById('zoom');
    zoom.addEventListener('input', function () {
        zoom = this.value;
    });

}



function draw() {

    requestAnimationFrame(draw);
    let transformMat = generateTransformMatrix();
    gl.uniformMatrix4fv(uniformTransformMat, false, transformMat);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositions.length / 3);

}

function main() {
    initContext();
    initShaders();
    initAttributes();
    initPerspective();
    initBuffers();
    initSquare();
    getTransformationValues();
    draw();
}

