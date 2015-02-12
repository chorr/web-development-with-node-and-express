# Chapter 5. Quality Assurance

## QA 고려해야할 요소들

- 도달률 : 수익륙과 직결되는 요소
- 기능 : 사용자를 붙잡아두는 요소. 테스트 자동화가 가능
- 사용성 : 얼마나 쓰기 쉬운지. 테스트 자동화가 어려움
- 심미성 : 가장 주관적 요소

## 테스트의 종류와 기술들

- 단위 테스트
- 통합 테스트

- 페이지 테스팅 : mocha
- 크로스 페이지 테스팅 : Zombie.js
- 로직 테스팅
- 린팅 : JSHint
- 링크 확인 : LinkChecker

## 서버 실행

- 변경 사항을 반영하려면 서버 재시작 필요
- 일단 항상 서버 실행창을 따로 띄워두자. 
- 자동화 : nodemon

## 페이지 테스팅

- 실제 페이지에 특정 환경에서 동작하도록 만드는걸 추천 (`?test=1` 쿼리로 판단하고 활성하하는 예시)


## 크로스 페이지 테스팅

## 로직 테스팅

