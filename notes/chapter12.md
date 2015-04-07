# Chapter 12. Production Concerns

## 실행 환경

- production, development, test 같이 각 실행 환경 컨샙을 지원
- "staging" 같이 추가 환경도 설정 가능하지만 Express, Connect, 써드파티 미들웨어에서 제대로 인식 못할 수 있기 때문에 비추천

`NODE_ENV` 환경변수로 결정되며 `app.get('env')` 호출하여 확인:

```javascript
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') +
    ' mode on http://localhost:' + app.get('port') +
    '; press Ctrl-C to terminate.');
});
```

서버를 실행할 때 아래와 같이 동작:

```
$ export NODE_ENV=production
$ node meadowlark.js

또는 축약 문법

$ NODE_ENV=production node meadowlark.js
```

## 환경별 설정

- 실서비스 환경에선 불필요한 로그를 줄이고 개발 환경에선 다양한 로그가 필요
- development : [Morgan](https://github.com/expressjs/morgan) 사용 `npm install --save morgan`
- production : [express-logger](https://github.com/joehewitt/express-logger) 사용 `npm install --save express-logger`

```javascript
switch (app.get('env')) {
    case 'development':
        // compact, colorful dev logging
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}
```

## 웹사이트 스케일 조절

- 스케일 조절의 2가지 방법
    - scaling up : 더 높은 성능 (CPU, 메모리)
    - scaling out : 더 많은 서버
- Node 웹개발에선 scaling out에 항상 중점 
    - Node는 이를 잘 지원하고 있음
    - 하지만 file-based 저장 기반 서비스라면 해당 없음

### 앱 클러스터로 Scaling Out

- 앱 클러스터가 좋은 2가지 이유
    - 서버의 성능을 최대한 사용
    - 어려움 없이 병렬 상태를 테스트

먼저, 클러스터에서 실행되는 경우와 직접 실행되는 상황을 구분하기 위해 메인 어플리케이션을 수정:

```javascript
function startServer() {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.');
    });
}

if (require.main === module) {
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function
    // to create server
    module.exports = startServer;
}
```

그런다음 클러스터 실행을 위한 스크립트 생성, meadowlark_cluster.js:

```javascript
var cluster = require('cluster');

function startWorker() {
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}

if (cluster.isMaster) {

    require('os').cpus().forEach(function () {
        startWorker();
    });

    // log any workers that disconnect; if a worker disconnects, it“
    // should then exit, so we'll wait for the exit event to spawn
    // a new worker to replace it
    cluster.on('disconnect', function (worker) {
        console.log('CLUSTER: Worker %d disconnected from the cluster.',
            worker.id);
    });

    // when a worker dies (exits), create a worker to replace it
    cluster.on('exit', function (worker, code, signal) {
        console.log('CLUSTER: Worker %d died with exit code %d (%s)',
            worker.id, code, signal);
        startWorker();
    });

} else {

    // start our app on worker; see meadowlark.js
    require('./meadowlark.js')();

}
```

실행하는 시스템의 코어만큼 worker가 동작하는걸 볼 수 있다. 
각각의 호출에 서로 다른 worker 동작을 확인하려면 아래와 같이 미들웨어를 추가:

```javascript
app.use(function (req, res, next) {
    var cluster = require('cluster');
    if (cluster.isWorker) console.log('Worker %d received request',
        cluster.worker.id);
});
```

### Uncaught Exceptions 핸들링

```javascript
app.get('/epic-fail', function (req, res) {
    process.nextTick(function () {
        throw new Error('Kaboom!');
    });
});
```

위의 라우터를 추가하고 접근해보면 Node 서버 자체가 죽게 된다.
process.nextTick이 비동기로 실행되면서 더이상 기존 request 컨텍스트를 가지지 않게되고,
이 때 에러가 발생하면 process의 에러가 발생하며 모든 동작이 중단 되기 때문이다.

이를 해결하기 위해 Node는 _uncaughtException 이벤트_와 _domains_ 두가지 매커니즘을 가지고 있다.
uncaughtException은 Node 추후 버전에서 제거될 예정이라서 [domain으로 해결](https://nodejs.org/api/domain.html)하는게 좋다.

```javascript
app.use(function (req, res, next) {
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function (err) {
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function () {
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            var worker = require('cluster').worker;
            if (worker) worker.disconnect();
            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch (err) {
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', err.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch (err) {
            console.error('Unable to send 500 response.\n', err.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});

// other middleware and routes go here
var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Listening on port %d.', app.get('port'));
});
```
  
"shutting down gracefully" 처리되는걸 볼 수 있다. 
클러스터로 동작하고 있다면 전체 서버가 죽는걸 막을 수 있다.
William Bert가 작성한 [The 4 Keys to 100% Uptime with Node.js](http://engineering.fluencia.com/blog/2013/12/20/the-4-keys-to-100-uptime-with-nodejs) 읽어보길 강력 추천.

### 여러대의 서버로 Scaling Out

스킵

## 웹사이트 모니터링

### 서드파티 Uptime 모니터

- 아무도 없는 집의 화재경보기 같은 존재
- [UptimeRobot](http://uptimerobot.com/), [Pingdom](https://www.pingdom.com/), [Site24x7](http://www.site24x7.com/)

### 어플리케이션 실패

Amazon Simple Notification Service(SNS) 같은 알림 서비스를 고려해보아라.

## 스트레스 테스트

Mocha에서 다중 실행 가능한 loadtest 모듈로 테스트 가능, qa/tests-stress.js:

```javascript
var loadtest = require('loadtest');
var expect = require('chai').expect;

suite('Stress tests', function () {

    test('Homepage should handle 100 requests in a second', function (done) {
        var options = {
            url: 'http://localhost:3000',
            concurrency: 4,
            maxRequests: 100
        };
        loadtest.loadTest(options, function (err, result) {
            expect(!err);
            expect(result.totalTimeSeconds < 1);
            done();
        });
    });

});
```
