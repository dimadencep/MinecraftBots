function run(client) {

    var actions = [ 'forward', 'back', 'left', 'right']
    var lastaction;
    var pi = 3.14159;
    var moveinterval = 1;
    var maxrandom = 10;
    var lasttime = -1;
    var moving = 0;
    var connected = 0;

    client.on('time', function() {
        if (connected <1) {
            return;
        }
        if (lasttime<0) {
            lasttime = client.time.age;
        } else {
            var randomadd = Math.random() * maxrandom * 20;
            var interval = moveinterval*20 + randomadd;
            if (client.time.age - lasttime > interval) {
                if (moving == 1) {
                    client.setControlState(lastaction,false);
                    client.setControlState('jump', true)
                    client.setControlState('forward', true)
                    moving = 0;
                    lasttime = client.time.age;
                } else {
                    client.setControlState('forward', false)
                    client.setControlState('jump', false)
                    var yaw = Math.random()*pi - (0.5*pi);
                    var pitch = Math.random()*pi - (0.5*pi);
                    client.look(yaw,pitch,false);
                    lastaction = actions[Math.floor(Math.random() * actions.length)];
                    client.setControlState(lastaction,true);
                    moving = 1;
                    lasttime = client.time.age;
                    client.activateItem();
                }
            }
        }
    });

    client.on('spawn',function() {
        connected=1;
    });

    client.on('end', function () {
        lasttime = -1;
        moving = 0;
        connected=0;
    });

}

module.exports = run;
module.exports.data = {
    "type": "bot"
}