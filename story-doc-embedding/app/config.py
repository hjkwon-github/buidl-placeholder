# API 서버 설정
API_HOST = "0.0.0.0"
API_PORT = 8000

# 벡터 DB 설정
CHROMA_DB_PATH = "./db"
CHROMA_COLLECTION_NAME = "story_protocol_docs"

# 임베딩 모델 설정
# BAAI/bge-small-en-v1.5: 384 차원, 가벼운 모델, 빠른 처리
# hkunlp/instructor-xl: 768 차원, 더 정확한 임베딩
EMBEDDING_MODEL_NAME = "hkunlp/instructor-xl"  # 768 차원 임베딩
EMBEDDING_DEVICE = "mps"  # Mac의 Metal GPU 사용

# 문서 처리 설정
CHUNK_SIZE = 512  # 문서 청크 크기
CHUNK_OVERLAP = 128  # 청크 간 중복 크기
DOCUMENT_PATH = "./data/story_protocol_docs.md"