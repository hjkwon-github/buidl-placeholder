.PHONY: help db-build server dev clean

# 기본 명령어 (도움말 표시)
help:
	@echo "사용법:"
	@echo "  make db-build     - Story Protocol 문서를 임베딩하여 벡터 DB 구축"
	@echo "  make server       - 검색 API 서버 실행"
	@echo "  make dev          - 개발 모드로 서버 실행 (자동 리로드)"
	@echo "  make clean        - 생성된 DB 파일 삭제"

# 벡터 DB 구축
db-build:
	@echo "벡터 DB 구축 중..."
	PYTHONPATH=$(CURDIR) poetry run python app/db_build.py

# API 서버 실행 (프로덕션)
server:
	@echo "API 서버 실행 중..."
	PYTHONPATH=$(CURDIR) poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000

# API 서버 실행 (개발)
dev:
	@echo "개발 모드로 API 서버 실행 중..."
	PYTHONPATH=$(CURDIR) poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 생성된 DB 파일 삭제
clean:
	@echo "생성된 DB 파일 삭제 중..."
	rm -rf db/*

# 기본 작업은 도움말 표시
default: help 