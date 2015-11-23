//var Landscape = (function () {

//    var ctor = function (w,h) {
//        var image;
//        var texture = [];
//        var map = [];
//        image = new ImageData(new Uint8ClampedArray(1166400), w, h);
//        var data = image.data;
//        var interpolate = function (e, t, n) {
//            return (t >> 16) * n + (e >> 16) * (1 - n) << 16 |
//            (t & 255 * 256) * n + (e & 255 * 256) * (1 - n) & 255 * 256 |
//            (t & 255) * n + (e & 255) * (1 - n);
//        };
//        var mapHeight = function (e, t) {
//            return 4 + 3 * Math.sin(e / 8) * Math.sin(e / 8 + t / 5);
//        };
//        for (var s = 0; 2e7 > s; s++)
//            o = s >> 18 & 63,
//            map[s] = o <= mapHeight(s & 1023, s >> 10 & 255) ? 2 > o ? 1 : 2 : 0;
//        for (s = 0; 1023 > s; s++)
//            for (o = 1023 * Math.random(), u = 255 * Math.random(), a = mapHeight(o, u),
//                 f = -1; 2 > f; f++)
//                for (l = -1; 2 > l; l++)
//                    for (p = -1; 2 > p; p++)

//                        2 < a &&

//                        (map[o | u << 10 | a + p + 1 << 18] = 5) &&

//                        1 - f * l * p &&
//                        (map[o + f | u + l << 10 | a + p + 4 << 18] = 4);

//        for (a = 0; 16 > a; a++)

//            for (s = 0; 3 > s; s++)

//                for (o = 0; 16 > o; o++)
//                    for (u = 0; 16 > u; u++)

//                        p = 1 - Math.random() / 3,


//                        f = 2 > a ? 4210943 : 5 > a ? 6990400 : 9858122,

//                        l = Math.sin(2 * u) + u / 8,


//                        1 - s && (p /= 1.5 + s / 2) &&


//                        2 == a && o > l + 1 &&
//                        (f = 9858122, p *= 1 - 1 / o),


//                        texture[u + 16 * (15 - o) + 256 * s + 1023 * a] = interpolate(0, f, p);



//        this.mapHeight = mapHeight;
//        this.interpolate = interpolate;
//        this.map = map;
//        this.imageData = data;
//        this.image = image;
//        this.texture = texture;
//    }



//    return ctor;

//})();


//var o = new Date / 2000;
//var k = 405;
//var M = 720;

//var world = this.settings.world;
//var u = Math.cos(Math.sin(o)),
//a = Math.sin(Math.sin(o)),
//    f = [16 * o % 1023, world.mapHeight(16 * o % 1023, 63 + 16 * Math.sin(o)) + 2, 63 +
//        16 * Math.sin(o)
//    ],
//    h = [],
//    p = [],
//    d = m = l = 0;

//for (s = 0; k > s; s++)
//    for (o = 0; M > o; o++) {
//        var v = o / k - 1,

//            g = [a * v + u, .51 - s / k, a - u * v],
//            b = 32;
//        for (q = 0; 3 > q; q++) {
//            var w = g[q],
//                v = f[q] - ~~f[q],
//                D = 1 / w;
//            0 < w ? v = 1 - v : D = -D;
//            var I = D * v;

//            for (d = 0; 3 > d; d++)
//                p[d] = f[d] + (h[d] = g[d] * D) * v;

//            for (0 > w && p[q]--; I < b;) {
//                (w = world.map[p[0] & 1023 |
//                    (p[1] & 63) << 18 |
//                    (p[2] & 255) << 10]) &&
//                    (b = I, v = p[0], d = p[2],
//                        1 - q && (v += d, d = p[1]),

//                    m = world.texture[(16 * v & 15) + 16 * (16 * d & 15)
//                          + 1023 * w + 256 * q]);

//                for (d = 0; 3 > d; d++)
//                    p[d] += h[d];
//                I += D;
//            }
//        }
//        var m = world.interpolate(m, 3 * 4210943, b * b / 1023);
//        world.imageData[l++] = m >> 16 & 255;
//        world.imageData[l++] = m >> 8 & 255;
//        world.imageData[l++] = m & 255;
//        world.imageData[l++] = 255;
//    }

////  c.putImageData(world.image, 0, 0);
//worker.postMessage(world.image);

var Noc = {};

Noc.Point3D = (function () {


    var point = function (_x, _y, _z) {

        this.x = _x;
        this.y = _y;
        this.z = _z;

        this.rotateX = function (angle) {
            var rad, cosa, sina, y, z;
            rad = angle * Math.PI / 180;
            cosa = Math.cos(rad);
            sina = Math.sin(rad);
            y = this.y * cosa - this.z * sina;
            z = this.y * sina + this.z * cosa;
            return new Noc.Point3D(this.x, y, z);
        }

        this.rotateY = function (angle) {
            var rad, cosa, sina, x, z;
            rad = angle * Math.PI / 180;
            cosa = Math.cos(rad);
            sina = Math.sin(rad);
            z = this.z * cosa - this.x * sina;
            x = this.z * sina + this.x * cosa;
            return new Noc.Point3D(x, this.y, z);
        }

        this.rotateZ = function (angle) {
            var rad, cosa, sina, x, y;
            rad = angle * Math.PI / 180;
            cosa = Math.cos(rad);
            sina = Math.sin(rad);
            x = this.x * cosa - this.y * sina;
            y = this.x * sina + this.y * cosa;
            return new Point3D(x, y, this.z);
        }

        this.project = function (viewWidth, viewHeight, fov, viewDistance) {
            var factor, x, y;
            factor = fov / (viewDistance + this.z);
            x = this.x * factor + viewWidth / 2;
            y = this.y * factor + viewHeight / 2;
            return new Noc.Point3D(x, y, this.z);
        }

    };

    return point;


})();


var vertices = [
new Noc.Point3D(-1, 1, -1),
new Noc.Point3D(1, 1, -1),
new Noc.Point3D(1, -1, -1),
new Noc.Point3D(-1, -1, -1),
new Noc.Point3D(-1, 1, 1),
new Noc.Point3D(1, 1, 1),
new Noc.Point3D(1, -1, 1),
new Noc.Point3D(-1, -1, 1)
];


var faces = [[0, 1, 2, 3], [1, 5, 6, 2], [5, 4, 7, 6], [4, 0, 3, 7], [0, 4, 5, 1], [3, 2, 6, 7]];

var EntityWorker = (function (worker) {
    var ctor = function (name,settings) {
        var self = this;
        this.name = name;

     

        var angle = 45;

        this.settings = settings;
        this.run = function () {
            var t = new Array();



            for (var i = 0; i < vertices.length; i++) {
                var v = vertices[i];
                var r = v.rotateX(angle).rotateY(angle);
                var p = r.project(400, 400, 200, 3);
             

                t.push({
                    x: p.x,
                    y: p.y,
                    z: p.z
                });
            }


            var avg_z = [];

            for (var i = 0; i < faces.length; i++) {
                var f = faces[i];
                avg_z[i] = { "index": i, "z": (t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / 4.0 };
            };

            avg_z.sort(function (a, b) {
                return b.z - a.z;
            });

          
            worker.postMessage({
                avg_z: avg_z,tt:t,faces:faces
            });

            angle += 0.5;
          
          //  self.run();
        }
    }
    return ctor;
})(self);



var listeners = {
    "init": function (settings) {

        //settings.world = new Landscape(720, 405);

        var w = new EntityWorker("vector", settings);

       
        setInterval(function() {
             w.run();
        }, 1000 /75);


    }
};


self.onmessage = function(message) {
    listeners[message.data.d](message.data.s);
};