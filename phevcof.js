const CorrentlyClient = require("corrently-api");
const appid = "0x617711F81b5EaC44777e1729217a055F57d1825a";

module.exports = function(RED) {
    function phevcof(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', async function(msg) {
            let clientConfig = {
                appid:appid,
                deviceid:"tz1"
            }
            let token = this.context().global.get("corrently-token");
            if((typeof config.personaltoken !== 'undefined') && (config.personaltoken !== null) && (config.personaltoken.length > 1)) {
                token = config.personaltoken;
            }
            if((typeof token !== 'undefined')&&(token !== null)) {
                clientConfig.token = token;
            }
            const client = new CorrentlyClient(clientConfig);
            let cou = {
                electricConsumption: config.evConsumption * 1,
                fuelConsumption: config.fuelConsumption * 1,
                zip: config.zip
            }            
       
            const newAdvice = await client.phevChargeOrFuel.getAdvice(cou)
            this.context().global.set("corrently-token",client.token);
            
            let msg1 = JSON.parse(JSON.stringify(msg));
            msg1.payload = false;
            if(newAdvice.advice.priceBased == 'charge') {
                node.status({fill:"green",shape:"dot",text:"Charge and save: "+newAdvice.advice.savings.priceSaved.toFixed(2)+ '€/100km'});
                msg1.payload = true;
            } else {                
                node.status({fill:"red",shape:"dot",text:"Fuel and save: "+newAdvice.advice.savings.priceSaved.toFixed(2)+ '€/100km'});
                msg1.payload = false;
            }
            let msg2 = JSON.parse(JSON.stringify(msg));
            msg2.payload = newAdvice;
            node.send([msg1,msg2]);
        });
    }
    RED.nodes.registerType("phevcof",phevcof);
}