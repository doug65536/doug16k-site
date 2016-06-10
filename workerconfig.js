var fs = require('fs');

module.exports.config = {
    domain: 'doug16k.com',
    serverOptions: {
        passphrase: 'Ryeshemniab2JetDirn1Tubdyp3Freyp',
        ca: [
            fs.readFileSync("doug16k-ca.pem"),
            fs.readFileSync("doug16k-ca-2.pem")
        ],
        key: fs.readFileSync("doug16k-key.pem"),
        cert: fs.readFileSync("doug16k-crt.crt"),
        ciphers: ([
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-ECDSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-ECDSA-AES256-GCM-SHA384',
            'DHE-RSA-AES128-GCM-SHA256',
            'DHE-DSS-AES128-GCM-SHA256',
            'kEDH+AESGCM',
            'ECDHE-RSA-AES128-SHA256',
            'ECDHE-ECDSA-AES128-SHA256',
            //'ECDHE-RSA-AES128-SHA',
            //'ECDHE-ECDSA-AES128-SHA',
            'ECDHE-RSA-AES256-SHA384',
            'ECDHE-ECDSA-AES256-SHA384',
            //'ECDHE-RSA-AES256-SHA',
            //'ECDHE-ECDSA-AES256-SHA',
            'DHE-RSA-AES128-SHA256',
            //'DHE-RSA-AES128-SHA',
            'DHE-DSS-AES128-SHA256',
            'DHE-RSA-AES256-SHA256',
            //'DHE-DSS-AES256-SHA',
            //'DHE-RSA-AES256-SHA',
            //'ECDHE-RSA-DES-CBC3-SHA',
            //'ECDHE-ECDSA-DES-CBC3-SHA',
            'AES128-GCM-SHA256',
            'AES256-GCM-SHA384',
            'AES128-SHA256',
            'AES256-SHA256',
            //'AES128-SHA',
            //'AES256-SHA',
            'AES',
            'CAMELLIA',
            //'DES-CBC3-SHA',
            '!aNULL',
            '!eNULL',
            '!EXPORT',
            '!DES',
            '!RC4',
            '!MD5',
            '!PSK',
            '!aECDH',
            '!EDH-DSS-DES-CBC3-SHA',
            '!EDH-RSA-DES-CBC3-SHA',
            '!KRB5-DES-CBC3-SHA'
        ]|| [    
            "ECDHE-RSA-AES256-SHA384",
            "DHE-RSA-AES256-SHA384",
            "ECDHE-RSA-AES256-SHA256",
            "DHE-RSA-AES256-SHA256",
            "ECDHE-RSA-AES128-SHA256",
            "DHE-RSA-AES128-SHA256",
            "HIGH",
            "!aNULL",
            "!eNULL",
            "!EXPORT",
            "!DES",
            "!RC4",
            "!MD5",
            "!PSK",
            "!SRP",
            "!CAMELLIA"
        ]).join(':'),
        honorCipherOrder: true
        
        // Extended security
        //ticketKeys: new Buffer(ticketKeys, 'base64'),
        //dhparam: dhp
    }
};
