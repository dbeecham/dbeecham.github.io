/*jslint browser: true*/

var god = function (settings) {
    "use strict";

    // ===============
    // Local variables {{{
    // ===============
    var initThree,
        loadModels,
        light,
        loop,
        cp,
        initObjects,
        loadTextures,
        scene,
        camera,
        renderer,
        object,
        vector,
        fixed,
        orbitalVector,
        cube,
        sphere,
        linear,
        models,
        jsonLoader,
        objects,
        textures = {},
        append,
        cos,
        sin,
        fixedVector,
        linearVector,
        sinVector,
        cosVector;
    // ===============
    // Local variables }}}
    // ===============


    // ===============
    // Default variables {{{
    // ===============
    settings             = (settings             !== 'undefined' ? settings :             {});
    settings.fov         = (settings.fov         !== 'undefined' ? settings.fov :         75);
    settings.near        = (settings.near        !== 'undefined' ? settings.near :        0.1);
    settings.far         = (settings.far         !== 'undefined' ? settings.far :         1000);
    settings.width       = (settings.width       !== 'undefined' ? settings.width :       800);
    settings.height      = (settings.height      !== 'undefined' ? settings.height :      600);
    settings.replaceHTML = (settings.replaceHTML !== 'undefined' ? settings.replaceHTML : true);
    settings.parent      = (settings.parent      !== 'undefined' ? settings.parent :      document.body);
    // ===============
    // Default variables }}}
    // ===============


    // ===============
    // Helper functions {{{
    // ===============

    linear = function (k, m) { // {{{

        // Default values
        m = (m !== 'undefined' ? m : 0);
        k = (k !== 'undefined' ? k : 0.01);

        return function () {
            m += k;
            return m;
        };
    }; // linear }}}

    linearVector = function (k, m) { // {{{
        // Variables
        var v;

        // Default values
        m = (m !== 'undefined' ? m : 0);
        k = (k !== 'undefined' ? k : 0.01);

        v = vector(
            linear(k, m),
            linear(k, m),
            linear(k, m)
        );


        return function () {
            return v();
        };
    }; // }}}

    fixed = function (m) { // {{{

        // Default values
        m = (m !== 'undefined' ? m : 0);


        return function () {
            return m;
        };
    }; // fixed }}}

    fixedVector = function (m) { // {{{
        // Variables
        var v;

        // Default values
        m = (m !== 'undefined' ? m : 0);

        v = vector(
            fixed(m),
            fixed(m),
            fixed(m)
        );


        return function () {
            return v();
        };
    }; // }}}

    vector = function (funcX, funcY, funcZ) { // {{{
        // Variables
        var v = new THREE.Vector3();

        // Default values
        funcX = (funcX !== 'undefined' ? funcX : function () { return 0; });
        funcY = (funcY !== 'undefined' ? funcY : function () { return 0; });
        funcZ = (funcZ !== 'undefined' ? funcZ : function () { return 0; });

        return function () {
            v.x = funcX();
            v.y = funcY();
            v.z = funcZ();

            return v;

        };
    }; // fixed }}}

    sin = function (angle, velocity, k, m) { // {{{

        // Default values
        angle = (angle !== 'undefined' ? angle : 0);
        velocity = (velocity !== 'undefined' ? velocity : 0.01);
        k = (k !== 'undefined' ? k : 1);
        m = (m !== 'undefined' ? m : 0);

        return function () {
            angle += velocity;
            return k * Math.sin(angle) + m;
        };
    }; // }}}

    sinVector = function (angle, velocity, k, m) { // {{{
        // Variables
        var v;

        // Default values
        angle = (angle !== 'undefined' ? angle : 0);
        velocity = (velocity !== 'undefined' ? velocity : 0.01);
        k = (k !== 'undefined' ? k : 1);
        m = (m !== 'undefined' ? m : 0);

        v = vector(
            sin(angle, velocity, k, m),
            sin(angle, velocity, k, m),
            sin(angle, velocity, k, m)
        );

        return function () {
            return v();
        };
    }; // }}}

    cos = function (angle, velocity, k, m) { // {{{

        // Default values
        angle = (angle !== 'undefined' ? angle : 0);
        velocity = (velocity !== 'undefined' ? velocity : 0.01);
        k = (k !== 'undefined' ? k : 1);
        m = (m !== 'undefined' ? m : 0);

        return function () {
            angle += velocity;
            return k * Math.cos(angle) + m;
        };
    }; // }}}

    cosVector = function (angle, velocity, k, m) { // {{{
        // Variables
        var v;

        // Default values
        angle = (angle !== 'undefined' ? angle : 0);
        velocity = (velocity !== 'undefined' ? velocity : 0.01);
        k = (k !== 'undefined' ? k : 1);
        m = (m !== 'undefined' ? m : 0);

        v = vector(
            cos(angle, velocity, k, m),
            cos(angle, velocity, k, m),
            cos(angle, velocity, k, m)
        );

        return function () {
            return v();
        };
    }; // }}}

    orbitalVector = function (radius, angle, velocity, funcTop, top) { // {{{
        // Variables
        var v;

        // Default values
        radius = (radius !== 'undefined' ? radius : 1);
        angle = (angle !== 'undefined' ? angle : 0);
        velocity = (velocity !== 'undefined' ? velocity : 0.01);
        funcTop = (funcTop !== 'undefined' ? funcTop : function () { return 0; });

        v = vector(
            sin(angle, velocity, radius),
            funcTop,
            cos(angle, velocity, radius)
        );


        return function () {
            return v();
        };
    }; // orbitalVector }}}

    object = function (geometry, material, funcPos, funcRot, funcScale) { // {{{
        var mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        return {
            mesh: mesh,
            geometry: geometry,
            material: material,
            step: function () {
                mesh.rotation.copy(funcRot());
                mesh.position.copy(funcPos());
                mesh.scale.copy(funcScale());
            }
        };
    }; // }}}


    // ===============
    // Helper functions }}}
    // ===============


    // ==============
    // Vital functions {{{
    // ==============

    initThree = function (callback) { // {{{
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(settings.fov,
                                                  settings.width / settings.height,
                                                  settings.near,
                                                  settings.far);
        cp = vector(
            fixed(0),
            cos(0, 0.01, 4, 0),
            fixed(10)
        );

        camera.position.copy(cp());

        light = new THREE.Light(0xffffff);
        light.position.copy(camera.position);
        scene.add(light);

        // Renderer
        if (Modernizr.canvas) {
            renderer = new THREE.CanvasRenderer();
        } else {
            // TODO: Proper fallback.
            console.log("ALERT! ALERT! ALERT!");
        }

        renderer.setSize(settings.width, settings.height);

        callback();

    }; // initThree }}}

    loadModels = function (callback) { // {{{
        var totalModels = 4,
            loadedModels = 0,

            cont = function () {
                loadedModels += 1;
                if (loadedModels === totalModels) {
                    callback();
                }
            };

        models = {};
        models.cube = new THREE.CubeGeometry(1, 1, 1);
        cont();

        models.octahedron = new THREE.OctahedronGeometry();
        cont();

        jsonLoader = new THREE.JSONLoader();

        jsonLoader.load('js/models/icosphere2.js', function (geometry, materials) {
            models.icosphere2 = geometry;
            cont();
        });

        jsonLoader.load('js/models/icosphere1.js', function (geometry, materials) {
            models.icosphere1 = geometry;
            cont();
        });

    }; // loadModels }}}

    loadTextures = function (callback) { // {{{
        // Will perhaps load textures through externals later.
        // Simple for now.
        textures.wireframe0 = new THREE.MeshBasicMaterial({wireframe: true, wireframeLinewidth: 1.2, color: 0xecf0f1});
        textures.wireframe1 = new THREE.MeshBasicMaterial({wireframe: true, wireframeLinewidth: 1.2, color: 0x2ecc71});
        textures.wireframe2 = new THREE.MeshBasicMaterial({wireframe: true, wireframeLinewidth: 1.2, color: 0x2980b9});
        textures.wireframe3 = new THREE.MeshBasicMaterial({wireframe: true, wireframeLinewidth: 1.2, color: 0x1abc9c});

        callback();
    }; // loadTextures }}}

    initObjects = function (callback) { // {{{

        var i = 0;

        objects = [];

        // Center object

        objects[i] = object(models.icosphere2,
                            textures.wireframe0,
                            fixedVector(),
                            vector(fixed(), linear(-0.005), fixed()),
                            fixedVector(1));
        i += 1;

        // First circle
        (function () {
            var numObjects = 4,
                j = i,
                radius = 2.5,
                angle = Math.PI * 2 / numObjects;

            for (i; i < (j + numObjects); i += 1) {

                objects[i] = object(
                    models.cube,
                    textures.wireframe1,
                    orbitalVector(radius, i * angle, 0.01, cos(0, 0.01, 0.5, 0)),
                    vector(fixed(), linear(-0.02), linear(-0.01)),
                    fixedVector(0.624)
                );
            }
        }());

        // First circle mirror
        (function () {
            var numObjects = 4,
                j = i,
                radius = 2.5,
                angle = Math.PI * 2 / numObjects;

            for (i; i < (j + numObjects); i += 1) {
                objects[i] = object(models.cube,
                                    textures.wireframe1,
                                    orbitalVector(radius, (angle / 2) + i * angle, 0.01, sin(0, 0.01, 0.5, 0)),
                                    vector(fixed(), linear(-0.02), linear(-0.01)),
                                    fixedVector(0.624));
            }
        }());

        // Second circle
        (function () {
            var numObjects = 4,
                j = i,
                radius = 3.0,
                angle = Math.PI * 2 / numObjects;

            for (i; i < (j + numObjects); i += 1) {
                objects[i] = object(models.icosphere1,
                                    textures.wireframe2,
                                    orbitalVector(radius, (angle / 3) + i * angle, -0.004, fixed(-1.3)),
                                    vector(fixed(), linear(-0.02), linear(-0.01)),
                                    fixedVector(0.389));
            }
        }());

        // Third circle
        (function () {
            var numObjects = 4,
                j = i,
                radius = 3.0,
                angle = Math.PI * 2 / numObjects;

            for (i; i < (j + numObjects); i += 1) {
                objects[i] = object(models.icosphere1,
                                    textures.wireframe2,
                                    orbitalVector(radius, (angle / 3) + i * angle, -0.01, fixed(1.3)),
                                    vector(fixed(), linear(-0.02), linear(-0.01)),
                                    fixedVector(0.389));
            }
        }());

        // Third circle mirror
        (function () {
            var numObjects = 4,
                j = i,
                radius = 1.3,
                angle = Math.PI * 2 / numObjects;

            for (i; i < (j + numObjects); i += 1) {
                objects[i] = object(models.octahedron,
                                    textures.wireframe3,
                                    orbitalVector(radius, (angle / 3) + i * angle, 0.01, fixed(2.3)),
                                    vector(fixed(), linear(-0.02), linear(-0.01)),
                                    sinVector(0, 0.005, 0.2, 0.389));
            }
        }());

        (function () {
            var numObjects = 4,
                j = i,
                radius = 1.3,
                angle = Math.PI * 2 / numObjects;

            for (i; i < (j + numObjects); i += 1) {
                objects[i] = object(models.octahedron,
                                    textures.wireframe3,
                                    orbitalVector(radius, (angle / 3) + i * angle, 0.01, fixed(-2.3)),
                                    vector(fixed(), linear(-0.02), linear(-0.01)),
                                    fixedVector(0.389));
            }
        }());

        callback();

    }; // initObjects }}}

    append = function (callback) { // {{{
        if (settings.replaceHTML) {
            settings.parent.innerHTML = "";
        }

        settings.parent.appendChild(renderer.domElement);

        callback();
    }; // append }}}

    loop = function loop() { // {{{
        var i;
        requestAnimationFrame(loop);

        // Update camera.
        camera.position.copy(cp());
        camera.lookAt(objects[0].mesh.position);

        // Update all objects.
        for (i = 0; i < objects.length; i += 1) {
            objects[i].step();
        }

        renderer.render(scene, camera);
    }; // loop }}}

    // ==============
    // Vital functions }}}
    // ==============


    // TODO: Better fallback model. Cascading would be preferable.
    initThree(function () {
        loadModels(function () {
            loadTextures(function () {
                initObjects(function () {
                    append(function () {
                        loop();
                    });
                });
            });
        });
    });

    return {
        camera: camera
    };
};

var g;

window.addEvent("domready", function () {
    "use strict";
    var size = window.getSize();
    g = god({width: size.x, height: size.y});
});
