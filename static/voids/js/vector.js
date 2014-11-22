(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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
