##yeedriver 的Modbus基础类
不能直接使用，作为其他的基于modbus设备的基类使用，仅仅是在WorkBase上做了一层薄包装，实现了默认的ReadWQ/WI WriteWQ/WI等函数

继承类根据需要，重载ReadWQ或是WriteWQ，以下是示例：

    ReadWQ (mapItem){

        return this.CreateWQReader(mapItem,function(reg,results){
            switch(reg){
                case 1: //PM2.5
                    return this.mbClient.readInputRegisters(5, 1).then(function(newData){
                        results.push( newData.data[0]);
                    });
                    break;
                case 2://温度
                    return this.mbClient.readInputRegisters(1, 1).then(function(newData){
                        let newValue = newData.data[0] > 0x8000?(newData.data[0]-0x10000):(newData.data[0]&0x7fff);

                        results.push( newValue/10);
                    });
                    break;
                case 3://湿度
                    return this.mbClient.readInputRegisters(0, 1).then(function(newData){
                        results.push( newData.data[0]/10);
                    });
                    break;
                default:
                    results.push ( undefined );
                    break;
            }
        });

    };