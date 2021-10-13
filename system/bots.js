const config = require('../configs/global.json');
const socks = require('socks').SocksClient;
const cc = require('node-console-colors');
const mineflayer = require('mineflayer');
const func = require("./func.js");
const https = require('https');
const http = require('http');
const fs = require('fs');

function run(login) {

    const client = mineflayer.createBot({
      connect: client => {
        switch (config.proxy.type) {

            case "socks5":
                let proxy5 = func.nextProxy().split(":");
                socks.createConnection({
                    proxy: {
                        host: proxy5[0],
                        port: parseInt(proxy5[1]),
                        type: 5
                    },
                    command: 'connect',
                    destination: {
                        host: config.server.serverhost,
                        port: config.server.serverport
                    }
                }, (err, info) => {
                    if (err) {
                        console.log(cc.set("fg_red", login+': Socks5: '+err))
                        run(login)
                        return
                    }
                    client.setSocket(info.socket)
                    client.emit('connect')
                });
            break;
            
            case "socks4":
                let proxy4 = func.nextProxy().split(":");
                socks.createConnection({
                    proxy: {
                        host: proxy4[0],
                        port: parseInt(proxy4[1]),
                        type: 4
                    },
                    command: 'connect',
                    destination: {
                        host: config.server.serverhost,
                        port: config.server.serverport
                    }
                }, (err, info) => {
                    if (err) {
                        console.log(cc.set("fg_red", login+': Socks4: '+err))
                        run(login)
                        return
                    }
                    client.setSocket(info.socket)
                    client.emit('connect')
                });
            break;

            case "http":
                let proxy = func.nextProxy().split(":");
                const req = http.request({
                    host: proxy[0],
                    port: parseInt(proxy[1]),
                    method: 'CONNECT',
                    path: config.server.serverhost+':'+config.server.serverport
                });

                req.end()
      
                req.on("error", (err) => {
                    console.log(cc.set("fg_red", login+': Http: '+err))
                    run(login)
                    return
                });
        
                req.on('connect', (res, stream) => {
                    client.setSocket(stream)
                    client.emit('connect')
                });
            break;

            case "https":
                let proxys = func.nextProxy().split(":");
                const reqs = https.request({
                    host: proxys[0],
                    port: parseInt(proxys[1]),
                    method: 'CONNECT',
                    path: config.server.serverhost+':'+config.server.serverport
                });

                reqs.end()
      
                reqs.on("error", (err) => {
                    console.log(cc.set("fg_red", login+': Https: '+err))
                    run(login)
                    return
                });
        
                reqs.on('connect', (ress, stream) => {
                    client.setSocket(stream)
                    client.emit('connect')
                });
            break;

            default:
                console.log(cc.set("fg_red", login+': Unknown proxy: '+config.proxy.type))
                run(login)
            break;
        }
      },
      username: login
    });

    config.modules.forEach(m => {
        fs.stat("./modules/"+m+".js", function(err, stats) {
            if (err) {
                console.log("Не удалось найти модуль "+m)
            } else {
                const module = require("../modules/"+m+".js");
                if (module.data.type=="bot") {
                    module(client);
                }
            }
            return;
        });
    })
    
    client.on('end', function () {
        console.log(cc.set("fg_green", login+': Reconnecting...'))
        run(login)
    })
}

module.exports = run;