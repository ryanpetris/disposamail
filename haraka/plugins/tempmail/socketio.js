var server = require('http').createServer();
var phonetic = require('phonetic');
var io = require('socket.io')(server);

exports.register = function () {
    var plugin = this;

    plugin.clients = [];

    var load_config = function () {
        plugin.cfg = plugin.config.get('tempmail_socketio.ini', {}, load_config);
    };
    load_config();

    io.on('connection', function(socket) {
        var address = null;

        do {
            address = phonetic.generate().toLowerCase() + '@' + plugin.cfg.main.domain;
        } while (address in plugin.clients);

        plugin.clients[address] = socket;

        socket.on('disconnect', function() {
            delete plugin.clients[address];
        });

        socket.emit('info', {
            address: address
        });
    });

    io.listen(3000);
}

exports.hook_queue = function (next, connection) {
    var plugin = this;
    var txn = connection.transaction;

    connection.loginfo(plugin, 'Sending message to user.');

    for (var i = 0; i < txn.rcpt_to.length; i++) {
        var rcpt_to = txn.rcpt_to[i].user + '@' + txn.rcpt_to[i].host;

        connection.loginfo(plugin, 'Looking for user' + rcpt_to);

        if (rcpt_to in plugin.clients) {
            connection.loginfo('Sending message to ' + rcpt_to);
            plugin.clients[rcpt_to].emit('message', txn.message_stream);
        }
    }

    next();
};
