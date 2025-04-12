import os
from pathlib import Path

from app.config import DOCUMENT_PATH, CHROMA_DB_PATH
from app.embedding import split_documents, create_vector_store


def main():
    """문서를 로드하고 벡터 DB를 구축합니다."""
    # 문서 파일 존재 확인
    if not os.path.exists(DOCUMENT_PATH):
        raise FileNotFoundError(f"문서 파일을 찾을 수 없습니다: {DOCUMENT_PATH}")

    # 문서 로드
    with open(DOCUMENT_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    # 문서 분할
    print("문서를 청크로 분할하는 중...")
    documents = split_documents(text)

    # 벡터 DB 구축
    print("벡터 DB를 구축하는 중...")
    create_vector_store(documents)
    # Chroma 0.4.x 이상에서는 자동으로 저장됨

    print(f"벡터 DB 구축이 완료되었습니다. 저장 위치: {Path(CHROMA_DB_PATH).absolute()}")


if __name__ == "__main__":
    main() 