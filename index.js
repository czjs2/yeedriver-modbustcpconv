/**
 * Created by zhuqizhong on 16-12-2.
 */

const WorkerBase = require('yeedriver-base/WorkerBase');
const ModbusRTU = require("qz-modbus-serial");
const util = require('util');
const PDUtils = require('yeedriver-base/PDUtils');
const _ = require('lodash')
const vm = require('vm')
const MAX_WRITE_CNT = 50;
function Modbus(maxSegLength, minGapLength) {
    WorkerBase.call(this, maxSegLength, minGapLength);

}
util.inherits(Modbus, WorkerBase);

Modbus.prototype.initDriver = function (options) {
    this.options = options || this.options;

    this.maxSegLength = options.maxSegLength;
    this.minGapLength = options.minGapLength;
    this.devices = this.devices || {};

    if (!this.inited) {
        this.inited = true;
        //启动ModbusRTU
        this.mbClient = new ModbusRTU();
        let Connector;
        if (options && options.devName) {
            Connector = {
                func: this.mbClient.connectRTU,
                param1: options.devName,
                param2:{baudrate:options.baudrate||9600,parity:options.parity,stopb}
            }
        } else {
            Connector = {
                func: this.mbClient.connectComOverTCP,
                param1:  options.ip + ":" + options.port
            }
        }
        Connector.func(Connector.param1, Connector.param1, function (error) {
            if (!error) {
                this.mbClient.setTimeout(this.options.timeout || 500);
                this.connected = true;
                this.setRunningState(this.RUNNING_STATE.CONNECTED);
            } else {
                console.error('error in open modbus port:', error);
            }
        }.bind(this)
    )
        ;


        this.setupAutoPoll();

    }

    _.each(options.sids, function (type, devId) {
        let classType = require("./mb_devices/" + type);
        if (this.devices[devId] && _.isFunction(this.devices[devId].release)) {
            this.devices[devId].release();
        }
        this.devices[devId] = new classType(devId, this.mbClient);
    }.bind(this));
    if (options.readConfig) {
        try {
            let script = new vm.Script(" definition = " + options.readConfig);
            let newObj = {};
            script.runInNewContext(newObj);
            this.SetAutoReadConfig(newObj.definition);
        } catch (e) {
            console.error('error in read config:', e.message || e);
        }
        ;
    }


};

Modbus.prototype.initDeviceId = function (devId) {

}

Modbus.prototype.ReadBI = function (bi_mapItem, devId) {
    if (this.devices[devId] && _.isFunction(this.devices[devId].ReadBI)) {
        return this.devices[devId].ReadBI(bi_mapItem);
    }
};
Modbus.prototype.ReadBQ = function (mapItem, devId) {
    if (this.devices[devId] && _.isFunction(this.devices[devId].ReadBQ)) {
        return this.devices[devId].ReadBQ(isFunction);
    }
};

Modbus.prototype.ReadWI = function (mapItem, devId) {
    if (this.devices[devId] && _.isFunction(this.devices[devId].ReadWI)) {
        return this.devices[devId].ReadWI(mapItem);
    }
};
Modbus.prototype.ReadWQ = function (mapItem, devId) {
    if (this.devices[devId] && _.isFunction(this.devices[devId].ReadWQ)) {
        return this.devices[devId].ReadWQ(mapItem);
    }
};
Modbus.prototype.WriteBQ = function (mapItem, value, devId) {
    if (this.devices[devId] && _.isFunction(this.devices[devId].WriteBQ)) {
        return this.devices[devId].WriteBQ(mapItem, value);
    }
};

Modbus.prototype.WriteWQ = function (mapItem, value, devId) {
    if (this.devices[devId] && _.isFunction(this.devices[devId].WriteWQ)) {
        return this.devices[devId].WriteWQ(mapItem, value);
    }
};


var _mbInst = new Modbus();

