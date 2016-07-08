var gl = null;
var shaderProgram = null;

var planeVertexPositionBuffer = null;
var planeVertexTextureCoordBuffer = null;
var planeVertexIndexBuffer = null;


var vertex_shader =
    "attribute vec3 aVertexPosition;" +
    "attribute vec2 aTextureCoord;" +

    "uniform mat4 uPMatrix;" +

    "varying vec2 vTextureCoord;" +
    "varying vec4 vPosition;" +

    "void main(void) {" +
    "    vPosition = vec4(aVertexPosition, 1.0);" +
    "    gl_Position = uPMatrix * vPosition;" +
    "    vTextureCoord = aTextureCoord;" +
    "}";


var fragment_shader =
    "precision mediump float;" +

    "varying vec2 vTextureCoord;" +

    "uniform sampler2D uSampler;" +
    "uniform float uDx;" +
    "uniform float uDy;" +

    "void main(void) {" +
    "    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));" +

    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s - uDx, vTextureCoord.t - uDy));" +
    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s - uDx, vTextureCoord.t));" +
    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s - uDx, vTextureCoord.t + uDy));" +
        
    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t - uDy));" +
    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t + uDy));" +

    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s + uDx, vTextureCoord.t - uDy));" +
    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s + uDx, vTextureCoord.t));" +
    "    textureColor += texture2D(uSampler, vec2(vTextureCoord.s + uDx, vTextureCoord.t + uDy));" +

    "    gl_FragColor = textureColor;" +
    "}";


function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry.");
    }
}


function getShader(gl, type, str) {
    var shader;
    if (type == "f") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "v") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


function initShaders(width, height) {
    var fragmentShader = getShader(gl, "f", fragment_shader);
    var vertexShader = getShader(gl, "v", vertex_shader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.dxUniform =      gl.getUniformLocation(shaderProgram, "uDx");
    shaderProgram.dyUniform =      gl.getUniformLocation(shaderProgram, "uDy");

    shaderProgram.dx = 1.0 / width;
    shaderProgram.dy = 1.0 / height;

    return shaderProgram;
}


function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}


var texture_ = null;

function initTextures(height) {
    texture_ = gl.createTexture();
    texture_.image = new Image();
    texture_.image.onload = function () {
        handleLoadedTexture(texture_)
    }
    texture_.image.src = "resources/image_" + height + ".png";
}


var pMatrix = mat4.create();


var rttFramebuffer = null;
var rttTexture = null;


function initTextureFramebuffer(width, height) {
    rttFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    rttFramebuffer.width = width;
    rttFramebuffer.height = height;

    rttTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rttTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


function initBuffers() {
    // Vertices
    planeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planeVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0,  -1.0,
         1.0, -1.0,  -1.0,
         1.0,  1.0,  -1.0,
        -1.0,  1.0,  -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    planeVertexPositionBuffer.itemSize = 3;
    planeVertexPositionBuffer.numItems = 4;

    // Texture coords
    planeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planeVertexTextureCoordBuffer);
    var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    planeVertexTextureCoordBuffer.itemSize = 2;
    planeVertexTextureCoordBuffer.numItems = 4;

    // Indices
    planeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeVertexIndexBuffer);
    var planeVertexIndices = [
        0, 1, 2,      0, 2, 3
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(planeVertexIndices), gl.STATIC_DRAW);
    planeVertexIndexBuffer.itemSize = 1;
    planeVertexIndexBuffer.numItems = 6;
}



function drawSceneOnPlane() {
    gl.viewport(0, 0, rttFramebuffer.width, rttFramebuffer.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(90, 1.0, 0.1, 100.0, pMatrix);
    //mat4.ortho(pMatrix, -1.0, 1.0, 1.0, -1.0, 0.1, 10.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, planeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, planeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeVertexIndexBuffer);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.drawElements(gl.TRIANGLES, planeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.bindTexture(gl.TEXTURE_2D, rttTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    gl.uniform1f(shaderProgram.dxUniform, shaderProgram.dx);
    gl.uniform1f(shaderProgram.dyUniform, shaderProgram.dy);
}



function drawScene() {
    
    var t1 = new Date().getTime();
    
    // RTT
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    drawSceneOnPlane();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // End: RTT
    
    var t2 = new Date().getTime();    

    {
        // ............................................................... //
        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);

        var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        var img_out = document.getElementById('image_out');
        var context_out = img_out.getContext('2d');
        
        var imageData = context_out.getImageData(0, 0, img_out.width, img_out.height);

        var data = imageData.data;
        for (var p = 0; p < data.length; p += 4) {
            data[p    ] = pixels[p];
            data[p + 1] = pixels[p + 1];
            data[p + 2] = pixels[p + 2];
            data[p + 3] = 255;
        }

//        imageData.data = new Uint8ClampedArray(pixels, img_out.width * img_out.height * 4);

        context_out.putImageData(imageData, 0, 0);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // ............................................................... //
    }

    var t3 = new Date().getTime();

    console.log("D1 :" + (t2 - t1));
    console.log("D2 :" + (t3 - t2));
}


var frame = 0;

function tick() {
    if (frame < 5) {
        requestAnimFrame(tick);
    }
    drawScene();
    
    frame++;
}


function webGLStart(width, height) {
    var canvas = document.getElementById("lesson16-canvas");
    initGL(canvas);
    initTextureFramebuffer(width, height);
    shaderProgram = initShaders(width, height);
    initBuffers();
    
    var t1 = new Date().getTime();
    
    initTextures(height);
    
    var t2 = new Date().getTime();
    console.log("Texture load : " + (t2 - t1));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    tick();
}

