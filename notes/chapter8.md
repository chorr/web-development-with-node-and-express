# Chapter 8. Form Handling

## 클라이언트 데이터 서버로 보내기


## HTML Forms

- HTML 폼의 속성들
    - method
    - action
    - name
    - id
    - hidden
- 불필요한 필드는 모두 뺄것
- 수행하는 과업이 다르다면 별개의 폼을 사용
- 어느 버튼을 클릭한지에 따라 액션을 달리하면 접근성이 나빠짐

## Encoding

- application/x-wwwform-urlencoded : url인코딩
- 파일 업로드는 multipart/form-data : express에서 기본 미지원

## 폼을 처리하는 여러 방법

- 폼 응답 종류
    - HTML 문서 : 페이지 새로고침 시도하면 경고 발생
    - 302 redirect : 잘못된 방법
    - 303 (see other) redirect : 폼 응답용으로 추천
    - 301 redirect : 잘못된 방법
- 303 redirect 구현
- ajax 전송에 대해서는 별도의 액션을 만드는게 좋음

## Express로 폼 처리

### 액션에 GET 요청 사용

### 액션에 POST 요청 사용

### body-parser

- `bodyParser.urlencoded.extended`
    - true : qs 모듈 사용
    - false : node의 querystring 사용

## AJAX 폼 처리

## 파일 업로드 

### 미들웨어

- multipart : 커넥트 빌트인 미들웨어지만 deprecated
- formidable
- busboy




