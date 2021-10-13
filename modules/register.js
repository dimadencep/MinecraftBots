function run(client) {
    client.on('spawn', function() {
        client.chat("/register adminloxidayn253r235 adminloxidayn253r235");
        client.chat("/login adminloxidayn253r235");
    });
}

module.exports = run;
module.exports.data = {
    "type": "bot"
}