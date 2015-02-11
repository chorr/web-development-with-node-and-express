# Chapter 3. Saving Time with Express

## Scaffolding
- Boilerplate에 해당하는 코드를 미리 만들어 놓는 것 (Ruby on Rails에서 많이 사용)
- Express에서도 제공하지만 본 책에선 사용하지않길 권장
- [HTML5boilerplate](https://html5boilerplate.com/)

## Meadowlark 여행사 웹사이트
- 앞으로 사용하게 될 가상의 웹서비스
- REST 서비스이며 추가적인 기능도 제공

## 초기화 단계
- project root 생성 (project directoy, app directory 불리기도)
- `npm init` 실행하면 package.json을 포함하여 npm 구조를 만들 수 있다.

Express 설치를 위해 npm 명령 실행:

    npm install --save express
    
_node\_modules_ 디렉토리는 저장소에 포함시키지 않기 위해 [.gitignore](/meadowlark/.gitignore) 생성:

    # ignore packages installed by npm
    node_modules
    
    # put any other files you don't want to check in here,
    # such as .DS_Store (OSX), *.bak, etc.

프로젝트 진입점이 되는 [meadowlark.js][] 파일 생성:

```javascript
var express = require('express');

var app = express();

app.set('port', process.env.PORT || 3000);

// custom 404 page
app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// custom 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});
```

> #### TIP
> - 메인 파일을 app.js, index.js 같이 작성하지 말고 프로젝트명이 좋을듯
> - `package.json` 내부의 main 속성도 바꾸도록
> - [Redirect Path 크롬 확장도구](https://chrome.google.com/webstore/detail/redirect-path/aomidfkchockcldhbkggjokdkkebmdll) : 응답코드 확인에 유용함

너무 단순해서 실망할 수 있으니 라우터 몇가지를 404 핸들러 앞에 추가하자:

```javascript
app.get('/', function (req, res) {
    res.type('text/plain');
    res.send('Meadowlark Travel');
});
app.get('/about', function (req, res) {
    res.type('text/plain');
    res.send('About Meadowlark Travel');
});

// custom 404 page
app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
```

- *app.VERB* (여기서 VERB는 HTTP 동작에 관한 get, post 같은) 형태를 볼 수 있으며 두가지 인자를 가진다.
    - path(첫번째 인자) : 경로를 정의. 대소문자, 쿼리문자열, 슬래시 무시
    - function(두번째 인자) : 해당하는 경로로 접근하면 동작. 호출/응답 객체를 인자로 가진다.
- *app.use* 메소드로 미들웨어 추가 가능 (자세한건 10장에서)

라우트와 미들웨어에 코드를 정의한 순서대로 처리되는 점에 유의:

```javascript
app.get('/about*',function(req,res){
        // send content....
})
app.get('/about/contact',function(req,res){
        // send content....
})
app.get('/about/directions',function(req,res){
        // send content....
})
```

### 뷰와 레이아웃
- 템플릿 엔진
    - Jade : 프론트앤드 개발자에겐 불편
    - Handlebars : [express-handlebars](https://github.com/ericf/express-handlebars) 
      (책에선 express3-handlebars 패키지라고 소개하지만 이름이 바뀜)

프로젝트 디렉토리에서 아래 명령으로 설치:

	npm install --save express-handlebars

뷰엔진 설정을 위해 [meadowlark.js][]에서 app 생성 다음 부분에 추가:

```javascript
var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars')
    .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
```

사용을 위해서 특정한 디렉토리 구조가 필요한데 [views](/meadowlark/views) 구조를 참조바란다.

기본 레이아웃인 [views/layouts/main.handlebars](/meadowlark/views/layouts/main.handlebars) 템플릿 생성:

```html
<!doctype html>
<html>
<head>
    <title>Meadowlark Travel</title>
</head>
<body>
    {{{body}}}
</body>
</html>
```

[views/home.handlebars](/meadowlark/views/home.handlebars) 생성:

```html
<h1>Welcome to Meadowlark Travel</h1>
```

[views/about.handlebars][] 생성:

```html
<h1>About Meadowlark Travel</h1>
```

[views/404.handlebars](/meadowlark/views/404.handlebars) 생성:

```html
<h1>404 - Not Found</h1>
```

[views/500.handlebars](/meadowlark/views/500.handlebars) 생성:

```html
<h1>500 - Server Error</h1>
```

이제 앞에서 만든 뷰를 사용하기 위해 이전의 라우트 코드를 수정한다:

```javascript
app.get('/', function (req, res) {
    res.render('home');
});
app.get('/about', function (req, res) {
    res.render('about');
});

// 404 catch-all handler (middleware)
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});
```

### 정적 파일과 뷰

- `static` 미들웨어로 다른 특별한 처리없이 간단히 정적 리소스를 제공할 수 있다.
- _public_ 디렉토리 만들고 여기에서 제공

그러기 위해선 `static` 미들웨어 추가:
 
    app.use(express.static(__dirname + '/public'));

`public` 경로에 로고 이미지를 추가하고, 레이아웃을 수정해서 모든 페이지에서 볼 수 있게 만든다:

```html
<body>
    <header><img src="/img/logo.png" alt="Meadowlark Travel Logo"></header>
    {{{body}}}
</body>
```

### 뷰에서 동적 컨텐트

동적인 정보를 보여주기 위해 [meadowlark.js][] 파일에 배열을 정의: 

```javascript
var fortunes = [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple."
];
```

이를 표시하기 위해 뷰 [views/about.handlebars] 수정:

```html
<h1>About Meadowlark Travel</h1>

<p>Your fortune for the day:</p>
<blockquote>{{fortune}}</blockquote>
```

`/about` 라우트를 수정해 랜덤으로 표시될 수 있게 한다:

```javascript
app.get('/about', function (req, res) {
    var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', {fortune: randomFortune});
});
```


[meadowlark.js]: /meadowlark/meadowlark.js
[views/about.handlebars]: /meadowlark/views/about.handlebars
