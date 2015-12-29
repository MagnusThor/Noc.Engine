window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
var Noc = {
    Timer: {},
    Utils: {
        newGuid: function (a, b) {
            for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
            return b;
        }
    },
    Collision: {},
    Communication: {}
};
Noc.Communication.XSocketsNET = (function() {
    var ctor = function() {
        throw "Not yet implemented";
    };
    return ctor;
})();
Noc.Utils.Delaunay = (function () {
    var EPSILON = 1.0 / 1048576.0;

    function supertriangle(vertices) {
        var xmin = Number.POSITIVE_INFINITY,
            ymin = Number.POSITIVE_INFINITY,
            xmax = Number.NEGATIVE_INFINITY,
            ymax = Number.NEGATIVE_INFINITY,
            i, dx, dy, dmax, xmid, ymid;

        for (i = vertices.length; i--;) {
            if (vertices[i][0] < xmin) xmin = vertices[i][0];
            if (vertices[i][0] > xmax) xmax = vertices[i][0];
            if (vertices[i][1] < ymin) ymin = vertices[i][1];
            if (vertices[i][1] > ymax) ymax = vertices[i][1];
        }

        dx = xmax - xmin;
        dy = ymax - ymin;
        dmax = Math.max(dx, dy);
        xmid = xmin + dx * 0.5;
        ymid = ymin + dy * 0.5;

        return [
          [xmid - 20 * dmax, ymid - dmax],
          [xmid, ymid + 20 * dmax],
          [xmid + 20 * dmax, ymid - dmax]
        ];
    }

    function circumcircle(vertices, i, j, k) {
        var x1 = vertices[i][0],
            y1 = vertices[i][1],
            x2 = vertices[j][0],
            y2 = vertices[j][1],
            x3 = vertices[k][0],
            y3 = vertices[k][1],
            fabsy1y2 = Math.abs(y1 - y2),
            fabsy2y3 = Math.abs(y2 - y3),
            xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

        /* Check for coincident points */
        if (fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
            throw new Error("Eek! Coincident points!");

        if (fabsy1y2 < EPSILON) {
            m2 = -((x3 - x2) / (y3 - y2));
            mx2 = (x2 + x3) / 2.0;
            my2 = (y2 + y3) / 2.0;
            xc = (x2 + x1) / 2.0;
            yc = m2 * (xc - mx2) + my2;
        }

        else if (fabsy2y3 < EPSILON) {
            m1 = -((x2 - x1) / (y2 - y1));
            mx1 = (x1 + x2) / 2.0;
            my1 = (y1 + y2) / 2.0;
            xc = (x3 + x2) / 2.0;
            yc = m1 * (xc - mx1) + my1;
        }

        else {
            m1 = -((x2 - x1) / (y2 - y1));
            m2 = -((x3 - x2) / (y3 - y2));
            mx1 = (x1 + x2) / 2.0;
            mx2 = (x2 + x3) / 2.0;
            my1 = (y1 + y2) / 2.0;
            my2 = (y2 + y3) / 2.0;
            xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
            yc = (fabsy1y2 > fabsy2y3) ?
              m1 * (xc - mx1) + my1 :
              m2 * (xc - mx2) + my2;
        }

        dx = x2 - xc;
        dy = y2 - yc;
        return { i: i, j: j, k: k, x: xc, y: yc, r: dx * dx + dy * dy };
    }

    function dedup(edges) {
        var i, j, a, b, m, n;

        for (j = edges.length; j;) {
            b = edges[--j];
            a = edges[--j];

            for (i = j; i;) {
                n = edges[--i];
                m = edges[--i];

                if ((a === m && b === n) || (a === n && b === m)) {
                    edges.splice(j, 2);
                    edges.splice(i, 2);
                    break;
                }
            }
        }
    }
    var ctor = function () {

    };

    ctor.prototype.triangulate = function (vertices, key) {
        var n = vertices.length,
            i, j, indices, st, open, closed, edges, dx, dy, a, b, c;
        if (n < 3)
            return [];

        vertices = vertices.slice(0);

        if (key)
            for (i = n; i--;)
                vertices[i] = vertices[i][key];

        indices = new Array(n);

        for (i = n; i--;)
            indices[i] = i;

        indices.sort(function (i, j) {
            return vertices[j][0] - vertices[i][0];
        });
        st = supertriangle(vertices);
        vertices.push(st[0], st[1], st[2]);
        open = [circumcircle(vertices, n + 0, n + 1, n + 2)];
        closed = [];
        edges = [];

        for (i = indices.length; i--; edges.length = 0) {
            c = indices[i];
            for (j = open.length; j--;) {

                dx = vertices[c][0] - open[j].x;
                if (dx > 0.0 && dx * dx > open[j].r) {
                    closed.push(open[j]);
                    open.splice(j, 1);
                    continue;
                }
                dy = vertices[c][1] - open[j].y;
                if (dx * dx + dy * dy - open[j].r > EPSILON)
                    continue;
                edges.push(
                  open[j].i, open[j].j,
                  open[j].j, open[j].k,
                  open[j].k, open[j].i
                );
                open.splice(j, 1);
            }
            dedup(edges);
            for (j = edges.length; j;) {
                b = edges[--j];
                a = edges[--j];
                open.push(circumcircle(vertices, a, b, c));
            }
        }
        for (i = open.length; i--;)
            closed.push(open[i]);
        open.length = 0;
        for (i = closed.length; i--;)
            if (closed[i].i < n && closed[i].j < n && closed[i].k < n)
                open.push(closed[i].i, closed[i].j, closed[i].k);

        return open;
    };
    ctor.prototype.pcontains = function (tri, p) {
        /* Bounding box test first, for quick rejections. */
        if ((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
           (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
           (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
           (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
            return null;

        var a = tri[1][0] - tri[0][0],
            b = tri[2][0] - tri[0][0],
            c = tri[1][1] - tri[0][1],
            d = tri[2][1] - tri[0][1],
            i = a * d - b * c;

        /* Degenerate tri. */
        if (i === 0.0)
            return null;

        var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
            v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

        /* If we're outside the tri, fail. */
        if (u < 0.0 || v < 0.0 || (u + v) > 1.0)
            return null;

        return [u, v];
    }

    return ctor;
})();
Noc.Helpers = {
    flattenVerticles: function(verticles) {
        return verticles.map(function(v) { return [v.x, v.y] });
    },
    getVerticles: function(faces,verticles) {
        var result = [];
        var source = verticles;
        faces.forEach(function (index) {
            result.push(source[index]);
        });
        return result;
    },
    triangulate: function(arrVerticles) {

        return (new Noc.Utils.Delaunay()).triangulate(arrVerticles);
    },
    getFaces: function(arr, num) {
        var a = [];
        while (arr.length) {
            a.push(arr.splice(0, num));
        }
        return a;
    }
};
Noc.Point2D = (function () {

    var ctor = function (x, y) {
        this.x = x;
        this.y = y;
    };

    return ctor;

})(); 
Noc.Point3D = (function () {


    var point = function (_x, _y, _z) {

        this.x = _x || 0;
        this.y = _y || 0;
        this.z = _z || 0;
     



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
            return new Noc.Point3D(x, y, this.z);
        }

        this.length = function () {
            var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            return length;
        }
        this.scale = function (scale) {
            this.x *= scale;
            this.y *= scale;
            this.z *= scale;
        }

        this.normalize = function () {
            //scales a vector back to a unit vector. It will have a length of 1

            var lengthval = this.length();

            if (lengthval != 0) {
                this.x /= lengthval;
                this.y /= lengthval;
                this.z /= lengthval;
                return true;
            } else {
                return false;
            }
        }

        this.angle = function (bvector) {
            var anorm = new Noc.Point3D(this.x, this.y, this.z, this.u, this.v);
            anorm.normalize();
            var bnorm = new Noc.Point3D(bvector.x, bvector.y, bvector.z);
            bnorm.normalize();
            var dotval = anorm.dot(bnorm);
            return Math.acos(dotval);
        }

        this.cross = function (vectorB) {
            var tempvec = new Noc.Point3D(this.x, this.y, this.z, this.u, this.v);
            tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
            tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
            tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);


            return tempvec;
        }
        this.dot = function (vectorB) {
            return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
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
Noc.Object3D = (function () {
    // todo: fix ctor defaults
    var ctor = function (verticles, faces, position) {
      
        this.verticles = verticles || [];
        this.uvs = [];
        this.faces = faces || [];
        this.position = {};
        this.scale = 1.0;
        this.rotation = {};
    }
    ctor.prototype.flattenVerticles = function () {
        return Noc.Helpers.flattenVerticles(this.verticles);
    }
    ctor.prototype.getVerticles = function (arr) {
        return Noc.Helpers.getVerticles(arr);
    };


    ctor.prototype.rotateX = function (angle) {
        for (var i = 0; i < this.verticles.length; i++) {
            this.verticles[i] = this.verticles[i].rotateX(angle);
        }
        return this;
    };
    ctor.prototype.rotateY = function (angle) {
        for (var i = 0; i < this.verticles.length; i++) {
            this.verticles[i] = this.verticles[i].rotateY(angle);
        }
        return this;
    };
    ctor.prototype.rotateZ = function (angle) {
        for (var i = 0; i < this.verticles.length; i++) {
            this.verticles[i] = this.verticles[i].rotateZ(angle);
        }
        return this;
    };

    ctor.prototype.project = function (width, height, fov, distance) {
        var projected = [];
        this.verticles.forEach(function (verticle) {
            var p = verticle.project(width, height, fov, distance);
            projected.push(p);
        });

        return projected;
    }
    ctor.prototype.setScale = function () {
        verticles.forEach(function (verticle) {

        });
    };
    return ctor;
})();
Noc.Texture = {
     basicTexture: function(w, h, color) {
         var c = document.createElement("canvas");
         c.width = w;
         c.height = h;
         var ctx = c.getContext("2d");
         ctx.fillStyle = color;
         ctx.fillRect(0, 0, w, h);
         return c;
     }
}
Noc.Drawing = (function () {
    var ctor = function (ctx) {
        this.ctx = ctx;
    }
    ctor.prototype.drawTriangles = function (texture, verticles, faces) {
        var ctx = this.ctx;

        for (var t = 0; t < faces.length; t++) {
            var pp = faces[t];
          
            var x0 = verticles[pp[0]].x, x1 = verticles[pp[1]].x, x2 = verticles[pp[2]].x;
            var y0 = verticles[pp[0]].y, y1 = verticles[pp[1]].y, y2 = verticles[pp[2]].y;

            var u0 = verticles[pp[0]].u, u1 = verticles[pp[1]].u, u2 = verticles[pp[2]].u;
            var v0 = verticles[pp[0]].v, v1 = verticles[pp[1]].v, v2 = verticles[pp[2]].v;
            ctx.save(); ctx.beginPath();
          
            ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip();
            var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
            var deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
            var deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
            var deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2
                - v0 * u1 * x2 - u0 * x1 * v2;
            var deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
            var deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
            var deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2
                - v0 * u1 * y2 - u0 * y1 * v2;
            ctx.transform(deltaA / delta, deltaD / delta,
                deltaB / delta, deltaE / delta,
                deltaC / delta, deltaF / delta);
            ctx.drawImage(texture, 0, 0);
            ctx.stroke();
            ctx.restore();
        }
        return this;
    }

    return ctor;

})();
Noc.Collision.circularDetection = function (a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var k = a.r + b.r;
    return (dx * dx + dy * dy <= k * k);
};
Noc.Collision.rectangularDetection = function (a, b) {
    if (a.x < b.x + b.w &&
       a.x + a.w > b.x &&
       a.y < b.y + b.h &&
       a.h + a.y > b.y) {
        return true;
    }
    return false;
};
Noc.Audio = (function () {
    function audio() {
        var that = this;
        this.audioBuffers = {};
        this.keys = [];
        this.context = new AudioContext();
        this.load = function (key, url) {
            this.keys.unshift(key);
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                that.context.decodeAudioData(request.response, function (buffer) {
                    that.audioBuffers[key] = buffer;
                    if (that.completed) that.completed(key);
                }, function (err) {
                    console.log(err);
                });
            };
            request.send();
            return this;
        };
    }
    audio.prototype.completed = function () { };
    audio.prototype.play = function (key, cb) {
        var source = this.context.createBufferSource();
        source.buffer = this.audioBuffers[key];
        source.connect(this.context.destination);
        source.start();
        if (cb) {
            cb(source);
        }
        return this;
    };
    audio.prototype.pause = function () { };
    return audio;
})();
Noc.Geometry = (function () {
    var geometry = function (matrix) {
        this.name = "";
        this.verticles = [];
        this.faces = [];
        this.faceVertexUvs = [[]];
        this.color = "#ffffff";


    };


    geometry.prototype.hasFaceVertexUv = function () {
        return this.faceVertexUvs[0] && this.faceVertexUvs[0].length > 0;
    }

    geometry.prototype.hasFaceVertexUv2 = function () {
        return this.faceVertexUvs[1] && this.faceVertexUvs[1].length > 0;
    }

    return geometry;

})();
Noc.Face = (function () {
    var face = function (a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.materialIndex = 0;
        this.vertexNormals = {};
    }
    return face;
})();
Noc.Timer.Fps = (function () {
    var timer = function () {
        this.elapsed = 0;
        this.last = null;
    }
    timer.prototype.tick = function (now) {
        this.elapsed = (now - (this.last || now) / 1000);
        this.last = now;
    }
    timer.prototype.current = function () {
        return Math.round(1 / this.elapsed);
    };
    return timer;
})();
Noc.Sprite = (function () {
    function sprite(image, pos, size, speed, frames, dir, once) {
        this.image = image;
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.dir = dir || 'horizontal';
        this.once = once;
    }
    sprite.prototype.update = function (dt) {
        this._index += this.speed * dt;
    };
    sprite.prototype.render = function (ctx, cb) {
        var frame;
        if (Math.floor(this._index) >= this.frames.length && cb) {
            cb();
        }
        if (this.speed > 0) {
            var max = this.frames.length;
            var idx = Math.floor(this._index);
            frame = this.frames[idx % max];
            if (this.once && idx >= max) {
                this.done = true;
                return;
            }
        }
        else {
            frame = 0;
        }
        var x = this.pos[0];
        var y = this.pos[1];

        if (this.dir == 'vertical') {
            y += frame * this.size[1];
        }
        else {
            x += frame * this.size[0];
        }
        ctx.drawImage(this.image, x, y, this.size[0], this.size[1], 0, 0, this.size[0], this.size[1]);

    };
    return sprite;
})();
Noc.Images = (function () {
    var images = function () {
        this.downloadQueue = [];
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = {};
    };
    images.prototype.downloadAll = function (downloadCallback) {
        if (this.downloadQueue.length === 0) {
            downloadCallback();
        }
        for (var i = 0; i < this.downloadQueue.length; i++) {
            var path = this.downloadQueue[i];
            var img = new Image();
            var that = this;
            img.addEventListener("load", function () {
                that.successCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);
            img.addEventListener("error", function () {
                that.errorCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);
            img.src = path;
            this.cache[path] = img;
        }
    };
    images.prototype.getAsset = function (path) {
        return this.cache[path];
    };
    images.prototype.isDone = function () {
        return (this.downloadQueue.length == this.successCount + this.errorCount);
    };
    return images;
})();
Noc.BitMap = (function () {

    var bitmap = (function (image, width, height) {

        this.image = image;
        this.width = width;
        this.height = height;
    });
    return bitmap;

})();
Noc.Assets = (function () {
    var assets = function (resources, cb) {
        var self = this;
        this.imageAssets = new Noc.Images();
        this.audioAssets = new Noc.Audio();
        resources.images.forEach(function (image) {

            self.imageAssets.downloadQueue.push(image);
        });
        this.imageAssets.downloadAll(function () {
            if (cb) cb();
        });
    };
    assets.prototype.getImage = function (path) {
        var image = path;
        return this.imageAssets.cache[path];
    };
    assets.prototype.getImageData = function (path) {
        var img = this.getImage(path);
       
      
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            var context = canvas.getContext("2d");
            context.drawImage(img, 0, 0);

           

           
            return (context.getImageData(0, 0, img.width, img.height));
       
       
     
    }
    return assets;
})();
Noc.Engine = (function () {
    var engine = function (target, world, el) {
        var self = this;
        this.viewport = {
            canvas: document.querySelector(target),
            height: 0,
            width: 0,
            ctx: document.querySelector(target).getContext("2d"),
            mouse: undefined
        };

        this.drawing = new Noc.Drawing(this.getContext());





        this.viewport.width = el ? el.clientWidth : this.viewport.canvas.width;
        this.viewport.height = el ? el.clientHeight : this.viewport.canvas.height;;


        this.viewport.canvas.width = el ? el.clientWidth : this.viewport.canvas.width;
        this.viewport.canvas.height = el ? el.clientHeight : this.viewport.canvas.height;;



        this.fps = new Noc.Timer.Fps();
        this.onFrame = function () { };
        this.parent = el;
        this.entities = [];//{};




        this.isReady = false;
        this.scenes = [];
        this.world = world || { width: this.viewport.width, height: this.viewport.height };
        this.camera = new Noc.Camera(0, 0, this.viewport.width, this.viewport.height, this.world.width, this.world.height);
        this.clear = function () {
            this.viewport.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height);
        };

        var lt = Date.now();
        var render = function (time) {
            self.clear();
            var now = Date.now();
            var dt = (now - lt) / 1000.0;
            self.fps.tick(dt);
            self.entities.forEach(function (entity, index) {
                if (entity.onRender) entity.onRender(entity.state, key, index);

                entity.collidesWith.forEach(function (typeOfEntity) { // does this entity have any collitions?

                    self.entities.filter(function (pre) {
                        return pre.type === typeOfEntity;
                    }).forEach(function (pre) {
                        var a = pre.collitionExpression(pre.state);
                        var b = entity.collitionExpression(entity.state);

                        var collitionState = Noc.Collision[entity.collitionDetector](a, b);

                        entity.collided = collitionState;

                        if (collitionState) {
                            if (entity.onCollition);
                            entity.onCollition.apply(entity, [time, pre, entity]);
                            if (pre.onCollition);
                            pre.onCollition.apply(pre, [time, entity, pre]);
                        }
                    });
                });
                if (entity.push <= self.timeElapsed || entity.push == 0) {
                    entity.draw(self.viewport, dt, time);
                    if (entity.lifetime) {
                        if (time > entity.lifetime && entity.onLifetimeend) {
                            entity.active = false;
                            entity.onLifetimeend(entity.key, time);
                        }
                    }
                }
            });
            if (self.camera)
                self.camera.update();
            lt = now;
        };




        window.addEventListener('resize', function (evt) {
            if (!self.parent) {

                self.viewport.canvas.height = evt.target.innerHeight;
                self.viewport.canvas.width = evt.target.innerWidth;


            } else {

                self.viewport.canvas.height = self.parent.offsetHeight;
                self.viewport.canvas.width = self.parent.offsetWidth;

            }

        }, false);

        (function animloop(a) {

            requestAnimFrame(animloop);
            if (self.isReady) {

                render(a);
                self.timeElapsed = a;
                if (self.onFrame) {
                    self.onFrame.apply(self, [a, self.fps]);
                }
            }
        })();
        this.resize = function () {
            var evt = document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(evt);
        };
        //  self.resize();
    };
    engine.prototype.getContext = function () {
        return this.viewport.ctx;
    };
    engine.prototype.addEntity = function (entity, cb) {



        entity._engine = this;
        entity.lifetime += this.timeElapsed || 0;
        this.entities.push(entity);
        if (cb) cb();
        return this;
    };
    engine.prototype.addEntities = function () {

        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            if (obj instanceof Noc.Entity) {
                this.addEntity(obj);
            } else {
                throw "argument " + i + " is not an instance of  Noc.Entity";
            }
        }


    };
    engine.prototype.registerEntities = function (arrEntities, cb) {
        var that = this;
        arrEntities.forEach(function (entity) {
            that.addEntity(entity);
        });
        if (cb) cb();
    };
    engine.prototype.addScene = function (name, entities) {
        throw "Not yet implemented";
    };
    engine.prototype.removeScene = function (name) {
        throw "Not yet implemented";
    };
    engine.prototype.start = function () {
        this.isReady = !this.isReady;
    };


    engine.prototype.stop = function () {
        this.isReady = false;
    };

    engine.prototype.removeEntity = function (entity, cb) {
        var index = this.entities.findIndex(function (pre) {
            return pre.id === entity.id;
        });
        this.entities.remove(index);
        if (cb) cb();
        return this;
    };
    return engine;
})();
Noc.Entity = (function () {
    var entity = function (key, fn, push, lifetime) {
        this._engine = undefined;
        this.type = "";
        this.id = Noc.Utils.newGuid();
        this.active = true;
        this.state = {};
        this.render = fn;
        this.key = key;
        this.visible = true;
        this.push = push | 0;
        this.lifetime = lifetime;

        this.collitionDetector = "circularDetection";


        this.setCollitionDetector = function (detector) {
            this.collitionDetector = detector;
            return this;
        };
        this.setType = function (t) {
            this.type = t;
            return this;
        };
        this.toggle = function () {
            this.visible = !this.visible;
        };

        this.init = function (settings) {
            this.state = settings;
            return this;
        };

        this.setState = function (state) {
            this.state = state;
            return this;
        };


        this.collidesWith = [];
        this.collitionExpression = function () {
            return this.state;
        };

        this.collided = false;

        this.onCollition = undefined;
        this.onRender = undefined;
        this.onLifetimeend = null;
    };
    entity.prototype.draw = function (ctx, tm, elapsed) {
        this.render(ctx, tm, elapsed);

    };
    return entity;
})();
Noc.Boundary = (function () {
    var rectangle = function (left, top, width, height) {
        this.left = left || 0;
        this.top = top || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }
    rectangle.prototype.set = function (left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width || this.width;
        this.height = height || this.height
        this.right = (this.left + this.width);
        this.bottom = (this.top + this.height);
    }
    rectangle.prototype.within = function (r) {
        return (r.left <= this.left &&
            r.right >= this.right &&
            r.top <= this.top &&
            r.bottom >= this.bottom);
    }
    rectangle.prototype.overlaps = function (r) {
        return (this.left < r.right &&
            r.left < this.right &&
            this.top < r.bottom &&
            r.top < this.bottom);
    }
    return rectangle;
})();
Noc.Camera = (function () {

    var axis = {
        NONE: "none",
        HORIZONTAL: "horizontal",
        VERTICAL: "vertical",
        BOTH: "both"
    };

    var camera = function (xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
        this.xView = xView || 0;
        this.yView = yView || 0;
        this.xDeadZone = 0;
        this.yDeadZone = 0;
        this.wView = canvasWidth;
        this.hView = canvasHeight;
        this.axis = axis.BOTH;
        this.followed = null;
        this.viewportRect = new Noc.Boundary(this.xView, this.yView, this.wView, this.hView);
        this.worldRect = new Noc.Boundary(0, 0, worldWidth, worldHeight);
    }

    camera.prototype.follow = function (gameObject, xDeadZone, yDeadZone) {
        this.followed = gameObject;
        this.xDeadZone = xDeadZone || this.wView / 2;
        this.yDeadZone = yDeadZone || this.hView / 2;
    }

    camera.prototype.update = function () {
        if (this.followed != null) {
            if (this.axis == axis.HORIZONTAL || this.axis == axis.BOTH) {
                if (this.followed.x - this.xView + this.xDeadZone > this.wView)
                    this.xView = this.followed.x - (this.wView - this.xDeadZone);
                else if (this.followed.x - this.xDeadZone < this.xView)
                    this.xView = this.followed.x - this.xDeadZone;
            }
            if (this.axis == axis.VERTICAL || this.axis == axis.BOTH) {

                if (this.followed.y - this.yView + this.yDeadZone > this.hView)
                    this.yView = this.followed.y - (this.hView - this.yDeadZone);
                else if (this.followed.y - this.yDeadZone < this.yView)
                    this.yView = this.followed.y - this.yDeadZone;
            }
        }
        this.viewportRect.set(this.xView, this.yView);
        if (!this.viewportRect.within(this.worldRect)) {
            if (this.viewportRect.left < this.worldRect.left)
                this.xView = this.worldRect.left;
            if (this.viewportRect.top < this.worldRect.top)
                this.yView = this.worldRect.top;
            if (this.viewportRect.right > this.worldRect.right)
                this.xView = this.worldRect.right - this.wView;
            if (this.viewportRect.bottom > this.worldRect.bottom)
                this.yView = this.worldRect.bottom - this.hView;
        }
    }
    return camera;

})();
Noc.Colors = {
    blendColors: function (c0, c1, p) {
        var f = parseInt(c0.slice(1), 16),
            t = parseInt(c1.slice(1), 16),
            R1 = f >> 16,
            G1 = f >> 8 & 0x00FF,
            B1 = f & 0x0000FF,
            R2 = t >> 16,
            G2 = t >> 8 & 0x00FF,
            B2 = t & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
    },
}



var $ = $ || function (selector, context) {
    if (!context) context = document;
    return context.querySelector(selector);
};
(function () {

    Array.prototype.interpolate = function (fitCount) {

        var data = this;

        var linearInterpolate = function (before, after, atPoint) {
            return before + (after - before) * atPoint;
        };
        var newData = new Array();
        var springFactor = new Number((data.length - 1) / (fitCount - 1));
        newData[0] = data[0]; // for new allocation
        for (var i = 1; i < fitCount - 1; i++) {
            var tmp = i * springFactor;
            var before = new Number(Math.floor(tmp)).toFixed();
            var after = new Number(Math.ceil(tmp)).toFixed();
            var atPoint = tmp - before;
            newData[i] = linearInterpolate(data[before], data[after], atPoint);
        }
        newData[fitCount - 1] = data[data.length - 1]; // for new allocation
        return newData;
    };

    Array.prototype.first = function (num) {
        if (!num) return this[0];
        if (num < 0) num = 0;
        return this.slice(0, num);
    };
    Array.prototype.take = function (num) {
        if (!num) num = 2;

        return (this.filter(function (t, i) {
            if (i < num) return t;

        }) || []);

    };
    Array.prototype.findBy = function (pre) {
        var arr = this;
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (pre(arr[i]))
                result.push(arr[i]);
        };
        return result;
    };
    Array.prototype.count = function (pre) {
        var arr = this;
        var result = 0;
        if (!pre) return this.length;

        for (var i = 0; i < this.length; i++) {
            if (pre(arr[i])) {
                result++;
            }
        }
        return result;
    };
    Array.prototype.findIndex = function (pre) {
        var arr = this;

        for (var i = 0; i < this.length; i++) {
            if (pre(arr[i])) {
                return i;
            }
        }
        return -1;
    };
    Array.prototype.remove = function (index) {

        this.splice(index, 1);

        return this.length;
    };
    Array.prototype.clone = function () {
        return this.slice(0);
    };
    Array.prototype.removeAll = function () {

        for (var i = 0; this.length; i++) {
            this.splice(i, 1);
        }

        return this.length;
    };
})();
