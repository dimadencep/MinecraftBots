const func = require("../system/func.js");

function run(client) {
    var spamming = false;

    client.on('time', function() {
        if (spamming) {
          client.chat(func.nextMessage);
        }
    });

    client.on('spawn',function() {
        spamming = true;
    });

    client.on('end', function () {
        spamming = false;
    });

    client.on('chat', function(username, message) {
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
}
module.exports = run;
module.exports.data = {
    "type": "bot"
}