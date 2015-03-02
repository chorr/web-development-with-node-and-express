var app = require('express')();

app.set('port', process.env.PORT || 3000);

app.get('/headers', function (req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) {
        s += name + ': ' + req.headers[name] + '\n';
    }
    res.send(s);
});

app.listen(app.get('port'), function () {
    console.log('http://localhost:' + app.get('port') + '/headers');
});