# Chapter 9. Cookies and Sessions

- stateless protocol
- 쿠키 동작
    - 서버가 `Set-Cookie` 헤더로 내려주면
    - 브라우저가 지정된 기간 동안 정보를 보관
    - 서버에 다시 요청을 보낼 때 쿠키가 있으면 헤더에 `Cookie` 포함 전송

## 인증정보 분리

- 쿠키 시크릿 : 쿠키 암호화에 사용되는 임의의 문자열
- 인증정보 관련 파일을 별도로 분리

## Express에서 쿠키 사용

- cookie-parser 미들웨어

## 세션

- 쿠키 기반 세션
- 메모리 세션
    - 쿠키에는 식별자만 저장. 나머지 정보는 서버에
- express-session 사용

## 세션을 사용하여 일시적인 메시지 보여주기


