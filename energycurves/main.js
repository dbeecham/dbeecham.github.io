/*jslint
  browser
  devel
*/
/*global
  _
  */

var canvas = document.getElementById("cnv");
var context = canvas.getContext("2d");

var quantas = [];

var addQuanta = function (e) {
    'use strict';
    var spread = document.getElementById("spread").value;
    var k = document.getElementById("k").value;
    quantas.push({x: e.offsetX, y: e.offsetY, spread: spread, k: k});
    console.log(quantas);
};

canvas.onmousedown = addQuanta;

var setSpreadT = function () {
    'set strict';
    document.getElementById("spreadt").innerHTML = document.getElementById("spread").value;
};

document.getElementById("spread").onchange = setSpreadT;

var setKT = function () {
    'set strict';
    document.getElementById("kt").innerHTML = document.getElementById("k").value;
};

document.getElementById("k").onchange = setKT;

var energyFromQuanta = function (quanta, x, y) {
    'use static';
    var spread = quanta.spread;
    var k = quanta.k;
    var dx = x - quanta.x;
    var dy = y - quanta.y;
    var norm = Math.sqrt(dx * dx + dy * dy);
    return k * Math.exp(-norm / spread) / spread;
};

var energyField = function (quantas, x, y) {
    'use strict';
    return _.reduce(quantas, function (energy, quanta) {
        return energy + energyFromQuanta(quanta, x, y);
    }, 0);
};

var height;
var heat;
var color;
var draw = function () {
    'use strict';
    _.range(800).forEach(function (x) {
        _.range(600).forEach(function (y) {
            height = energyField(quantas, x, y);
            heat = height / 2.0;
            color = Math.round(heat * 255);
            context.fillStyle = "rgb(" + color + ", " + color + ", " + color + ")";
            context.fillRect(x, y, 1, 1);
        });
    });
};

var lastSeenLength = 0;
function loop() {
    'use strict';
    if (lastSeenLength !== quantas.length) {
        lastSeenLength = quantas.length;
        draw();
    }
    setTimeout(loop, 100);
}

context.fillStyle = "#000000";
context.fillRect(0, 0, 800, 600);
loop();
