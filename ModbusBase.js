/**
 * Created by zhuqizhong on 17-5-15.
 */
const async = require('async-q');
const _ = require('lodash');
function ModbusBase(devId,mb_client){
    this.mbClient = mb_client;
    this.devId = parseInt(devId.replace(/id/i,''));
}
ModbusBase.prototype.initDeviceId = function(devId){
    this.mbClient.setID(parseInt(devId.replace(/id/i,'')));
}

ModbusBase.prototype.ReadBI = function(bi_mapItem){
    this.mbClient.setID(this.devId);
    return this.mbClient.readDiscreteInputs(bi_mapItem.start, bi_mapItem.end + 1 - bi_mapItem.start).then(function(newData){
        return newData.data;
    })
};
ModbusBase.prototype.ReadBQ = function(mapItem){
    this.mbClient.setID(this.devId);
    return this.mbClient.readCoils(mapItem.start, mapItem.end + 1 - mapItem.start).then(function(newData){
        return newData.data;
    })
};

ModbusBase.prototype.ReadWI = function(mapItem){
    this.mbClient.setID(this.devId);
    return this.mbClient.readInputRegisters(mapItem.start, mapItem.end + 1 - mapItem.start).then(function(newData){
        return newData.data;
    })
};
ModbusBase.prototype.CreateWQReader = function(mapItem,convert){
    this.mbClient.setID(this.devId);

    let regs = [];
    for(let i = mapItem.start; i <= mapItem.end; i++){
        regs.push(i);
    }
    let results = [];
    return async.eachSeries(regs,function(reg){
       return  convert.call(this,reg,results);
    }.bind(this)).then(function(){
        return results;
    })
}
ModbusBase.prototype.ReadWQ = function(mapItem){
    this.mbClient.setID(this.devId);
    return this.mbClient.readHoldingRegisters(mapItem.start, mapItem.end + 1 - mapItem.start).then(function(newData){
        return newData.data;
    })
};
ModbusBase.prototype.WriteBQ = function(mapItem,value){
    this.mbClient.setID(this.devId);
    let reg_addr = mapItem.start;
    let reg_quantity = (mapItem.end - mapItem.start + 1);

    let buf = new Array(reg_quantity);
    for (let i = 0; i < reg_quantity; i++) {
        buf[i] = (!!value[mapItem.start + i] );
    }
    return this.mbClient.writeCoils(mapItem.start, buf);
};

ModbusBase.prototype.WriteWQ = function(mapItem,value){

    let reg_quantity = (mapItem.end - mapItem.start + 1);
    let buf = new Array(reg_quantity);
    for (let i = 0; i < reg_quantity; i++) {
        buf[i] = value[mapItem.start + i];
    }

    return this.mbClient.writeRegisters(mapItem.start, buf);
};

module.exports = ModbusBase;