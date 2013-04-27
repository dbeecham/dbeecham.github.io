/*jslint browser: true*/
(function () {
    "use strict";

    var pi = function () {
            var pi = 0,
                i = -1,
                c = -4;

            return function () {
                pi += (c = -c) / (i += 2);
                return pi;
            };
        },

        tau = function () {
            var tau = 0,
                i = -1,
                c = -8;

            return function () {
                tau += (c = -c) / (i += 2);
                return tau;
            };
        },

        sin = function (k, m) {
            var i = 0.01,
                val = 0;

            k = k || 50;
            m = m || 200;

            return function () {
                i += 0.01;
                return k * Math.sin(i) + m;
            };
        },

        tan = function () {
            var i = 1.5708,
                val = 0;

            return function () {
                i += 0.01;
                return Math.tan(i);
            };
        },

        saw = function () {
            var i = 0.01,
                val = 0;

            return function () {
                i += 0.01;
                return i - Math.floor(i);
            };
        },

        text = function (out, algo, step) {
            var i = 0;

            step = step || 0;
            algo = algo || function () { return 0; };

            return function () {
                for (i = 0; i < step - 1; i += 1) {
                    algo();
                }
                out.innerHTML = algo();
            };
        },

        point = function (out, algo, color, x, step) {
            var i = 0,
                ctx = out.getContext("2d");

            algo = algo || function () { return 0; };
            color = color || "#ffffff";
            x = x || 0;
            step = step || 0;


            return function () {
                for (i = 0; i < step - 1; i += 1) {
                    algo();
                }

                x += 1;

                if (x >= out.width) {
                    x = 0;
                }

                ctx.fillStyle = color;
                ctx.fillRect(x, algo(), 1, 1);
            };
        };

    window.addEvent("domready", function () {
        var scene, camera, renderer, geometry, material, cube, winSize, render, mesh;

        winSize = window.getSize();
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, winSize.x / winSize.y, 0.1, 10000);
        camera.position.set(0, 0, 10);
        renderer = new THREE.CanvasRenderer();
        renderer.setSize(winSize.x, winSize.y);
        //geometry = new THREE.IcosahedronGeometry();
        //material = new THREE.MeshBasicMaterial({color: 0xecf0f1, wireframe: true});
        //cube = new THREE.Mesh(geometry, material);
        var loader = new THREE.JSONLoader().load('cube.js', function(geometry) {
            console.log('loaded');
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({wireframe: true}));
            mesh.scale.set(1, 1, 1);
            mesh.position.set(0, 0, 0);
            mesh.rotation.x = 1.5707963267948966;
            scene.add(mesh);
        });
        document.body.innerHTML = "";
        document.body.appendChild(renderer.domElement);

        (function render() {
            requestAnimationFrame(render);
            if (mesh) {
                mesh.rotation.y += 0.01;
                mesh.rotation.z += 0.01;
            }
            renderer.render(scene, camera);
        }());
    });

/*    window.addEvent("domready", function () {
        // Clear screen.
        document.body.innerHTML = "";

        // Create elements, define variables.
        var winSize = window.getSize(),
            piOut = new Element("div", {
                id: "piOutput"
            }),
            tauOut = new Element("div", {
                id: "tauOutput"
            }),
            trigOut = new Element("canvas", {
                width: winSize.x,
                height: winSize.y,
                styles: {
                    position: "absolute",
                    top: 0,
                    left: 0
                }
            }),
            pi0,
            trig0;

        // Append elements.
        document.body.appendChild(piOut);
        document.body.appendChild(tauOut);
        document.body.appendChild(trigOut);

        // Initialize
        pi0 = text(piOut, pi(), 10);
        trig0 = point(trigOut, sin(winSize.y * 0.1, winSize.y - (winSize.y * 0.2)), "#303030");

        // Loop
        (function l() {
            pi0();
            trig0();
            //sinOut();
            //tanOut();
            //sawOut();

            window.setTimeout(function () {l(); }, 33);
        }());
    }); */
}());
