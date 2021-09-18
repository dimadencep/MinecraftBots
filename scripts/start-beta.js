const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const globalconfig = require('../config.json');
const pvp = require('mineflayer-pvp').plugin;
const tcpPortUsed = require('tcp-port-used');
const socks = require('socks').SocksClient;
const cc = require('node-console-colors');
const mc = require('minecraft-protocol');
const mineflayer = require('mineflayer');
const readline = require("readline")
const random = require('random');
const https = require('https');
const http = require('http');
const fs = require('fs');

mc.multiple = (clients, constructor) => {
  const { Worker, isMainThread, workerData } = require('worker_threads')
  if (isMainThread) {
    const threads = []
    for (const i in clients) {
      threads.push(new Worker(__filename, { workerData: clients[i] }))
    }
  } else {
    constructor(workerData)
  }
}


console.log(cc.set("fg_green", 'Loading users...'))
let names = fs.readFileSync("./names.txt", "utf8").split(/\r?\n/);
console.log(cc.set("fg_green", 'Loaded '+names.length+' users!'))

const clients = []
for (let i = 0; i < names.length; i++) {
  clients.push({ username: names[i] })
}


mc.multiple(clients, ({ username }) => {

  let serverHost = globalconfig.serverhost;
  let serverPort = globalconfig.serverport;

  console.log(cc.set("fg_green", 'Loading messanges...'))
  let messanges = fs.readFileSync("./messanges.txt", "utf8").split(/\r?\n/);
  console.log(cc.set("fg_green", 'Loaded '+messanges.length+' messanges!'))

  setproxy(parseInt(random.int(0, names.length))).then((result) => {
    let proxyHost = result.data[0].ip;
    let proxyPort = result.data[0].port;
    let proxyType = result.data[0].protocols;
    createBot(username, String(proxyHost), parseInt(proxyPort), String(proxyType));
  })

  var lasttime = -1;
  var moving = 0;
  var connected = 0;
  var actions = [ 'forward', 'back', 'left', 'right']
  var lastaction;
  var pi = 3.14159;
  var moveinterval = 1;
  var maxrandom = 10;
  var spamming = false;
  
  function getRandomArbitrary(min, max) {
         return Math.random() * (max - min) + min;
  
  }

  function createBot (login, proxyHost, proxyPort, proxyType) {
    const client = mineflayer.createBot({
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
                host: serverHost,
                port: serverPort
              }
            }, (err, info) => {
              if (err) {
                console.log(cc.set("fg_red", login+': Socks5: '+err))
      
                setproxy(0).then((result) => {
                  let proxyHost = result.data[0].ip;
                  let proxyPort = result.data[0].port;
                  let proxyType = result.data[0].protocols;
                  console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
                  createBot(login, String(proxyHost), parseInt(proxyPort), String(proxyType))
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
                host: serverHost,
                port: serverPort
              }
            }, (err, info) => {
              if (err) {
                console.log(cc.set("fg_red", login+': Socks4: '+err))
      
                setproxy(0).then((result) => {
                  let proxyHost = result.data[0].ip;
                  let proxyPort = result.data[0].port;
                  let proxyType = result.data[0].protocols;
                  console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
                  createBot(login, String(proxyHost), parseInt(proxyPort), String(proxyType))
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
              path: serverHost+':'+serverPort
            })
            req.end()
      
            req.on("error", (err) => {
              console.log(cc.set("fg_red", login+': Http: '+err))
      
              setproxy(0).then((result) => {
                let proxyHost = result.data[0].ip;
                let proxyPort = result.data[0].port;
                let proxyType = result.data[0].protocols;
                console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
                createBot(login, String(proxyHost), parseInt(proxyPort), String(proxyType))
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
              path: serverHost+':'+serverPort
            })
            reqs.end()
      
            reqs.on("error", (err) => {
              console.log(cc.set("fg_red", login+': Https: '+err))
      
              setproxy(0).then((result) => {
                let proxyHost = result.data[0].ip;
                let proxyPort = result.data[0].port;
                let proxyType = result.data[0].protocols;
                console.log(cc.set("fg_yellow", login+': Bot reconect wich new proxy...'))
                createBot(login, String(proxyHost), parseInt(proxyPort), String(proxyType))
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
                createBot(login, String(proxyHost), parseInt(proxyPort), String(proxyType))
              })
            break;
        }
      },
      username: login,
      version: "1.8.9"
    });

    client.loadPlugin(pathfinder)
    client.loadPlugin(pvp)

    client.on('connect', function () {
      console.log(cc.set("fg_green", login+': Connected'))
    })

    client.on('disconnect', function (packet) {
      const jsonMsg = JSON.parse(packet.reason)
      console.log(cc.set("fg_red", login+': Disconnected: '+jsonMsg.translate))
    })

        client.on('chat', function(username, message) {
      console.log(message);
      if (username === "dima_dencep") {
        switch (String(message)) {
          case "spam-stop":
            spamming = false;
            break;
          case "spam-start":
            spamming = true;
            break;
          default:
            client.chat(message);
            break;
        }
      }
    });

    client._client.on('map', (map) => {
      const size = Math.sqrt(map.data.length)

      const h = {}
      for (const v of map.data) {
        if (!h[v]) h[v] = 0
        h[v]++
      }

      const colors = Object.entries(h).sort((a, b) => b[1] - a[1]).map(x => parseInt(x[0], 10))
      const fg = colors[1]

      for (let i=0 ; i<size ; i++) {
        let line = ''
        for (let j=0 ; j<size ; j++) {
          let v = map.data[i*128+j]
          line += (v != fg) ? ' ' : '#'
        }
        console.log(line)
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question("Enter captcha number: ", (n) => {
        client.chat(n)
        rl.close()
      })
    })

    client.on('end', function () {
      console.log(cc.set("fg_yellow", login+': Connection lost'))
      client.quit();
      lasttime = -1;
      moving = 0;
      spamming = false;
      connected=0;
      setproxy(0).then((result) => {
        let proxyHost = result.data[0].ip;
        let proxyPort = result.data[0].port;
        let proxyType = result.data[0].protocols;
        console.log(cc.set("fg_green", login+': Reconnecting...'))
        createBot(login, String(proxyHost), parseInt(proxyPort), String(proxyType))
      });
    })

    client.on('health',function() {
      if(client.food < 15) {
        client.activateItem();
          console.log("Ate something");
      }
    });
    
    client.on('time', function() {
      if (spamming) {
        let rendmess = random.int(0, messanges.length);
        client.chat(String(messanges[parseInt(rendmess)]));
      }
      if (connected <1) {
          return;
      }
      if (lasttime<0) {
          lasttime = client.time.age;
          //console.log("Age set to " + lasttime)
      } else {
          var randomadd = Math.random() * maxrandom * 20;
          var interval = moveinterval*20 + randomadd;
          if (client.time.age - lasttime > interval) {
              if (moving == 1) {
                client.setControlState(lastaction,false);
                client.setControlState('jump', true)
                client.setControlState('forward', true)
                  moving = 0;
                  //console.log("Stopped moving after " + (interval/20) + " seconds");
                  lasttime = client.time.age;
              } else {
                client.setControlState('forward', false)
                client.setControlState('jump', false)
                  var yaw = Math.random()*pi - (0.5*pi);
                  var pitch = Math.random()*pi - (0.5*pi);
                  client.look(yaw,pitch,false);
                  //console.log("Changed looking direction to yaw " + yaw + " and pitch " + pitch);
  
                  lastaction = actions[Math.floor(Math.random() * actions.length)];
                  client.setControlState(lastaction,true);
                  moving = 1;
                  //console.log("Started moving " + lastaction +" after " + (interval/20) + "seconds");
                  lasttime = client.time.age;
                  client.activateItem();
              }
          }
      }
    });

    client.on('spawn',function() {
      client.chat("/reg dima_dencep dima_dencep");
      client.chat("/login dima_dencep");
      connected=1;
      spamming = true;
      tcpPortUsed.check(80, '127.0.0.1')
      .then(function(inUse) {
          if (!inUse) {
            mineflayerViewer(client, { port: 80 })
            const path = [client.entity.position.clone()]
            client.on('move', () => {
              if (path[path.length - 1].distanceTo(client.entity.position) > 1) {
                path.push(client.entity.position.clone())
                client.viewer.drawLine('path', path)
              }
            })
          } 
      }, function(err) {
          console.error('Error on check:', err.message);
      });
    });

    client.on('error', function (error) {
      console.log(cc.set("fg_red", client.username+': Client Error: '+error))
    })

    client.on('kick_disconnect', (reason) => {
      const jsonMsg = JSON.parse(reason.reason)
      console.log(jsonMsg)
      console.log(cc.set("fg_red", client.username+': Kicked for reason: '+jsonMsg.translate))
    })
}

  function setproxy(id) {
    https.get("https://proxylist.geonode.com/api/proxy-list?limit=1&page="+id+"&sort_by=lastChecked&sort_type=desc&speed=medium&protocols=http%2Chttps%2Csocks5", (res) => {
    let body = "";
    res.on("data", chunk => {
      body+=chunk;
    })
    res.on("end", () => {
      let jsontext =JSON.parse(body);
    if (id==0) {
      id = random.int(0, jsontext.total);
    }
    })
  })

    return new Promise(function (resolve, reject) {
        https.get("https://proxylist.geonode.com/api/proxy-list?limit=1&page="+id+"&sort_by=lastChecked&sort_type=desc&speed=medium&protocols=http%2Chttps%2Csocks5", (res) => {
            res.setEncoding("utf8")
            let data = ""
            res.on("data", (chunk) => {
                data += chunk
            })
            res.on("end", () => {
              let proxy = JSON.parse(data);
              if (proxy.data=='') {
                console.log(cc.set("fg_red", username+': Proxy not found!'))
                setproxy(id)
                return
              }
              console.log(cc.set("fg_green", username+': Geting proxy '+proxy.data[0].ip+':'+proxy.data[0].port+'...'))
              https.get({
                method: 'GET',
                host: 'ifconfig.me',
                path: '/'
              }, (res) => {
                if (res.statusCode === 200) {
                  resolve(proxy)
                  res.on('close', () => {
                    process.stdout.write(username+': \nProxy '+proxy.data[0].ip+':'+proxy.data[0].port+' connection closed\n')
                  })
                } else {
                  console.log(cc.set("fg_red", username+': Proxy '+proxy.data[0].ip+':'+proxy.data[0].port+' not working!'))
                  return
                }
              })
  
            })
            res.on("error", (error) => {
              console.log(cc.set("fg_red", username+': Proxy error: '+error))
              setproxy(id)
              return
            })
        }).on("error", (err) => {
            reject(err)
        })
    })
  }

})