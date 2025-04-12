from typing import List, Dict, Any
from app.embedding import load_vector_store


def search_documents(query: str, k: int = 5) -> List[Dict[str, Any]]:
    """문서를 검색하고 결과를 반환합니다."""
    # 벡터 DB 로드
    vector_store = load_vector_store()

    # 검색 실행
    docs = vector_store.similarity_search(query, k=k)

    # 결과 포맷팅
    results = []
    for doc in docs:
        results.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
        })

    return results