const config = require('./configs/global.json');
const mineflayer = require('mineflayer');
const bot = require('./system/bots.js');
const fs = require('fs');

mineflayer.multiple = (clients, constructor) => {
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

config.modules.forEach(m => {
  fs.stat("./modules/"+m+".js", function(err, stats) {
      if (err) {
          console.log("Не удалось найти модуль "+m)
      } else {
        const module = require("./modules/"+m+".js");
          if (module.data.type=="core") {
            module();
          }
      }
      return;
  });
})

const names = fs.readFileSync("./names/"+config.profiles.names+".txt", "utf8").split(/\r?\n/);

const clients = [];
for (let i = 0; i < names.length; i++) {
  clients.push({ username: names[i] })
}

mineflayer.multiple(clients, ({ username }) => {
  bot(username);
})