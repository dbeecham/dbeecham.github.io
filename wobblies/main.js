var canvas = document.getElementById("main");
var context = canvas.getContext("2d");
var typeinput = document.getElementById("type");

var ballsprev = [];
var balls = [];

var types = [];
types[0] = {
    charge: 1,
    mass: 1,
    splitEnergy: 20,
    children: [
        1, 0.5, Math.PI/3,
        1, 0.5, Math.PI
    ],
    color: "#000000"
};

types[1] = {
    charge: -1,
    splitEnergy: 20,
    children: [
        2, 0.5, Math.PI,
        2, 0.5, Math.PI / 3
    ],
    color: "#00FF00"
};

types[2] = {
    charge: 1,
    splitEnergy: 1000000,
    children: [],
    color: "#0000FF"
};

canvas.onmousedown = function(e) {
    var type = parseInt(typeinput.value);
    balls.push(e.x, e.y, 0, 0, type, 0)
    console.log(balls);
};

function draw() {
    context.fillStyle = "#FFFFFF";
    context.strokeStyle = "#000000";
    context.lineWidth = 5;
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = "#000000";
    for (i = 0; i < balls.length; i += 6) {
        var x = balls[i];
        var y = balls[i+1];
        var vx = balls[i+2];
        var vy = balls[i+3];
        var type = balls[i+4];
        var energy = balls[i + 5];
        context.fillStyle = types[type].color;
        context.beginPath();
        context.arc(x, y, Math.sqrt(energy), 0, 2*Math.PI);
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

var step = function() {
    var i, type, energy;

    for (i = 0; i < balls.length; i += 6) {
        energy = balls[i + 5];
        type = balls[i + 4];

        if (energy > types[type].splitEnergy) {
            // balls: x, y, vx, vy, type, energy
            // children: type energy angle

            balls.push(balls[i] + 5 * Math.cos(types[type].children[5]),
                       balls[i + 1] + 5 * Math.sin(types[type].children[5]),
                       balls[i + 2],
                       balls[i + 3],
                       types[type].children[3],
                       balls[i + 5] * types[type].children[4]);


            balls[i] = balls[i] + 5 * Math.cos(types[type].children[2])
            balls[i + 1] = balls[i + 1] + 5 * Math.sin(types[type].children[3]);

            balls[i + 4] = types[type].children[0];
            balls[i + 5] = balls[i + 5] * types[type].children[1];
        }
    }
}

var differential = function(balls) {
    var x, y, vx, vy,
        type, forcex, forcey,
        otherx, othery, 
        dx, dy, distance, normalx, normaly,
        force, returnballs, charge;

    returnballs = balls.slice(0);
    if (balls.length % 6 != 0) {
        console.log(balls);
        return balls;
    }

    for (i = 0; i < balls.length; i += 6) {
        x = balls[i];
        y = balls[i+1];
        vx = balls[i+2];
        vy = balls[i+3];
        type = balls[i+4];
        energy = balls[i + 5];

        forcex = -vx*0.3;
        forcey = -vy*0.3;

        for (j = 0; j < balls.length; j += 6) {
            if (i === j) {
                continue;
            }

            otherx = balls[j];
            othery = balls[j+1];
            othervx = balls[j+2];
            othervy = balls[j+3];
            othertype = balls[j + 4];
            var otherenergy = balls[j + 5];

            dx = otherx - x;
            dy = othery - y;
            distance = Math.sqrt(dx * dx + dy * dy);
            normalx = dx / distance;
            normaly = dy / distance;


            if (distance < (Math.sqrt(energy) + Math.sqrt(otherenergy))) {
                var penalty = (Math.sqrt(energy) + Math.sqrt(otherenergy) - distance);
                force = -penalty;
                forcex += force * normalx;
               forcey += force * normaly;
            }

            force = -types[type].charge * types[othertype].charge * 1.4 * Math.exp((-1) * (distance^2) / 50);
            forcex += force * normalx;
            forcey += force * normaly;

            if (type === balls[j+4]) {
                force = Math.exp(-Math.abs(distance)/100);
                forcex += force * normalx;
                forcey += force * normaly;
            }

        }

        returnballs[i] = vx;
        returnballs[i+1] = vy;
        returnballs[i+2] = forcex;
        returnballs[i+3] = forcey;
        returnballs[i+4] = 0;
        returnballs[i+5] = 1;
    }

    return returnballs;
}

function updateBalls() {
    balls = rungekutta(differential, balls, 0.1);
}

function loop() {
    updateBalls();
    step();
    draw();
    setTimeout(loop, 10);
};
loop();
