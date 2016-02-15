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
    context.strokeStyle = "#000000";
    context.lineWidth = 5;
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "#000000";
    for (i = 0; i < balls.length; i += 5) {
        var x = balls[i];
        var y = balls[i+1];
        var vx = balls[i+2];
        var vy = balls[i+3];
        var type = balls[i+4];
        for (j = 0; j < balls.length; j += 5) {
            if (i === j) {
                continue;
            }

            var othertype = balls[j+4];

            if (type !== othertype) {
                continue;
            }

            var otherx = balls[j];
            var othery = balls[j+1];
            var othervx = balls[j+2];
            var othervy = balls[j+3];

            var dx = otherx - x;
            var dy = othery - y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 40) {
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(otherx, othery);
                context.stroke();
            }

        }
        context.beginPath();
        context.arc(x, y, 5, 0, 2*Math.PI);
        context.fill();
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
    var x;
    var y;
    var vx;
    var vy; 
    var type; 
    var forcex; 
    var forcey; 
    var otherx; 
    var othery; 
    var othervx; 
    var othervy; 
    var dx; 
    var dy;
    var distance; 
    var normalx; 
    var normaly; 
    var force;


    returnballs = balls.slice(0);
    if (balls.length % 5 != 0) {
        console.log(balls);
        return balls;
    }

    for (i = 0; i < balls.length; i+=5) {
        x = balls[i];
        y = balls[i+1];
        vx = balls[i+2];
        vy = balls[i+3];
        type = balls[i+4];
        forcex = -vx*0.3;
        forcey = -vy*0.3;

        for (j = 0; j < balls.length; j+=5) {
            if (i === j) {
                continue;
            }

            otherx = balls[j];
            othery = balls[j+1];
            othervx = balls[j+2];
            othervy = balls[j+3];

            dx = otherx - x;
            dy = othery - y;
            distance = Math.sqrt(dx * dx + dy * dy);
            normalx = dx / distance;
            normaly = dy / distance;

            force = -10*Math.exp(-(distance)/20);
            forcex += force * normalx;
            forcey += force * normaly;

            if (type != balls[j+4]) {
                continue;
            }

            force = 10*Math.exp(-Math.abs(distance-40)^2/10);
            forcex += force * normalx;
            forcey += force * normaly;

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
