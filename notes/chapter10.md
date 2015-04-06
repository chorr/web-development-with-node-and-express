# Chapter 10. Middleware

- 특정 기능별로 요약
- 3가지 인자를 가짐: request, response, next
- 파이프라인 방식으로 실행 `app.use`
- Express 4.0 부터는 미들웨어와 라우터 핸들러가 "순서"대로 연결
- 미들웨어 중간에 `next()`를 호출하지 않으면 중단 가능

미들웨어, 라우터 핸들러에 대한 유연함을 배우는게 Express 동작을 이해하기 위한 열쇠. 
- app.VERB (app.get, app.post 같은) 특정한 HTTP verb (GET, POST 등) 동작만 처리
- 라우터 핸들러는 경로를 위한 첫번째 인자가 필요
- 2~4개의 인자를 가진 콜백 함수가 필요 (에러 처리를 할 경우 맨처음이 error 객체)
- `next()` 호출하지 않고 중단할 땐 response 처리를 꼭!
- `next()` 호출한다면 클라이언트로 응답하지 않도록

```javascript
app.use(function (req, res, next) {
    console.log('processing request for "' + req.url + '"....');
    next();
});

app.use(function (req, res, next) {
    console.log('terminating request');
    res.send('thanks for playing!');
    // note that we do NOT call next() here...this terminates the request
});

app.use(function (req, res, next) {
    console.log('whoops, i\'ll never get called!');
});
```

마지막 미들웨어 앞에서 동작이 중단되었기 때문에 마지막은 절대 실행되지 않는다.

더 복잡하고 완성된 예제:

```javascript
var app = require('express')();

app.use(function (req, res, next) {
    console.log('\n\nALLWAYS');
    next();
});
app.get('/a', function (req, res) {
    console.log('/a: route terminated');
    res.send('a');
});
app.get('/a', function (req, res) {
    console.log('/a: never called');
});
app.get('/b', function (req, res, next) {
    console.log('/b: route not terminated');
    next();
});
app.use(function (req, res, next) {
    console.log('SOMETIMES');
    next();
});
app.get('/b', function (req, res, next) {
    console.log('/b (part 2): error thrown');
    throw new Error('b failed');
});
app.use('/b', function (err, req, res, next) {
    console.log('/b error detected and passed on');
    next(err);
});
app.get('/c', function (err, req) {
    console.log('/c: error thrown');
    throw new Error('c failed');
});
app.use('/c', function (err, req, res, next) {
    console.log('/c: error deteccted but not passed on');
    next();
});
app.use(function (err, req, res, next) {
    console.log('unhandled error detected: ' + err.message);
    res.send('500 - server error');
});

app.use(function (req, res) {
    console.log('route not handled');
    res.send('404 - not found');
});

app.listen(3000, function () {
    console.log('listening on 3000');
});
```

`/b` 호출과 `/c` 호출 차이점을 유심히 볼것.

미들웨어는 반드시 함수여야 한다. `express.static`은 함수지만 이를 호출해서 반환된게 미들웨어 함수.

```javascript
app.use(express.static);        // 예상대로 동작하지 않음
console.log(express.static());  // "function" 로그 표시되지만,
                                // 호출하면 다시 함수를 반환
```

함수를 별도의 모듈로 분리하고 바로 미들웨어로 사용할 수도 있다. `lib/tourRequiresWaiver.js` 사용 예제:

```javascript
module.exports = function (req, res, next) {
    var cart = req.session.cart;
    if (!cart) return next();
    if (cart.some(function (item) {
            return item.product.requiresWaiver;
        })) {
        if (!cart.warnings) cart.warnings = [];
        cart.warnings.push('One or more of your selected tours' +
        'requires a waiver.');
    }
    next();
}
```

미들웨어 연결:

```javascript
app.use(require('./lib/requiresWaiver.js')); 
```

좀 더 일반적으로, 객체의 프로퍼티로 각 미들웨어 분리하여 사용. `lib/cartValidation.js` 예제:

```javascript
module.exports = {
    checkWaivers: function (req, res, next) {
        var cart = req.session.cart;
        if (!cart) return next();
        if (cart.some(function (i) {
                return i.product.requiresWaiver;
            })) {
            if (!cart.warnings) cart.warnings = [];
            cart.warnings.push('One or more of your selected ' +
            'tours requires a waiver.');
        }
        next();
    },

    checkGuestCounts: function (req, res, next) {
        var cart = req.session.cart;
        if (!cart) return next();
        if (cart.some(function (item) {
                return item.guests >
                    item.product.maximumGuests;
            })) {
            if (!cart.errors) cart.errors = [];
            cart.errors.push('One or more of your selected tours ' +
            'cannot accommodate the number of guests you ' +
            'have selected.');
        }
        next();
    }
}
```

아래와 같이 미들웨어 연결:

```javascript
var cartValidation = require('./lib/cartValidation.js');

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);
```

## 일반 미들웨어

- Express 4.0 이전 Connect가 포함되어있을 때 대부분 일반적인 미들웨어가 다 포함 되어있었다.
- body parser 같은 경우: `app.use(express.bodyParser)`
- 4.0 되면서 Connect가 Express에서 제거됨 
- 미들웨어 역시 모두 각자의 프로젝트로 분리 (단, static 제외)
- 대부분의 경우 Connect가 필요할것이고 별도로 설치하여 사용하도록

### basicAuth
```app.use(connect.basicAuth)();```
기본적인 접근제어 인증 제공. 보안을 위해서 HTTPS 통해서만 사용해야 한다.


### body-parser
```app.use(require('body-parser')());```
Connect 제거되고 나서는 아래와 같이 json 또는 urlencoded 필요한 부분 각자 사용.

### json, urlencoded
```javascript
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
```

### compress
```app.use(connect.compress);```
응답 데이터 gzip에 사용. 이 미들웨어 이전에 디버깅, 로그 미들웨어 사용하길 권장.

### 목록들
- cookie-parse
- cookie-session
- express-session
- csurf
- directory
- errorhandler : 개발 단계에서 사용
- static-favicon
- morgan : 자동화된 로그 제공
- method-override
- query
- response-time : 퍼포먼스 튜닝 용도
- static
- vhost

## 써드파티 미들웨어

현재 써드파티 미들웨어를 위한 추천 페이지나 스토어 같은 개념이 없다. 
대부분 npm에 있고 "Express", "Connect", "Middleware" 검색하면 원하는 목록을 얻을 수 있을 것이다.   
