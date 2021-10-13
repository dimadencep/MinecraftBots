const config = require('../configs/global.json');
const request = require('request');
const fs = require('fs');

async function run() {
  if (fs.readFileSync("./proxies/"+config.proxy.type+".txt", "utf8").split(/\r?\n/).length>>1) { return; }
  await request("https://www.proxy-list.download/api/v1/get?type="+config.proxy.type, function (error, response, body) {
    fs.appendFileSync("./proxies/"+config.proxy.type+".txt", body);
  });

  await request("https://openproxylist.xyz/"+config.proxy.type+".txt", function (error, response, body) {
    fs.appendFileSync("./proxies/"+config.proxy.type+".txt", body);
  });

  await request("https://api.proxyscrape.com/?request=displayproxies&proxytype="+config.proxy.type, function (error, response, body) {
    fs.appendFileSync("./proxies/"+config.proxy.type+".txt", body);
  });
  return;
}

module.exports = run;
module.exports.data = {
  "type": "core"
}