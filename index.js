/**
 * Created by zhuqizhong on 16-12-2.
 */

const WorkerBase = require('yeedriver-base/WorkerBase');
const ModbusRTU = require("qz-modbus-serial");
const util = require('util');

const _ = require('lodash')
const vm = require('vm')
const MAX_WRITE_CNT = 50;
class Modbus  extends  WorkerBase{
    super(maxSegLength, minGapLength);

}


/**
 *
 * @param options
 * options.protocol 通信协议，TCP modbusTCP RTU modbusRTU ASCII modbusASCII，默认是modbusRTU
 * options.devName  如果有，是通过串口连接的，这是串口号，程序注意要有权限操作此串口
 *  当devName存在时：
 *     options.serialOption表示串口配置
 *        .baudrate  波特率  默认9600
 *        .parity    校验位，默认无校验
 *        .stopbit   停止位，默认为1
 *
 *  当devName不存在时
 *      options.ip   ip
 *      options.port  端口
 *      网络断开或是错误时，系统会自动尝试重连恢复
 */

Modbus.prototype.initDriver = function (options) {
    this.options = options || this.options || {};

    this.maxSegLength = options.maxSegLength;
    this.minGapLength = options.minGapLength;
    this.devices = this.devices || {};

    if (!this.inited) {
        this.inited = true;
        this.mbClient = new ModbusRTU();
        let Connector = {};
        if(this.options.protocol === 'RTU' || !this.options.protocol ){
            //启动ModbusRTU
            Connector.func= this.mbClient.connectRTU;
        }else if(this.options.prtotocol === 'TCP'){
            Connector.func= this.mbClient.connectTCP;
        }else if(this.options.protocol === 'ASCII'){
            Connector.func= this.mbClient.connectAsciiSerial;
        }


        if (options && options.devName) {
            Connector.param1 =options.devName;
            Connector.param2={baudrate:options.baudrate||9600,parity:options.parity,stopbit:options.stopbit}
        } else {
            if(!this.options || this.options.protocol === 'RTU'){
                Connector.param1 = options.ip + ":" + options.port
            }else  if( this.options.protocol === 'TCP'){
                Connector.param1 = options.ip;
            }

        }
        Connector.func(Connector.param1, Connector.param2, function (error) {
            if (!error) {
                this.mbClient.setTimeout(this.options.timeout || 500);
                this.connected = true;
                this.setRunningState(this.RUNNING_STATE.CONNECTED);
            } else {
                console.error('error in open modbus port:', error);
            }
        }.bind(this));

        this.setupAutoPoll();
    }

};

Modbus.prototype.initDeviceId = function (devId) {
    this.mbClient.setID(parseInt(devId.replace(/id/i,'')));
};

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



module.exports = Modbus;


