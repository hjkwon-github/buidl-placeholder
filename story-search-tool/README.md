# Story Protocol 문서 검색 시스템

Story Protocol 공식 문서를 로컬 환경에서 임베딩 처리하고, 로컬 벡터 DB를 구축하여 Python 기반 API 서버를 통해 자연어 질의에 대해 관련 내용을 검색하여 응답하는 시스템입니다.

## 기능

- Story Protocol 공식 문서 임베딩 처리
- 로컬 벡터 DB 구축 (Chroma)
- 자연어 기반 문서 검색 API 제공
- Mac MPS(Metal Performance Shaders) 지원

## 시스템 요구사항

- Python 3.10 이상
- Poetry (패키지 관리 도구)
- MacOS (MPS 지원을 위해)
- 최소 8GB RAM (권장 16GB)
- 최소 2GB 디스크 공간

## 설치 방법

1. Poetry 설치
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. 프로젝트 클론
```bash
git clone <repository-url>
cd story-search-tool
```

3. 의존성 설치
```bash
poetry install
```

## 사용 방법

### Makefile을 이용한 간편한 실행

프로젝트 루트 디렉토리에서 다음 명령어를 사용할 수 있습니다:

```bash
# 도움말 보기
make help

# 벡터 DB 구축 (처음 실행 시 필수)
make db-build

# API 서버 실행 (프로덕션)
make server

# API 서버 실행 (개발 모드, 자동 리로드)
make dev

# 생성된 DB 파일 삭제
make clean
```

### 수동 실행 방법

1. 문서 다운로드
```bash
curl -o data/story_protocol_docs.md https://raw.githubusercontent.com/storyprotocol/docs/main/combined.md
```

2. 벡터 DB 구축
```bash
PYTHONPATH=$PYTHONPATH:. poetry run python app/db_build.py
```

3. API 서버 실행
```bash
PYTHONPATH=$PYTHONPATH:. poetry run uvicorn app.main:app --reload
```

## API 엔드포인트

### POST /search

문서를 검색합니다.

**요청 본문:**
```json
{
    "query": "검색어",
    "k": 2  // 반환할 결과 수 (선택 사항, 기본값: 2)
}
```

**응답 본문:**
```json
{
    "results": [
        {
            "content": "검색 결과 내용",
            "metadata": {
                "source": "문서 출처",
                "page": "페이지 번호"
            }
        }
    ]
}
```

## 개발 스택

- Python 3.10+
- Poetry (패키지 관리)
- FastAPI (API 서버)
- Chroma (벡터 DB)
- HuggingFace (임베딩 모델)
- LangChain (문서 처리)
- PyTorch (MPS 지원)

## 주요 의존성 버전

- fastapi: 0.115.9
- uvicorn: 0.34.0
- langchain: 0.3.23
- chromadb: 1.0.4
- instructorembedding: 1.0.1
- pydantic: 2.11.3
- torch: 2.6.0
- sentence-transformers: 4.0.2

## 성능 최적화

- Mac MPS 지원으로 GPU 가속
- 768 차원 임베딩으로 높은 검색 정확도
- 청크 기반 문서 처리로 효율적인 메모리 사용

## 라이선스

MIT