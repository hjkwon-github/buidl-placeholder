from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from app.config import API_HOST, API_PORT
from app.search import search_documents


app = FastAPI(
    title="Story Protocol 문서 검색 API",
    description="Story Protocol 문서를 검색하는 API 서버입니다.",
    version="1.0.0",
)

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 오리진 허용 (프로덕션에서는 특정 도메인으로 제한하는 것이 좋음)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)


class SearchRequest(BaseModel):
    """검색 요청 모델"""
    query: str
    k: int = 5


class SearchResponse(BaseModel):
    """검색 응답 모델"""
    results: List[Dict[str, Any]]


@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """문서를 검색합니다."""
    try:
        results = search_documents(request.query, request.k)
        return SearchResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)