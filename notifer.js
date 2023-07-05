const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const {poolAboveTreshold, poolBelowTrashhold, USDCIsBelowTreshold} = require('./alertsTemplates.js');
require("dotenv").config();


const client = new Client();

const initNotifer = async () => {

    if(process.env.ENV === 'local') {
    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });
    }
    else { 
        console.log('*IF NOT LOCAL AND WORK DELETE THIS LINE*');
        client.on('qr', qr => {
            qrcode.generate(qr, {small: true});
        });
    }

    
    client.on('ready', () => {
        if(process.env.DEBUG === true) {
        console.log('Client is ready!');
        }
    });
    
    client.initialize();
}


    client.on('message', message => {
        console.log(message);
    });


const notifiy = async () => {
  //const msg = "this is anautmated message: \n" + "please check pool, pool id: 689765 \n" + "reach upper trashold \n" + "reach lower trashold \n" + "https://app.uniswap.org/#/tokens/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  const msg = poolAboveTreshold(2,1,123456);
  client.on('message', message => {
  client.sendMessage(process.env.WHATSAPP_USER_DANY, msg);
  });
}

module.exports = {
    notifiy,
    initNotifer
}


