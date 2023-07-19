const { Client } = require('whatsapp-web.js');
const push = require( 'pushover-notifications' )
const qrcode = require('qrcode-terminal');
const {poolAboveTreshold, poolBelowTrashhold, USDCIsBelowTreshold} = require('./alertsTemplates.js');
require("dotenv").config();
const logger = require("./logger.js");

const client = new Client();
let pushover;

const initNotifer = async () => {

    if( process.env.PUSHOVER_USER === undefined || process.env.PUSHOVER_TOKEN === undefined) {
        logger.error('Pushover user or token not defined');
        process.exit(1);
    }

    try {
    pushover = new push( {
        user: process.env.PUSHOVER_USER,
        token: process.env.PUSHOVER_TOKEN,
      })
    
    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });
    
    client.on('ready', () => {
        console.log('Client is ready!');
    });
    
    client.initialize();
} catch (err) {
    console.log(err)
}
}

initNotifer();




const pushoverNotify = async (text, title) => {       
    var msg = {
      message: text,	// required
      title: title,
      sound: 'magic',
      device: 'devicename',
      priority: 1
    }
     
    pushover.send( msg, function( err, result ) {
      if ( err ) {
        console.log(err)
        throw err
      }
      console.log( result )
    })
  }

const whatsappNotify = async (text,title) => {
    msg = title + "\n" + text;
    client.sendMessage(process.env.WHATSAPP_ALERT_GROUP, msg);
}

const botAddNewPosition = async (position) => {
    whatsappNotify('*adding position*', 'what is the position number?');
};


client.on('message', message => {
	console.log(message);
    if(message.body.includes('add new position')) {
        botAddNewPosition(message);        
    }
});
 


const notifiy = async (text,title) => {
  //const msg = "this is anautmated message: \n" + "please check pool, pool id: 689765 \n" + "reach upper trashold \n" + "reach lower trashold \n" + "https://app.uniswap.org/#/tokens/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  pushoverNotify(text,title);
  whatsappNotify(text,title);
}

module.exports = {
    notifiy,
    initNotifer,
    pushoverNotify
}
