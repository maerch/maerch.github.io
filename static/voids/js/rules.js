(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

rules.neighbors = function(boid, boids, radius) {
  var neighbors = [];
  boids.forEach(function(current) {
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

},{"./vector.js":2}],2:[function(require,module,exports){

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

},{}]},{},[1]);
