# Chapter 2. Getting Started with Node

## Getting Node
- 리눅스의 경우 각 환경별 [패키지 메니저 사용](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

## 터미널 사용

## 에디터
- 콘솔 에디터(vi, Emacs)가 핸디하다고 설명하고 있지만 핸디하기까지의 시간이 너무 걸린다..

## npm
- Node 버전별 환경을 제어하고 싶다면 [nvm](https://github.com/creationix/nvm), [n](https://github.com/tj/n) 사용

## A Simple Web Server with Node
- 기존의 웹서버와 다른 페러다임은 "웹서버 app을 작성"하는 것
- 장점 : 제어권을 더 가질 수 있다.

### Hello World

[helloWorld.js](/examples/helloWorld.js)

```javascript
var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello world!');
}).listen(3000);

console.log('Server started on localhost:3000; press Ctrl-C to terminate....');
```

### Event-Driven Programming
- Node의 핵심 철학
- 앞선 코드에선 <code>http.createServer</code> 부분 (HTTP 요청 자체는 이벤트)

### Routing
- URL 기반으로 어떤 동작을 할지 결정 (자세한건 6장에서)

[helloWorld.routing.js](/examples/helloWorld.routing.js)

```javascript
var http = require('http');

http.createServer(function (req, res) {
    // normalize url by removing querystring, optional
    // trailing slash, and making it lowercase
    var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    switch (path) {
    case '':
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Homepage');
        break;
    case '/about':
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('About');
        break;
    default:
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
        break;
    }
}).listen(3000);

console.log('Server started on localhost:3000; press Ctrl-C to terminate....');
```

### 정적 리소스 제공
- 대형 프로젝트라면 Nginx 프록시 또는 CDN 활용 (자세한건 16장에서)
- Node에선 자동으로 지원하지 않음 (IIS와 다르게)
- <code>public</code> 폴더를 만들어서 관리할텐데 <code>static</code>이라고 쓰지 않는 이유는 다음 장에서

[helloWorld.static.js](/examples/helloWorld.static.js)

```javascript
var http = require('http'),
    fs = require('fs');

function serveStaticFile(res, path, contentType, responseCode) {
    if (!responseCode) responseCode = 200;
    fs.readFile(__dirname + path, function (err, data) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('500 - Internal Error');
        } else {
            res.writeHead(responseCode, {'Content-Type': contentType});
            res.end(data);
        }
    });
}

http.createServer(function (req, res) {
    // normalize url by removing querystring, optional
    // trailing slash, and making lowercase
    var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    switch (path) {
    case '':
        serveStaticFile(res, '/public/home.html', 'text/html');
        break;
    case '/about':
        serveStaticFile(res, '/public/about.html', 'text/html');
        break;
    case '/img/logo.jpg':
        serveStaticFile(res, '/public/img/logo.jpg', 'image/jpeg');
        break;
    default:
        serveStaticFile(res, '/public/404.html', 'text/html', 404);
        break;
    }
}).listen(3000);

console.log('Server started on localhost:3000; press Ctrl-C to terminate....');
```

### Express를 향하여
- 이런식으로 만들다 보면 Express를 만들게 될것이다.
