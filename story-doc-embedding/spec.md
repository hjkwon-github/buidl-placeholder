

````markdown
# Story Protocol Local Search System 개발 명세서

## 목적
Story Protocol 공식 문서(https://github.com/storyprotocol/docs/blob/main/combined.md)를 로컬 환경에서 임베딩 처리하고, 로컬 벡터 DB를 구축하여 Python 기반 API 서버를 통해 자연어 질의에 대해 관련 내용을 검색하여 응답하는 시스템을 개발한다.

---

## 개발 스택
| 항목 | 기술 스택 |
|------|-----------|
| 언어 | Python 3.10+ |
| 패키지 관리 | Poetry |
| 임베딩 모델 | Huggingface Instructor (hkunlp/instructor-xl) |
| 벡터 DB | Chroma (로컬 저장) |
| API 서버 | FastAPI |
| 문서 파싱 | langchain.text_splitter |
| 환경변수 관리 | python-dotenv |

---

## 프로젝트 디렉토리 구조

```
story-search-tool/
├── app/
│   ├── main.py            # API Server 진입점
│   ├── embedding.py       # 문서 임베딩 처리 모듈
│   ├── db_build.py        # 벡터 DB 구축 스크립트
│   ├── search.py          # 검색 처리 로직
│   └── config.py          # 환경 변수 관리
├── data/                  # 원본 md 문서 저장
├── db/                    # Chroma DB 저장 경로
├── .env                   # 환경 변수 파일
├── pyproject.toml         # Poetry 관리 파일
└── README.md
```

---

## 개발 단계

### Step 1. Poetry 프로젝트 초기화
```bash
poetry init --name story-search-tool --python ">=3.10,<3.12"
```

### Step 2. 필수 라이브러리 설치
```bash
poetry add fastapi uvicorn langchain chromadb InstructorEmbedding pydantic requests python-dotenv
poetry add --group dev black isort mypy
```

### Step 3. 문서 다운로드
```bash
wget https://raw.githubusercontent.com/storyprotocol/docs/main/combined.md -O data/story_protocol_docs.md
```

### Step 4. 문서 파싱 및 전처리
- langchain.text_splitter 이용
- 헤더 단위 또는 chunk_size=1000 기준 분할

### Step 5. 임베딩 처리
- InstructorEmbedding 사용하여 embedding vector 생성
- "Represent the document for retrieval:" prompt 사용

### Step 6. Chroma Vector DB 구축
- 파싱된 텍스트와 임베딩 벡터 저장
- db_build.py 실행하여 로컬 DB 생성

### Step 7. Search API 개발
- FastAPI 서버 구성
- POST /search endpoint 제공
- langchain.vectorstores.Chroma 이용하여 유사도 검색

### Step 8. 서버 실행 방법
```bash
poetry run python app/db_build.py
poetry run uvicorn app.main:app --reload
```

---

## 운영 및 확장 고려사항
- 향후 OpenAI API 또는 LLM 연결 고려
- 검색 결과 요약 기능 추가 고려
````