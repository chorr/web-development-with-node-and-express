# Chapter 11. Sending Email

- 암호 초기화, 프로모션, 문제알림 등 주요 기능으로 사용됨 
- Andris Reinman이 만든 [Nodemailer](https://npmjs.org/package/nodemailer) 추천

## SMTP, MSAs, MTAs

- SMTP(Simple Mail Transfer Protocol)
    - 받는사람의 메일서버에 직접 메일 발송
    - Google, Yahoo 같이 "믿을만한 발송인"이 아니면 스팸함으로 가기 쉬움
- MSA(Mail Submission Agent)
    - 믿을만한 채널을 통해 발송되고 스팸으로 분류될 가능성을 줄여줌
- MTA(Mail Transfer Agent)
    - 최종 목적지에 실제로 발송하는 서비스
- MSA 접근을 위한 쉬운 방법은 알려진 무료 메일 서비스를 활용
    - 단기간의 해결책일뿐 (발송에 제한이 많다)
- 실서비스 단계에선 전문 MSA로 전환 - Sendgrid 또는 Amazon Simple Email Service(SES)

## 메일 받기

서비스에 따라서 메일 수신이 필요한 경우도 있다. 하지만 이 책에선 다루지 않는다. 
필요하다면 [SimpleSMTP](https://github.com/andris9/simplesmtp) 또는 [Haraka](http://haraka.github.io/) 참조.

## 메일 헤더

- 메일 메시지는 header, body 두 부분으로 구성
- 헤더의 "from" 주소를 바꿀 수 있지만 권하지 않음
- `DO NOT REPLY <do-not-reply@meadowlarktravel.com>` 같은 주소 대신 `Meadowlark Travel <info@meadowlarktravel.com>` 사용

## 메일 포맷

- 메일 포맷과 인코딩이 항상 골칫거리지만 Nodemailer가 어느 정도 처리
- 대부분 메일 클라이언트가 HTML 메일을 지원하지만 plaintext, HTML 둘다 사용하길 권장

## HTML 메일

- 메일에선 HTML의 일부분만 사용가능 (때문에 테이블 레이아웃을...)
- MailChimp에서 작성한 [HTML 메일 관련글](http://kb.mailchimp.com/campaigns/ways-to-build/how-to-code-html-emails) 읽어보길 바람
- [HTML Email Boilerplate](https://github.com/seanpowell/Email-Boilerplate)
- 각 클라이언트에서 어떻게 보이는지 일괄 테스트는 [Litmus](https://litmus.com/email-testing) 사용

## Nodemailer

패키지 설치:
```
npm install --save nodemailer
```

패키지 불러와서 인스턴스 생성:
```javascript
var nodemailer = require('nodemailer'),
    credentials = require('./credentials');

var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password,
    }
});
```
:exclamation: Nodemailer 1.0 업데이트 이후에 위 예제로 동작하지 않는다. [마이그레이션 가이드](https://andrisreinman.com/nodemailer-v1-0/#migrationguide) 참조.

MSA 대신 [직접 SMTP 설정](https://github.com/andris9/nodemailer-smtp-transport#usage)하여 사용도 가능하다.

### 메일 보내기

텍스트 메일은 한명의 수신자에게 발송:
```javascript
mailTransport.sendMail({
    from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
    to: 'joecustomer@gmail.com',
    subject: 'Your Meadowlark Travel Tour',
    text: 'Thank you for booking your trip with Meadowlark Travel.  ' +
    'We look forward to your visit!'
}, function (err) {
    if (err) console.error('Unable to send email: ' + err);
});
```

### 여러 수신자에게 메일 보내기

간단히 예시만 살펴보자:
```javascript
// largeRecipientList is an array of email addresses
var recipientLimit = 100;
for (var i = 0; i < largeRecipientList.length / recipientLimit; i++) {
    mailTransport.sendMail({
        from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
        to: largeRecipientList
            .slice(i * recipientLimit, i * (recipientLimit + 1)).join(','),
        subject: 'Special price on Hood River travel package!',
        text: 'Book your trip to scenic Hood River now!',
    }, function (err) {
        if (err) console.error('Unable to send email: ' + error);
    });
}
```

## 벌크 메일을 위한 차선책

직접 전송하기 보다는 [MailChimp](http://mailchimp.com/)나 [Campaign Monitor](https://www.campaignmonitor.com/) 같은 전문화 된 서비스를 사용하길 적극 권장.

## HTML 메일 보내기

메일 body에 대한 이슈라 건너뜀

## 메일을 사이트 모니터링 도구로

에러 핸들링 구간에 이메일을 보내는 방식을 취할 수 있으나, 
괜찮은 방법은 아니고 12챕터에서 로그와 알림 구조를 다시 살펴보기로 한다.

