var app = require('express')(),
    handlebars = require('express-handlebars').create({defaultLayout: 'main'}),
    bodyParser = require('body-parser');

var tours = [
    {id: 0, name: 'Hood River', price: 99.99},
    {id: 1, name: 'Oregon Coast', price: 149.95},
];

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// 예제 6-1. 기본 사용법
app.get('/about', function (req, res) {
    res.render('about');
});

// 예제 6-2. 200 외의 응답 코드
app.get('/error', function (req, res) {
    res.status(500);
    res.render('error');
});

// 예제 6-3. 쿼리스트링, 쿠키, 세션 값들 포함하여 뷰에 컨텍스트 전달
app.get('/greeting', function (req, res) {
    res.render('about', {
        message: 'welcome',
        style: req.query.style,
        userid: req.cookie.userid,
        username: req.session.username
    });
});

// 예제 6-4. 레이아웃 없이 뷰 렌더링
// 레이아웃 파일을 참조하지 않기 때문에 
// views/no-layout.handlebars 내용엔 HTML 전체가 들어가야 한다.
app.get('/no-layout', function (req, res) {
    res.render('no-layout', {
        layout: null
    });
});

// 예제 6-5. 커스텀 레이아웃으로 뷰 렌더링
// 레이아웃 파일 views/layouts/custom.handlebars 사용한다.
app.get('/custom-layout', function (req, res) {
    res.render('custom-layout', {
        layout: 'custom'
    });
});

// 예제 6-6. plaintext 출력 렌더링
app.get('/test', function (req, res) {
    res.type('text/plain');
    res.send('this is a test');
});

//
app.get('/input-contact', function (req, res) {
    res.render('input-contact');
});
app.get('/thank-you', function (req, res) {
    res.render('thank-you');
});

// 예제 6-9. 폼 프로세싱 기본
// body-parser 미들웨어가 연결되어 있어야 한다.
//app.post('/process-contact', function (req, res) {
//    console.log('Received contact from ' + req.body.name +
//        ' <' + req.body.email + '>');
//    // 데이터베이스에 저장하고....
//    res.redirect(303, '/thank-you');
//});

// 예제 6-10. 개선된 폼 프로세싱
// body-parser 미들웨어가 연결되어 있어야 한다.
app.post('/process-contact', function (req, res) {
    console.log(res.xhr);
    console.log('Received contact from ' + req.body.name +
    ' <' + req.body.email + '>');
    try {
        // 데이터베이스에 저장하고....

        return req.xhr ?
            res.json({success: true}) :
            res.redirect(303, '/thank-you');
    } catch (ex) {
        return req.xhr ?
            res.json({error: 'Database error.'}) :
            res.redirect(303, '/database-error');
    }
});

// 예제 6-12. JSON, XML, text 반환하는 GET endpoint
app.get('/api/tours', function (req, res) {
    var toursXml = '<?xml version="1.0"?><tours>' +
        tours.map(function (p) {
            return '<tour price="' + p.price +
                '" id="' + p.id + '">' + p.name + '</tour>';
        }).join('') + '</tours>';

    var toursText = tours.map(function (p) {
        return p.id + ': ' + p.name + ' (' + p.price + ')';
    }).join('\n');

    res.format({
        'application/json': function () {
            res.json(tours);
        },
        'application/xml': function () {
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function () {
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': function () {
            res.type('text/plain');
            res.send(toursText);
        }
    });
});

// 예제 6-13. 갱신을 위한 PUT endpoint
app.put('/api/tour/:id', function (req, res) {
    var item = null,
        p = tours.some(function (o) {
            item = o;
            return o.id == req.params.id;
        });
    if (p) {
        if (req.query.name) item.name = req.query.name;
        if (req.query.price) item.price = req.query.price;
        res.json({
            success: true,
            item: item
        });
    } else {
        res.json({error: 'No such tour exists.'});
    }
});

// 예제 6-14. 삭제를 위한 DEL endpoint
app.delete('/api/tour/:id', function (req, res) {
    var i;
    for (i = tours.length - 1; i >= 0; i--) {
        if (tours[i].id == req.params.id) break;
    }
    if (i >= 0) {
        tours.splice(i, 1);
        res.json({
            success: true,
            tours: tours
        });
    } else {
        res.json({error: 'No such tour exists.'});
    }
});

// 예제 6-7. 에러 핸들러 추가
// 이 부분은 라우터들 제일 뒤에 위치해야 한다.
// "next" 함수 사용하지 않아도 Express에서 알아서 에러 핸들러로 인식한다.
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('error');
});

// 예제 6-8. 404 핸들러 추가
// 이 부분은 라우터들 제일 뒤에 위치해야 한다.
app.use(function (req, res) {
    res.status(404).render('not-found');
});

app.listen(app.get('port'), function () {
    console.log('http://localhost:' + app.get('port'));
});