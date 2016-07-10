var util = require('util');
var bleno = require('bleno');
var m = require('mraa');

var BlenoCharacteristic = bleno.Characteristic;

var Bot = {
  lastCommand: new Date(),
  e0: null,
  e1: null,
  m00: null,
  m01: null,
  m10: null,
  m11: null,
  init: function () {
    console.log("Initializing platform...");
    // Enable pins
    this.e0 = new m.Gpio(13);
    this.e1 = new m.Gpio(12);
    this.e0.dir(m.DIR_OUT);
    this.e1.dir(m.DIR_OUT);

    // Motor pins
    this.m00 = new m.Gpio(4);
    this.m01 = new m.Gpio(5);
    this.m10 = new m.Gpio(6);
    this.m11 = new m.Gpio(7);
    this.m00.dir(m.DIR_OUT);
    this.m01.dir(m.DIR_OUT);
    this.m10.dir(m.DIR_OUT);
    this.m11.dir(m.DIR_OUT);

    this.reset();

    // Enable motors
    this.e0.write(1);
    this.e1.write(1);
  },
  reset: function () {
    console.log("Reset all pins");
    this.e0.write(0);
    this.e1.write(0);
    this.m00.write(0);
    this.m01.write(0);
    this.m10.write(0);
    this.m11.write(0);
  },
  backward: function () {
    console.log("Move forward");
    this.e0.write(1);
    this.e1.write(1);
    this.m00.write(1);
    this.m01.write(0);
    this.m10.write(1);
    this.m11.write(0);
  },
  forward: function () {
    console.log("Move backward");
    this.e0.write(1);
    this.e1.write(1);
    this.m00.write(0);
    this.m01.write(1);
    this.m10.write(0);
    this.m11.write(1);
  },
  left: function () {
    console.log("Turn right");
    this.e0.write(1);
    this.e1.write(1);
    this.m00.write(1);
    this.m01.write(0);
    this.m10.write(0);
    this.m11.write(1);
  },
  right: function () {
    console.log("Turn left");
    this.e0.write(1);
    this.e1.write(1);
    this.m00.write(0);
    this.m01.write(1);
    this.m10.write(1);
    this.m11.write(0);
  }
};

// Initialize BLE Characteristic
var FirstCharacteristic = function() {
  FirstCharacteristic.super_.call(this, {
    uuid: 'fc0f',
    properties: ['read', 'write', 'notify'],
    value: null
  });
  this._value = new Buffer("OFF", "utf-8");
  console.log("Characterisitic's value: "+this._value);
  Bot.init();
  this._updateValueCallback = null;
};

// Inherit the BlenoCharacteristic
util.inherits(FirstCharacteristic, BlenoCharacteristic);

// BLE Read request
FirstCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('FirstCharacteristic - onReadRequest: value = ' + this._value.toString("utf-8"), offset);
  callback(this.RESULT_SUCCESS, this._value);
};

// BLE write request
FirstCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;
  switch (data) {
      case "fwd":
        Bot.forward();
        break;
      case "bwd":
        Bot.backward();
        break;
      case "rgt":
        Bot.right();
        break;
      case "lft":
        Bot.left();
        break;
      default:
        Bot.reset();
        break;
    }
  console.log('FirstCharacteristic - onWriteRequest: value = ' + this._value.toString("utf-8"));

  if (this._updateValueCallback) {
    console.log('FirstCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback(this._value);
  }

  callback(this.RESULT_SUCCESS);
};

// BLE subscribe
FirstCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('FirstCharacteristic - onSubscribe');
  this._updateValueCallback = updateValueCallback;
};

// BLE unsubscribe
FirstCharacteristic.prototype.onUnsubscribe = function() {
  console.log('FirstCharacteristic - onUnsubscribe');
  this._updateValueCallback = null;
};

module.exports = FirstCharacteristic;
