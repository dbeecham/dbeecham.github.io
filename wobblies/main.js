var canvas = document.getElementById("main");
var context = canvas.getContext("2d");
var typeinput = document.getElementById("type");

var balls = [];

canvas.onmousedown = function(e) {
    var type = parseInt(typeinput.value);
    balls.push(e.x, e.y, 0, 0, type)
    console.log(balls);
};

function draw() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "#000000";
    for (i = 0; i < balls.length; i += 5) {
        context.fillRect(balls[i], balls[i+1], 10, 10);
    }
}

var rungekutta = function(differential, y, timestep) {
    var k1 = differential(y);
    var k2 = differential(numeric.add(y, numeric.mul(k1, timestep/2)));
    var k3 = differential(numeric.add(y, numeric.mul(k2, timestep/2)));
    var k4 = differential(numeric.add(y, numeric.mul(k3, timestep)));
    return numeric.add(y, numeric.mul(timestep/6, numeric.add(k1, k2, k3, k4)));
}

var differential = function(balls) {
    returnballs = balls.slice(0);
    if (balls.length % 5 != 0) {
        console.log(balls);
        return balls;
    }

    for (i = 0; i < balls.length; i+=5) {

        var x = balls[i];
        var y = balls[i+1];
        var vx = balls[i+2];
        var vy = balls[i+3];
        var type = balls[i+4];
        var forcex = -vx*0.3;
        var forcey = -vy*0.3;

        for (j = 0; j < balls.length; j+=5) {
            if (i === j) {
                continue;
            }

            var otherx = balls[j];
            var othery = balls[j+1];
            var othervx = balls[j+2];
            var othervy = balls[j+3];

            var dx = otherx - x;
            var dy = othery - y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var normalx = dx / distance;
            var normaly = dy / distance;

            var force = -8*Math.exp(-(distance)/10);
            forcex = forcex + force * normalx;
            forcey = forcey + force * normaly;

            if (type != balls[j+4]) {
                continue;
            }

            force = Math.exp(-(distance-20)/20);
            forcex = forcex + force * normalx;
            forcey = forcey + force * normaly;

        }

        returnballs[i] = vx;
        returnballs[i+1] = vy;
        returnballs[i+2] = forcex;
        returnballs[i+3] = forcey;
        returnballs[i+4] = 0;
    }
    return returnballs;
}

function updateBalls() {
    balls = rungekutta(differential, balls, 0.1);
}

function loop() {
    updateBalls();
    draw();
    setTimeout(loop, 10);
};
loop();
