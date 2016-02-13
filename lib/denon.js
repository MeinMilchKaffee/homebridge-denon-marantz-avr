/**
 * created by stfnhmplr on 28.01.16.
 * control your Denon AVR via http with node.js
 */

var request = require('request');
var parseString = require('xml2js').parseString;

var inputs = ['CD', 'SPOTIFY', 'CBL/SAT', 'DVD', 'BD', 'GAME', 'AUX1',
    'MPLAY', 'USB/IPOD', 'TUNER', 'NETWORK', 'TV', 'IRADIO'];

var Denon = function (ip) {
    this.ip = ip;
    this.status_url = '/goform/formMainZone_MainZoneXml.xml';
};

Denon.prototype.getName = function (callback) {
    request.get('http://' + this.ip + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode == 200) {
            parseString(xml + body, function (err, result) {
                callback(null, result.item.FriendlyName[0].value[0]);
            });
        }
    });
};

Denon.prototype.getPowerState = function (callback) {
    request.get('http://' + this.ip + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode == 200) {
            parseString(xml + body, function (err, result) {
                callback(null, (result.item.Power[0].value[0] == 'ON'));
            }.bind(this));
        }
    }.bind(this));
};

Denon.prototype.setPowerState = function (powerState, callback) {
    powerState = (powerState) ? 'ON' : 'OFF';
    request.get('http://' + this.ip + '/MainZone/index.put.asp?cmd0=PutZone_OnOff%2F' + powerState, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null, powerState == 'ON');
        } else {
            callback(error, null)
        }
    });
};

Denon.prototype.setInput = function (input, callback) {
    if (!!~inputs.indexOf(input)) {
        request.get('http://' + this.ip + '/goform/formiPhoneAppDirect.xml?SI' + input, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(null);
            } else {
                callback(error)
            }
        })
    }
};

Denon.prototype.setVolume = function (volume, callback) {
    var vol = (volume - 80).toFixed(1);  //volume fix
    request.get('http://' + this.ip + '/goform/formiPhoneAppVolume.xml?1+' + vol, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null);
        } else {
            callback(error)
        }
    });
};

module.exports = Denon;