var nodemailer = require('nodemailer'),
    credentials = require('./credentials');

var mailTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password
    }
});

mailTransport.sendMail({
    from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
    to: 'julyfool@gmail.com',
    subject: 'Your Meadowlark Travel Tour',
    text: 'Thank you for booking your trip with Meadowlark Travel.  ' +
    'We look forward to your visit!'
}, function (err) {
    if (err) console.error('Unable to send email: ' + err);
});

