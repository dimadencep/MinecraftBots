const globalconfig = require('../config.json');
const socks = require('socks').SocksClient;
const cc = require('node-console-colors');
const mc = require('minecraft-protocol');
const random = require('random');
const https = require('https');
const http = require('http');
const fs = require('fs');
const clients = []

console.log(cc.set("fg_green", 'Loading users...'))
let names = fs.readFileSync("./names.txt", "utf8").split(/\r?\n/);
console.log(cc.set("fg_green", 'Loaded '+names.length+' users!'))

function setproxy(id) {
  if (id==0) {
    id = random.int(0, names.length+100);
  }
  return new Promise(function (resolve, reject) {
      https.get("https://proxylist.geonode.com/api/proxy-list?limit=1&page="+id+"&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps%2Csocks5", (res) => {
          res.setEncoding("utf8")
          let data = ""
          res.on("data", (chunk) => {
              data += chunk
          })
          res.on("end", () => {
            let proxy = JSON.parse(data);
            if (proxy.data=='') {
              console.log(cc.set("fg_red", 'Proxy not found!'))
              setproxy(id)
              return
            }
            console.log(cc.set("fg_green", 'Geting proxy '+proxy.data[0].ip+':'+proxy.data[0].port+'...'))
            https.get({
              method: 'GET',
              host: 'ifconfig.me',
              path: '/'
            }, (res) => {
              if (res.statusCode === 200) {
                resolve(proxy)
                res.on('close', () => {
                  process.stdout.write('\nProxy '+proxy.data[0].ip+':'+proxy.data[0].port+' connection closed\n')
                })
              } else {
                console.log(cc.set("fg_red", 'Proxy '+proxy.data[0].ip+':'+proxy.data[0].port+' not working!'))
                return
              }
            })

          })
          res.on("error", (error) => {
            console.log(cc.set("fg_red", 'Proxy error: '+error))
            setproxy(id)
            return
          })
      }).on("error", (err) => {
          reject(err)
      })
  })
}

function start() {
  for (let i = 0; i < names.length; ++i) {
    setproxy(i).then((result) => {
      let proxyHost = result.data[0].ip;
      let proxyPort = result.data[0].port;
      let proxyType = result.data[0].protocols;
      createBot(names[i], proxyHost, parseInt(proxyPort), String(proxyType));
    })
    if (i >= names.length-1) ready()
  }
}

start();

function createBot (login, proxyHost, proxyPort, proxyType) {
  const client = mc.createClient({
    connect: client => {
      switch (proxyType) {
        case "socks5":
          socks.createConnection({
            proxy: {
              host: proxyHost,
              port: proxyPort,
              type: 5
            },
            command: 'connect',
            destination: {
              host: globalconfig.serverhost,
              port: globalconfig.serverport
            }
          }, (err, info) => {
            if (err) {
              console.log(cc.set("fg_red", login+': Socks5: '+err))
    
              setproxy(0).then((result) => {
                let proxyHost = result.data[0].ip;
                let proxyPort = result.data[0].port;
                let proxyType = result.data[0].protocols;
                console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
                createBot(login, proxyHost, parseInt(proxyPort), String(proxyType))
              })
              return
            }
            client.setSocket(info.socket)
            client.emit('connect')
          })
          break;
        case "socks4":
          socks.createConnection({
            proxy: {
              host: proxyHost,
              port: proxyPort,
              type: 4
            },
            command: 'connect',
            destination: {
              host: globalconfig.serverhost,
              port: globalconfig.serverport
            }
          }, (err, info) => {
            if (err) {
              console.log(cc.set("fg_red", login+': Socks4: '+err))
    
              setproxy(0).then((result) => {
                let proxyHost = result.data[0].ip;
                let proxyPort = result.data[0].port;
                let proxyType = result.data[0].protocols;
                console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
                createBot(login, proxyHost, parseInt(proxyPort), String(proxyType))
              })
              return
            }
            client.setSocket(info.socket)
            client.emit('connect')
          })
          break;
        case "http":
          const req = http.request({
            host: proxyHost,
            port: proxyPort,
            method: 'CONNECT',
            path: globalconfig.serverhost+':'+globalconfig.serverport
          })
          req.end()
    
          req.on("error", (err) => {
            console.log(cc.set("fg_red", login+': Http: '+err))
    
            setproxy(0).then((result) => {
              let proxyHost = result.data[0].ip;
              let proxyPort = result.data[0].port;
              let proxyType = result.data[0].protocols;
              console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
              createBot(login, proxyHost, parseInt(proxyPort), String(proxyType))
            })
            return
          })
      
          req.on('connect', (res, stream) => {
            client.setSocket(stream)
            client.emit('connect')
          })
          break;
        case "https":
          const reqs = https.request({
            host: proxyHost,
            port: proxyPort,
            method: 'CONNECT',
            path: globalconfig.serverhost + ':' + globalconfig.serverport
          })
          reqs.end()
    
          reqs.on("error", (err) => {
            console.log(cc.set("fg_red", login+': Https: '+err))
    
            setproxy(0).then((result) => {
              let proxyHost = result.data[0].ip;
              let proxyPort = result.data[0].port;
              let proxyType = result.data[0].protocols;
              console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
              createBot(login, proxyHost, parseInt(proxyPort), String(proxyType))
            })
            return
          })
      
          reqs.on('connect', (ress, stream) => {
            client.setSocket(stream)
            client.emit('connect')
          })
          break;
        default:
            console.log(cc.set("fg_red", login+': Unknown proxy: '+proxyType))
            setproxy(0).then((result) => {
              let proxyHost = result.data[0].ip;
              let proxyPort = result.data[0].port;
              let proxyType = result.data[0].protocols;
              console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
              createBot(login, proxyHost, parseInt(proxyPort), String(proxyType))
            })
          break;
      }
    },
    username: login,
    version: "1.16.5"
  })
  clients.push(client)
}

function ready () {
  console.log("end")
  clients.forEach(client => {
    client.on('connect', function () {
      console.info(cc.set("fg_green", client.username+': Connected'))
    })

    client.on('disconnect', function (packet) {
      const jsonMsg = JSON.parse(packet.reason)
      console.log(cc.set("fg_red", client.username+': Disconnected: '+jsonMsg.translate))
      })

    client.on('end', function () {
      console.log(cc.set("fg_yellow", client.username+': Connection lost'))
    })

    client.on('error', function (error) {
      console.log(cc.set("fg_red", client.username+': Client Error: '+error))
    })

    client.on('kick_disconnect', (reason) => {
      const jsonMsg = JSON.parse(reason.reason)
      console.log(jsonMsg)
      console.log(cc.set("fg_red", client.username+': Kicked for reason: '+jsonMsg.translate))
    })

    client.on('chat', function (packet) {
      const jsonMsg = JSON.parse(packet.message)
      if (jsonMsg.translate === 'chat.type.announcement' || jsonMsg.translate === 'chat.type.text' || jsonMsg.translate === 'death.attack.mob' || jsonMsg.translate === 'death.attack.player') {
        console.log(jsonMsg.with[0].text+": "+jsonMsg.with[1])
      } else {
        console.log(cc.set("fg_"+jsonMsg.extra[0].color, jsonMsg.extra[0].text))
      }
    })
  })
}