(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Vector = require('./vector');

function Boid(id) {
  this.loc = new Vector(
                  Math.round(Math.random() * window.innerWidth), 
                  Math.round(Math.random() * window.innerHeight)
                );
  this.vel = new Vector(Math.random()*2-1, Math.random()*2-1).normalize();
  this.id  = id
}

module.exports = Boid

},{"./vector":5}],2:[function(require,module,exports){
var debounce = require('debounce');
var ticker   = require('ticker');

var Vector   = require('./vector.js');
var Boid     = require('./boid.js');
var Quadtree = require('./quadtree.js');

var rules    = require('./rules.js');

var boidCount = 50;
var predCount = 3;
var foodCount = 3;
var fps       = 60;
var canvas   = document.createElement('canvas');
var ctx      = canvas.getContext('2d');

var cohesionColor = "#FFFF00";
var separationColor = "#83F52C";
var alignmentColor = "#67C8FF"

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
var rgba = hexToRgb(cohesionColor);
cohesionColor = "rgba("+rgba.r+", " + rgba.g + ", " + rgba.b + ", 0.3)"
var rgba = hexToRgb(separationColor);
separationColor = "rgba("+rgba.r+", " + rgba.g + ", " + rgba.b + ", 0.3)"
var rgba = hexToRgb(alignmentColor);
alignmentColor = "rgba("+rgba.r+", " + rgba.g + ", " + rgba.b + ", 0.3)"

var repulsionNeighborhood  = 100;
var attractionNeighborhood = 200;

var resizeCanvas = function() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.onresize = debounce(resizeCanvas, 200);
resizeCanvas();

var boids = [];
for(var i=0; i<boidCount; i++) {
  boids.push(new Boid(i));
}

var predators = [];
for(var i=0; i<predCount; i++) {
  predators.push(new Boid(i));
}

var food = [];
var maxResource = 200;
var growingRate = 0.1;
var eatingRate  = 0.2;
for(var i=0; i<foodCount; i++) {
  var foodBoid = new Boid(i);
  foodBoid.resources = maxResource;
  food.push(foodBoid);
}

var scatter = false;
var scatterPos = new Vector(0, 0);
canvas.addEventListener('click', function(e) {
  scatterPos.x = e.clientX || e.pageX;
  scatterPos.y = e.clientY || e.pageY;
  scatter = true;
  setTimeout(function() {
    scatter = false;
  }, 500);
}, false);


document.body.style.margin  = '0';
document.body.style.padding = '0';
document.body.appendChild(canvas);

var cohesion          = true;
var alignment         = true;
var separation        = true;

var predatorsOnCanvas = true;
var foodOnCanvas      = true;

var pause      = false;
var tracking   = false;

var drawNeighborCircle = function(boid, radius, color) {
  var loc = boid.loc ? boid.loc : boid;
  ctx.beginPath();
  ctx.arc(loc.x, loc.y, radius, 0, 2 * Math.PI, false);
  ctx.lineWidth = 1;
  ctx.shadowColor = color;
  ctx.fillStyle   = color;
  ctx.fill();
  ctx.closePath();
}

var drawFood = function(food, pulse) {
  pulse = (pulse && (pulse + 3)) || 1;
  ctx.beginPath();
  ctx.arc(food.loc.x, food.loc.y, 20, 0, 2 * Math.PI, false);
  ctx.lineWidth = 25 + Math.sin(pulse) * 5;
  ctx.shadowColor = '#BFFF00';
  ctx.strokeStyle = '#BFFF00';
  ctx.stroke();
  ctx.closePath();
};

var drawPredator = function(predator, pulse) {
  pulse = (pulse && (pulse + 3)) || 1;

  var spikes = 15
  var scale = 5;
  var outerRadius = 25 + Math.sin(pulse)*5;
  var innerRadius = 25 + Math.sin(pulse + Math.PI)*5;
  
  var rot=Math.PI/2*3;
  var x=predator.loc.x;
  var y=predator.loc.y;
  var cx=x;
  var cy=y
  var step=Math.PI/spikes;

  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#ff0000';
  ctx.fillStyle   = '#ff0000'
  ctx.beginPath();
  ctx.moveTo(cx,cy-outerRadius)
  for(i=0;i<spikes;i++){
    x=cx+Math.cos(rot)*outerRadius;
    y=cy+Math.sin(rot)*outerRadius;
    ctx.lineTo(x,y)
    rot+=step

    x=cx+Math.cos(rot)*innerRadius;
    y=cy+Math.sin(rot)*innerRadius;
    ctx.lineTo(x,y)
    rot+=step
  }
  ctx.lineTo(cx,cy-outerRadius);
  ctx.lineWidth = 8
  ctx.stroke();
  ctx.closePath();
}

var drawBoid = function(boid) {
  var scale = 5;

  var velocity = boid.vel;

  ctx.beginPath();
  ctx.lineWidth = 1;
  // 1) Move to front
  ctx.moveTo(boid.loc.x + velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 2) Draw to the back
  ctx.lineTo(boid.loc.x - velocity.x * 2 * scale, boid.loc.y - velocity.y * 2 * scale);
  // 3) Draw to the left site
  ctx.lineTo(boid.loc.x + velocity.x * scale, boid.loc.y - velocity.y * scale);
  // 4) Draw to the front
  ctx.lineTo(boid.loc.x + velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 5) Draw to the right site
  ctx.lineTo(boid.loc.x - velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 6) Draw to the back
  ctx.lineTo(boid.loc.x - velocity.x * 2 * scale, boid.loc.y - velocity.y * 2 * scale);
  // 7) Move back to right site
  ctx.moveTo(boid.loc.x - velocity.x * scale, boid.loc.y + velocity.y * scale);
  // 8) Draw to left site
  ctx.lineTo(boid.loc.x + velocity.x * scale, boid.loc.y - velocity.y * scale);

  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#ff00ff';
  ctx.stroke();
  ctx.closePath();
}

var pattern;
var img = new Image();
img.src = './img/subtle_carbon.png'

img.onload = function(){
    pattern = ctx.createPattern(img, 'repeat'); 
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var wrap = function(boid) {
  if(boid.loc.y > canvas.height) {
    boid.loc.y = 0;
  }
  if(boid.loc.y < 0) {
    boid.loc.y = canvas.height;
  }
  if(boid.loc.x > canvas.width) {
    boid.loc.x = 0;
  }
  if(boid.loc.x < 0) {
    boid.loc.x = canvas.width;
  }
}

var pulse = 0;
ticker(window, fps).on('tick', function() {
  if(pause) return;

  var quadtree = new Quadtree(0, 0, canvas.width, canvas.height);
  boids.forEach(function(boid) {
    quadtree.insert({x: boid.loc.x, y: boid.loc.y, boid: boid});
  });

  if(predatorsOnCanvas) {
    predators.forEach(function(predator) {
      var apply = [];
      var neighborBoids     = rules.neighbors(predator, quadtree, 150);

      apply.push(rules.cohesion(predator, neighborBoids));

      apply.forEach(function(rule) {
        predator.vel.x = predator.vel.x + rule.x;
        predator.vel.y = predator.vel.y + rule.y;
      })

      predator.vel.normalize().scale(0.5);
      predator.loc.add(predator.vel);
      wrap(predator);
    });
  }

  if(foodOnCanvas) {
    food.forEach(function(f) {
      if(f.resources < maxResource) {
        f.resources += growingRate;
      }
    })
  }

  boids.forEach(function(boid, i) {

    var apply = [];
    var neighbors50  = rules.neighbors(boid, quadtree, 50);
    var neighbors150 = rules.neighbors(boid, quadtree, 150);

    if(cohesion)
      apply.push(rules.cohesion(boid, neighbors50));
    if(separation)
      apply.push(rules.separation(boid, neighbors50));
    if(alignment)
      apply.push(rules.alignment(boid, neighbors150));

    if(scatter) {
      if(scatterPos.distanceTo(boid.loc) < 200) 
        apply.push(rules.repulsion(boid, scatterPos, -20));
    }

    if(foodOnCanvas) {
      food.forEach(function(f) {
        var distance = f.loc.distanceTo(boid.loc);
        if(distance < f.resources) 
          apply.push(rules.attraction(boid, f.loc, 300));
        if(distance < 30) {
          f.resources -= eatingRate;
        }
      })
    }

    if(predatorsOnCanvas) {
      predators.forEach(function(predator) {
        if(predator.loc.distanceTo(boid.loc) < repulsionNeighborhood) 
          apply.push(rules.repulsion(boid, predator.loc));
      });
    }

    apply.forEach(function(rule) {
      boid.vel.x = boid.vel.x + rule.x;
      boid.vel.y = boid.vel.y + rule.y;
    })

    if(boid.vel.length()>3) {
      boid.vel.normalize().scale(3);
    }

    boid.loc.add(boid.vel);
    wrap(boid);
  });
  
}).on('draw', function() {
  if(pause) return;
  pulse += 0.1
  pulse = pulse % (Math.PI * 2);

  var halfHeight = canvas.height/2
  var halfWidth  = canvas.width/2

  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if(foodOnCanvas) {
    food.forEach(function(f) {
      var r = f.resources > 5 ? f.resources : 5
      drawNeighborCircle(f, r, "rgba(0, 255, 0, 0.2)");
      drawFood(f, pulse);
    })
  }

  if(predatorsOnCanvas) {
    predators.forEach(function(predator, i) {
      if(tracking) {
        drawNeighborCircle(predator, repulsionNeighborhood, "rgba(255, 0, 0, 0.5)");
      }
      drawPredator(predator, pulse);
    })
  }

  if(alignment && tracking) {
    drawNeighborCircle(boids[0], 150, alignmentColor);
  }
  if(cohesion && tracking) {
    if(separation) {
      if(pulse > Math.PI)
        drawNeighborCircle(boids[0], 50, cohesionColor);
    } else {
      drawNeighborCircle(boids[0], 50, cohesionColor);
    }
  }
  if(separation && tracking) {
    if(cohesion) {
      if(pulse < Math.PI)
        drawNeighborCircle(boids[0], 50, separationColor);
    } else {
      drawNeighborCircle(boids[0], 50, separationColor);
    }
  }

  if(scatter) {
    drawNeighborCircle(scatterPos, (Math.sin(pulse*30) + 3) * 30, "rgba(255, 0, 0, 0.3)");
  }
  boids.forEach(function(boid, i) {
    drawBoid(boid);
  })
});

$("#cohesion").change(function () {
  cohesion = $(this).is(":checked");
}).change();
$("#alignment").change(function () {
  alignment = $(this).is(":checked");
}).change();
$("#separation").change(function () {
  separation = $(this).is(":checked");
}).change();
$("#predators").change(function () {
  predatorsOnCanvas = $(this).is(":checked");
}).change();
$("#food").change(function () {
  foodOnCanvas = $(this).is(":checked");
}).change();

$("#menu-trigger").on('click', function() {
  $("body").toggleClass("active");
});
$("#pause-trigger").on('click', function() {
  var li = $("#pause-trigger > i");
  li.toggleClass("fa-pause");
  li.toggleClass("fa-play");
  pause = !pause;
});
$("#tracking-trigger").on('click', function() {
  var li = $("#tracking-trigger > i");
  li.toggleClass("fa-circle-thin");
  li.toggleClass("fa-circle");
  tracking = !tracking;
});

},{"./boid.js":1,"./quadtree.js":3,"./rules.js":4,"./vector.js":5,"debounce":7,"ticker":9}],3:[function(require,module,exports){
function Quadtree(x1, y1, x2, y2, level) {
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2;

  this.objects = [];
  this.nodes   = [];
  this.leaf    = true;

  this.level   = level || 1;
}

Quadtree.prototype = {
  MAX_OBJECTS: 5,
  MAX_LEVEL:   10
}

Quadtree.prototype.insert = function(object) {
  var x = object.x;
  var y = object.y;
  if(isNaN(x) || isNaN(y)) return;

  if(this.leaf) {
    if(this.objects.length<this.MAX_OBJECTS || this.level === this.MAX_LEVEL) {
      this.objects.push(object);
      return this;
    } else {
      this.split();
      return this.insert(object);
    }
  } else {
    var upper = (y<(this.y2-this.y1)/2);
    var lower = !upper;
    var left  = (x<(this.x2-this.x1)/2);
    var right = !left;
    if(upper && left)  return this.nodes[0].insert(object);
    if(upper && right) return this.nodes[1].insert(object);
    if(lower && left)  return this.nodes[2].insert(object);
    if(lower && right) return this.nodes[3].insert(object);
  }
}

Quadtree.prototype.split = function() {
  var x1 = this.x1, x2 = this.x2, y1 = this.y1, y2 = this.y2, level = this.level;

  this.leaf     = false;
  this.nodes[0] = new Quadtree(x1,        y1,        (x2-x1)/2, (y2-y1)/2, level+1);
  this.nodes[1] = new Quadtree((x2-x1)/2, y1,         x2,       (y2-y1)/2, level+1);
  this.nodes[2] = new Quadtree(x1,        (y2-y1)/2, (x2-x1)/2, y2,        level+1);
  this.nodes[3] = new Quadtree((x2-x1)/2, (y2-y1)/2, x2,        y2,        level+1);

  this.objects.forEach(function(object) {
    this.insert(object);
  }.bind(this));
  this.objects.length = 0;
}

Quadtree.prototype.visit = function(callback) {
  if(!callback(this.objects, this.x1, this.y1, this.x2, this.y2) && !this.leaf) {
    this.nodes.forEach(function(node) {
      node.visit(callback);
    });
  }
}

Quadtree.prototype.retrieve = function(x1, y1, x2, y2) {
  var found = [];
  this.visit(function(objects, qx1, qy1, qx2, qy2) {
    objects.forEach(function(o) {
      if((o.x >= x1) && (o.x < x2) && (o.y >= y1) && (o.y < y2)) {
        found.push(o);
      }
    });
    return qx1 >= x2 || qy1 >= y2 || qx2 < x1 || qy2 < y1;
  });
  return found;
}

module.exports = Quadtree;

},{}],4:[function(require,module,exports){
var Vector = require('./vector.js');

var rules = {};

rules.center = function(boid, boids) {
  if(boids.length===1) {
    return boid.loc.clone();
  } else {
    var vector = new Vector(0, 0);
    boids.forEach(function(current) {
      if(current.id!==boid.id) {
        vector.add(current.loc);
      }
    });
    return vector.divide(boids.length-1);
  }
}

rules.neighbors = function(boid, quadtree, radius) {
  var neighbors = [];

  var x1 = boid.loc.x - radius;
  var y1 = boid.loc.y - radius;
  var x2 = boid.loc.x + radius;
  var y2 = boid.loc.y + radius;

  quadtree.retrieve(x1, y1, x2, y2).forEach(function(current) {
    current = current.boid;
    if(current.id!==boid.id) {
      var distance = current.loc.distanceTo(boid.loc);
      if(distance < radius) {
        neighbors.push(current);
      }
    }
  });
  return neighbors;
}

rules.cohesion = function(boid, neighbors) {
  neighbors.push(boid);
  var cntr = rules.center(boid, neighbors);
  return cntr.subtract(boid.loc).divide(100);
};

rules.separation = function(boid, neighbors) {
  var vector = new Vector(0, 0);
  neighbors.forEach(function(neighbor) {
    if(boid.id!=neighbor.id) {
      var distanceVector = neighbor.loc.clone().subtract(boid.loc);
      var distance       = distanceVector.length();

      if(distance < 20) {
        if(distance===0) 
          distance = 0.0001;
        distanceVector.scale(-Math.log(distance)+3);
        vector.subtract(distanceVector);
      }
    }
  })
  return vector;
};

rules.alignment = function(boid, neighbors) {
  var vector = new Vector(0, 0);
  if(neighbors.length === 0) return new Vector(0, 0);
  neighbors.forEach(function(neighbor) {
    vector.add(neighbor.vel);
  })

  vector.divide(neighbors.length);
  vector.subtract(boid.vel);
  vector.divide(8);

  return vector;
};

rules.attraction = function(boid, attractedToVec, factor) {
  factor = factor || 500
  return attractedToVec.clone().subtract(boid.loc).divide(factor);
}

rules.repulsion = function(boid, repulsedByVec, factor) {
  factor = factor || -3
  return rules.attraction(boid, repulsedByVec).scale(factor);
}

module.exports = rules;

},{"./vector.js":5}],5:[function(require,module,exports){

function Vector(x, y) {
  this.x = x;
  this.y = y;

  this.normalize = function() {
    var length = this.length();
    this.x = this.x / length;
    this.y = this.y / length;
    return this;
  }

  this.scale = function(factor) {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  this.divide = function(divisor) {
    this.x /= divisor;
    this.y /= divisor;
    return this;
  }

  this.subtract = function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  this.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  this.length = function() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  this.clone = function() {
    return new Vector(this.x, this.y);
  }

  this.distanceTo = function(anotherVector) {
    return Math.sqrt(Math.pow(this.x - anotherVector.x, 2) + Math.pow(this.y - anotherVector.y, 2));
  }
}

module.exports = Vector

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":8}],8:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],9:[function(require,module,exports){
(function (global){
var EventEmitter = require('events').EventEmitter

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame

module.exports = ticker

var currtime =
  global.performance &&
  global.performance.now ? function() {
    return performance.now()
  } : Date.now || function () {
    return +new Date
  }

function ticker(element, rate, limit) {
  var fps = 1000 / (rate || 60)
    , emitter = new EventEmitter
    , last = currtime()
    , time = 0

  var raf = _raf || function(fn, el) {
    setTimeout(fn, fps)
  }

  limit = arguments.length > 2 ? +limit + 1 : 2

  function loop() {
    raf(loop, element || null)

    var now = currtime()
    var dt = now - last
    var n = limit

    emitter.emit('data', dt)
    time += dt
    while (time > fps && n) {
      time -= fps
      n -= 1
      emitter.emit('tick', fps)
    }

    time = (time + fps * 1000) % fps
    if (n !== limit) emitter.emit('draw', time / fps)
    last = now
  }

  loop()

  return emitter
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":6}]},{},[2]);
