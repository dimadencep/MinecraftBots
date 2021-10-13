const config = require('../configs/global.json');
const fs = require('fs');

fs.appendFileSync("./proxies/"+config.proxy.type+".txt", "");
let proxies = fs.readFileSync("./proxies/"+config.proxy.type+".txt", "utf8").split(/\r?\n/);
function nextProxy() {
    let num = -1;
    ++num
    if (num >= proxies.length) {
        num = 0;
    }
    return proxies[num];
}

fs.appendFileSync("./messages/"+config.profiles.messages+".txt", "");
let messages = fs.readFileSync("./messages/"+config.profiles.messages+".txt", "utf8").split(/\r?\n/);
function nextMess() {
    let num = -1;
    ++num
    if (num >= messages.length) {
        num = 0;
    }
    return messages[num];
}


module.exports.nextProxy = nextProxy;
module.exports.nextMessage = nextMess;