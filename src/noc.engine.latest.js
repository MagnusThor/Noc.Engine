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
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
var Noc = {
    Timer: {},
    Utils: {},
    Collision: {}
};
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

Noc.Point2D = (function () {

    var ctor = function (x, y) {
        this.x = x;
        this.y = y;
    };

    return ctor;

})();


Noc.Geometry = (function () {
    var geometry = function () {
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

Noc.Point3D = (function () {


    var point = function (_x, _y, _z,_u,_v) {

        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.u = _u;
        this.v = _v;

       

        this.rotateX = function (angle) {
            var rad, cosa, sina, y, z;
            rad = angle * Math.PI / 180;
            cosa = Math.cos(rad);
            sina = Math.sin(rad);
            y = this.y * cosa - this.z * sina;
            z = this.y * sina + this.z * cosa;
            return new Noc.Point3D(this.x, y, z,this.u,this.v);
        }

        this.rotateY = function (angle) {
            var rad, cosa, sina, x, z;
            rad = angle * Math.PI / 180;
            cosa = Math.cos(rad);
            sina = Math.sin(rad);
            z = this.z * cosa - this.x * sina;
            x = this.z * sina + this.x * cosa;
            return new Noc.Point3D(x, this.y, z,this.u,this.v);
        }

        this.rotateZ = function (angle) {
            var rad, cosa, sina, x, y;
            rad = angle * Math.PI / 180;
            cosa = Math.cos(rad);
            sina = Math.sin(rad);
            x = this.x * cosa - this.y * sina;
            y = this.x * sina + this.y * cosa;
            return new Noc.Point3D(x, y, this.z,this.u,this.v);
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
            var bnorm = new Noc.Point3D(bvector.x,bvector.y,bvector.z);
            bnorm.normalize();
            var dotval = anorm.dot(bnorm);
            return Math.acos(dotval);
        }

        this.cross = function (vectorB) {
            var tempvec = new Noc.Point3D(this.x, this.y, this.z, this.u, this.v);
            tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
            tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
            tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);
            this.x = tempvec.x;
            this.y = tempvec.y;
            this.z = tempvec.z;
            this.w = tempvec.w;
        }
        this.dot = function (vectorB) {
            return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
        }

        this.project = function (viewWidth, viewHeight, fov, viewDistance) {
            var factor, x, y;
            factor = fov / (viewDistance + this.z);
            x = this.x * factor + viewWidth / 2;
            y = this.y * factor + viewHeight / 2;
            return new Noc.Point3D(x, y, this.z,this.u,this.v);
        }

      


    };

    return point;


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

Noc.BitMap = (function() {

    var bitmap = (function (image, width,height) {
      
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
            mouse: undefined,
           
        };
      
        this.viewport.width = el ? el.clientWidth : this.viewport.canvas.width;
        this.viewport.height = el ? el.clientHeight : this.viewport.canvas.height;;


        this.viewport.canvas.width = el ? el.clientWidth : this.viewport.canvas.width;
        this.viewport.canvas.height = el ? el.clientHeight : this.viewport.canvas.height;;

       
      
        this.fps = new Noc.Timer.Fps();
        this.onFrame = function() {};
        this.parent = el;
        this.entities = [];//{};


      

        this.isReady = false;
        this.scenes = [];
        this.world = world || { width: this.viewport.width, height: this.viewport.height  };
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
                entity.draw(self.viewport, dt,time);
                if (entity.lifetime) {
                    if (time > entity.lifetime && entity.onLifetimeend) {
                        entity.active = false;
                        entity.onLifetimeend(entity.key, time);
                    }
                }
                }
            });
            if(self.camera)
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
                    self.onFrame.apply(self, [a,self.fps]);
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
    engine.prototype.getContext = function() {
        return this.viewport.ctx;
    };
    engine.prototype.addEntity = function (entity, cb) {

        entity._engine = this;
        entity.lifetime += this.timeElapsed || 0;
        this.entities.push(entity);
        if (cb) cb();
        return this;
    };
    engine.prototype.addEntities = function() {
       
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            if(obj  instanceof Noc.Entity) {
                this.addEntity(obj);
            } else {
                throw "argument " + i + " is not an instance of  Noc.Entity";
            }
        }

    
    };
    engine.prototype.registerEntities = function(arrEntities, cb) {
        var that = this;
        arrEntities.forEach(function(entity) {
            that.addEntity(entity);
        });
        if (cb) cb();
    };
    engine.prototype.addScene = function(name, entities) {
        throw "Not yet implemented";
    };
    engine.prototype.removeScene = function(name) {
        throw "Not yet implemented";
    };
    engine.prototype.start = function () {
        this.isReady = !this.isReady;
    };
    engine.prototype.removeEntity = function (entity, cb) {
        var index = this.entities.findIndex(function(pre) {
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


        this.setCollitionDetector = function(detector) {
            this.collitionDetector = detector;
            return this;
        };
        this.setType = function(t) {
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

        this.setState = function(state) {
            this.state = state;
            return this;
        };

       
        this.collidesWith = [];
        this.collitionExpression = function() {
            return this.state;
        };
     
        this.collided = false;

        this.onCollition = undefined;
        this.onRender = undefined;
        this.onLifetimeend = null;
    };
    entity.prototype.draw = function (ctx, tm,elapsed) {
        this.render(ctx, tm, elapsed);
   
    };
    return entity;
})();
Noc.Boundary = (function () {
        var rectangle  = function(left, top, width, height) {
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
        this.xDeadZone = xDeadZone || this.wView /2;
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
Noc.Utils = {
    newGuid: function (a, b) {
        for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
        return b;
    }

};
