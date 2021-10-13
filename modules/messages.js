const cc = require('node-console-colors');

function run(client) {
    client.on('error', function (error) {
        console.log(cc.set("fg_red", "("+client._client.username+') Client Error: '+error))
    });

    client.on('kick_disconnect', (reason) => {
        console.log(cc.set("fg_red", "("+client._client.username+') Kicked for reason: '+JSON.parse(reason.reason).translate))
    });

    client.on('connect', function () {
        console.log(cc.set("fg_green", "("+client._client.username+') Connected!'))
    });

    client.on('disconnect', function (packet) {
        console.log(cc.set("fg_red", "("+client._client.username+') Disconnected: '+JSON.parse(packet.reason).translate))
    });

    client.on('chat', function(username, message) {
        //TODO проверка ников.
        console.log("("+client._client.username+') '+username+": "+message);
    });

    client.on('end', function () {
        console.log(cc.set("fg_yellow", "("+client._client.username+') Connection lost!'))
    });
}

module.exports = run;
module.exports.data = {
    "type": "bot"
}