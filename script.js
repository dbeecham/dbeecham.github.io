var la = linearAlgebra();

var gl;
var positionBuffer;
var colorBuffer;
var indexBuffer;
var canvas;
var positionAttributeLocation;
var colorAttributeLocation;
var matrixAttributeLocation;
var music = document.getElementById("music");
var loadingbox = document.getElementById("loading");
var infobox = document.createElement("div");

var ready = false;
music.addEventListener("canplaythrough", function() {
  loadingbox.style.display = "none";
  infobox.style.position = "absolute";
  infobox.style.top = "10px";
  infobox.style.left = "10px";
  infobox.innerText = "click to start (and to pause)";
  document.body.appendChild(infobox);

});
music.addEventListener("playing", function() {
  infobox.style.display = "none";
});

// ---- music!
var beatBridge;
var beatBridge_stage3 = function(t) {
  return 0;
}
var beatBridge_stage2 = function(t) {
  if (t > 64.51) {
    beatBridge = beatBridge_stage3;
    return beatBridge();
  }
  t = t - 63.5;
  return 1-t*1/(64.51-63.5);
}
var beatBridge_stage1 = function(t) {
  if (t > 63.5) {
    beatBridge = beatBridge_stage2;
    return beatBridge();
  }
  t = t - 53.816;
  return t*1/(63.5-53.816);
}
var beatBridge_stage0 = function(t) {
  if (t > 53.816) {
    beatBridge = beatBridge_stage1;
    return beatBridge();
  }
  return 0;
}
var beatBridge = beatBridge_stage0;

var beatInv;
var beatInv_stage0 = function(t) {
  if (t > 0.5120) {
    beatInv = beatInv_stage1;
    return beatInv();
  }
  return 1;
}
var beatInv_stage1 = function(t) {
  t = t - 0.5120;
  t = t / 1.333;
  return (Math.cos(Math.floor(t)*Math.PI))
}
beatInv = beatInv_stage0;

var beat;
var stage2 = function(t) {
  t = t - 0.5120;
  t = t / 1.333;
  return 0.6*(2 + Math.floor(t) - t)
}
var stage1 = function(t) {
  if (t > 32.50758) {
    beat = stage2;
    return stage2();
  }
  t = t - 0.5120;
  t = t / 1.333;
  return 0.3*(1 + Math.floor(t) - t)
}
var stage0 = function(t) {
  if (t > 0.5120) {
    beat = stage1;
    return beat();
  }
  return 0;
}
beat = stage0;

// ----

var XS = 60;
var YS = 60;
var vertices = [];
for (var i = 0; i < XS; i += 1) {
  for (var j = 0; j < YS; j += 1) {
    vertices = vertices.concat([XS/2-i, 0, YS/2-j]);
  }
}
var tvertices = [];
for (var i = 0; i < vertices.length; i += 1) {
  tvertices[i] = vertices[i];
}

var faces = [];
for (var i = 0; i < XS-1; i += 1) {
  for (var j = 0  ; j < YS-1; j += 1) {
    faces = faces.concat([i + YS*j, i + YS*j + 1, i + YS*j + XS + 1, i + YS*j, i + YS*j + XS, i + YS*j + XS + 1]);
  }
}

var step = 3/vertices.length;
var mycolors = [];
for (var i = 0; i < vertices.length; i++) {
  mycolors = mycolors.concat([0, 0, 1, 1]);
}



la.Matrix.makePerspective = function(fieldOfViewInRadians, aspect, near, far) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  var rangeInv = 1.0 / (near - far);
  return new la.Matrix([
    [f / aspect, 0, 0, 0],
    [0, f, 0, 0],
    [0, 0, (near + far) * rangeInv, -1],
    [0, 0, near * far * rangeInv * 2, 0]
  ]);
};

Array.prototype.max = function() {
  if (this.length === 0) {
    console.log("array length 0!");
    return 0;
  }

  var m = this[0];

  for (var i = 1; i < this.length; i += 1) {
    if (this[i] > m) {
      m = this[i];
    }
  }

  return m;
}

la.Matrix.makeTranslation = function(tx, ty, tz) {
  return new la.Matrix([
     [1,  0,  0,  0],
     [0,  1,  0,  0],
     [0,  0,  1,  0],
     [tx, ty, tz, 1]
  ]);
}
 
la.Matrix.makeXRotation = function(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
 
  return new la.Matrix([
    [1, 0, 0, 0],
    [0, c, -s, 0],
    [0, s, c, 0],
    [0, 0, 0, 1]
  ]);
};
 
la.Matrix.makeYRotation = function(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
 
  return new la.Matrix([
    [c, 0, -s, 0],
    [0, 1, 0, 0],
    [s, 0, c, 0],
    [0, 0, 0, 1]
  ]);
};
 
la.Matrix.makeZRotation = function(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
 
  return new la.Matrix([
     [c, s, 0, 0],
    [-s, c, 0, 0],
     [0, 0, 1, 0],
     [0, 0, 0, 1],
  ]);
}
 
la.Matrix.makeScale = function(sx, sy, sz) {
  return new la.Matrix([
    [sx, 0,  0,  0],
    [0, sy,  0,  0],
    [0,  0, sz,  0],
    [0,  0,  0,  1],
  ]);
}

Array.prototype.flatten = function() {
    return this.reduce(function(a,b){
        return a.concat(b);
    }, [])
}

la.Matrix.prototype.toFlatArray = function() {
    return this.toArray().flatten();
}


function main() {
  canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.addEventListener("mousedown", function() {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
});

  // init GL
  gl = canvas.getContext("webgl");
  //gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  document.body.appendChild(canvas);

  initShaders();

  initBuffers();

  requestAnimationFrame(drawScene);
}

function initShaders() {
  var vertexShaderSource = document.getElementById("3d-vertex-shader").text;
  var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);

  colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  gl.enableVertexAttribArray(colorAttributeLocation);

  matrixAttributeLocation = gl.getUniformLocation(program, "u_matrix");
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function initBuffers() {
  positionBuffer = gl.createBuffer();
  colorBuffer = gl.createBuffer();
  indexBuffer = gl.createBuffer();
  normalBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
/*  gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(icosphere.vertices),
        gl.STATIC_DRAW);*/
  gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW);

  
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mycolors), gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(icosphere.faces), gl.STATIC_DRAW);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.DYNAMIC_DRAW);

}


function calculatePositions(now) {
  now = music.currentTime;
  for (var i = 0; i < vertices.length; i += 3) {
    var x = vertices[i];
    var y = vertices[i + 1];
    var z = vertices[i + 2];

    var nx = x * (1 + now * 0.01);
    tvertices[i] = nx;
    var nz = z * (1 + now * 0.01);
    tvertices[i+2] = nz;

    var d = Math.sqrt(nx * nx + nz * nz);

    var h = 1.3*Math.cos(d/2.3 - now) + Math.sin(x)*Math.cos(z) * 1.8*(beat(now))*beatInv(now)

    var ny = h - 0.3*d + 0.03*d*d*beatBridge(now);
    tvertices[i+1] = ny;

    mycolors[i*4/3] = 1/(1 + Math.exp(-1 * h));
    mycolors[i*4/3 + 1] = 1/(1 + Math.exp(-1 * h));

  }
}

var then = 0;
function drawScene(now) {
  now *= 0.001;
  now = music.currentTime;
  var dt = now - then;
  then = now;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);

  var projectionMatrix =
      la.Matrix.makePerspective(0.2, canvas.width / canvas.height, 1, 1000);
  var translationMatrix =
      la.Matrix.makeTranslation(0,-6*beatBridge(now),-8);

  var matrix = new la.Matrix([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);

  matrix = matrix.dot(new la.Matrix.makeYRotation(0.04*now));
  matrix = matrix.dot(new la.Matrix.makeXRotation(-0.9 + 0.05*Math.sin(now) + 1.2*beatBridge(now)));
  matrix = matrix.dot(translationMatrix);
  matrix = matrix.dot(projectionMatrix);
  matrix = matrix.dot(new la.Matrix.makeScale(0.1,0.1,0.1));
  //matrix = matrix.dot(new la.Matrix.makeXRotation(Math.sin(now) + 3.14));
  //matrix = matrix.dot(projectionMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  calculatePositions(now);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tvertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(positionBuffer, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mycolors), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(colorAttributeLocation,  4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.uniformMatrix4fv(matrixAttributeLocation, false, matrix.toFlatArray());

  gl.drawElements(gl.TRIANGLES, faces.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(drawScene);

}


main();