const dgram = require("dgram");
const EventEmitter = require("events");
const chalk = require('chalk');

const fatal = chalk.bold.redBright;
const error = chalk.red;
const debug = chalk.rgb(0x80, 0x80, 0x80);
const debug2 = chalk.grey;
const core = chalk.magenta;
const log = function(text) {return(text)};

function SysLogServer(port) {
    this.server = dgram.createSocket("udp4");
    var options = {port: 1514, address: "0.0.0.0", exclusive: true};


    this.server.bind(options, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Server is started');
        }

    });

    this.server.on("error", function (err) {
        console.log(err);
    });

    // Socket message handler
    this.server.on("message", function (data, remote) {
        // var host = remote.address;
        // var protocol = remote.family;

        var T = log;

        var msg = data.toString("utf8").replace(/\n\u0000$/, "");
        msg = msg.substr(3);

        var msgArray = msg.split('\t');

        var date = msgArray[0];
        var level = msgArray[1];
        var type = msgArray[2];
        var message = msgArray[3];
        var prefix = message.substr(0, 6);

        switch (prefix) {
            case 'DEBUG:':
                    T = debug2;
                break;
            case 'ERROR:':
                    T = error;
                break;
        }

        switch (level) {
            case 'ERROR':
                    T = fatal;
                break;
            case 'INFO':
                msgArray[1] = '';
                break;

            case 'DEBUG':
                    T = debug;
                break;

            default:
        }

        switch (type) {
            case 'SCRIPT':
                msgArray[2] = '';
                break;
            case 'CORE':
                msgArray[3] = message.replace(/\n/, ' ');
                T = core;
                break;
        }


        msgArray[1] = ('         ' + msgArray[1]).slice(-7);
        msgArray[2] = ('            ' + msgArray[2]).slice(-10);





        var out = msgArray.join(' ');

        console.log(T(out));

    });

}

new SysLogServer();

