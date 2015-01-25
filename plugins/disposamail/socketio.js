var server = require('http').createServer();
var io = require('socket.io')(server);
var phonetic = require('phonetic');
var MailParser = require("mailparser").MailParser;

exports.register = function () {
    var plugin = this;

    plugin.clients = [];

    var load_config = function () {
        plugin.cfg = plugin.config.get('disposamail_socketio.ini', {}, load_config);
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

exports.hook_rcpt = function(next, connection, params) {
    var plugin = this;
    var txn = connection.transaction;
    if (!txn) { return; }

    var rcpt = params[0];

    if (!rcpt.host) {
        txn.results.add(plugin, {fail: 'rcpt!domain'});
        return next();
    }

    if (!rcpt.user) {
        txn.results.add(plugin, {fail: 'rcpt!user'});
        return next();
    }

    var user = (rcpt.user + '@' + rcpt.host).toLowerCase();

    if (!(user in plugin.clients)) {
        txn.results.add(plugin, {fail: 'rcpt!user'});
        return next();
    }

    txn.results.add(plugin, {pass: 'rcpt_to'});
    return next(OK);
};

exports.hook_queue = function (next, connection) {
    var plugin = this;
    var txn = connection.transaction;

    connection.loginfo(plugin, 'Sending message to user.');

    txn.message_stream.get_data(function(data) {
        for (var i = 0; i < txn.rcpt_to.length; i++) {
            var rcpt_to = (txn.rcpt_to[i].user + '@' + txn.rcpt_to[i].host).toLowerCase();

            connection.loginfo(plugin, 'Looking for user' + rcpt_to);

            if (rcpt_to in plugin.clients) {
                var parser = new MailParser();

                parser.on("end", function(mail_object){
                    connection.loginfo('Sending message to ' + rcpt_to);
                    
                    mail_object.raw = data;
                    
                    plugin.clients[rcpt_to].emit('message', mail_object);
                });

                parser.write(data);
                parser.end();
            }
        }

        next(OK);
    });
};
