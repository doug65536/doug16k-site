var nodemailer = require('nodemailer');
var mailerconfig = require('./mailercfg');
var transporter;

module.exports.sendMail = sendMail;
module.exports.reset = reset;

function sendMail(options) {
    if (!transporter)
        transporter = nodemailer.createTransport();

    transporter.sendMail(options
    || {
        from: 'doug16k@doug16k.com',
        to: 'doug16k@gmail.com',
        subject: 'hello',
        text: 'hello world!'
    });
}

// Unit tests can use reset() to restore
// lazy initialized variables to undefined
function reset() {
    transporter = undefined;
}
