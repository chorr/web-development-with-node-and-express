# Chapter 4. Tidying Up

## Best Practices

## Version Control

- 버전 관리의 장점들
    - 기록(documentation) : 기술적 히스토리들은 매우 유용
    - 귀속(attribution) : 그룹으로 작업할때 매우 중요
    - 실험(experimentation) : 기존 프로젝트 안정성에 상관없이 얼마든 시도하고 반영 가능
- Git, Mercurial 둘다 무료이며 훌륭한 시스템
- Git 학습 추천 자료
    - [Version Control with Git](http://shop.oreilly.com/product/9780596520137.do)
    - [GitHub Code School](https://try.github.io/levels/1/challenges/1)
    
## 이 책에서 Git 사용법

- Git 설치가 안되어있다면 [Git documentation](http://git-scm.com/) 참조하여 설치

### 자신이 직접 진행하고 싶다면

앞서 만들었던 프로젝트 디렉토리를 Git 저장소로 만든다:

    git init
    
저장소에 일부를 포함되지 않도록 설정하기 위해 `.gitignore`를 만들었었다.
와일드카드를 지원하며 백업파일을 무시하고 싶다면 `*~` 이렇게 쓰면된다.
Mac을 사용하면 `.DS_Store` 같이 임시파일이 생기는데 이것도 추가.

    node_modules
    *~
    .DS_Store

> #### TIP
> `.gitignore` 파일 위치 이하의 서브 디렉토리까지 영향이 간다.

저장소에 포함되도록 파일을 추가하려면 하나하나씩 추가할 수도 있지만 (예를 들어, `git add meadowlark.js`)
보통은 한꺼번에 추가한다:

    git add -A

Git는 `git add` 실행했을 때 반영되는 "스테이징 영역"을 가진다. 
여기에 파일이 있다는건 아직 커밋되지 않고 준비만 된 상태이다.
아래 명령으로 커밋을 수행한다:

    git commit -m "Initial commit."

### 공식 저장소를 사용하여 진행하고 싶다면

공식 저장소에는 매번 추가되거나 수정이 있는 부분마다 태깅 되어있다.
시작하려면 클론부터 한다:

    git clone https://github.com/EthanRBrown/web-development-with-node-and-express

원하는 부분(챕터)에 해단하는 태그로 체크아웃 받는다:

    git checkout ch04

## npm Packages

- npm 패키지 의존관계
    - 버저닝 기준은 [semver](http://semver.org)
    - `node_modules` 디렉토리는 저장소 관리대상인가? 아니다.
    
## Project Metadata

- npm 패키지 등록 시 중요한 정보
- README 파일도 잘 활용하면 좋다.

## Node Modules

- Node 모듈은 코드를 모듈화하는 메커니즘
- npm package는 모듈, 프로젝트 자체를 버저닝하고 참조하는 용도

