from typing import List
import torch
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from app.config import (
    EMBEDDING_MODEL_NAME,
    CHROMA_DB_PATH,
    CHROMA_COLLECTION_NAME,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    EMBEDDING_DEVICE,
)

# 디바이스 설정
if EMBEDDING_DEVICE == "mps" and torch.backends.mps.is_available():
    print("MPS 디바이스를 사용합니다.")
    device = "mps"
else:
    print("CPU를 사용합니다.")
    device = "cpu"


def get_embedding_model() -> HuggingFaceEmbeddings:
    """임베딩 모델을 초기화하고 반환합니다."""
    print(f"임베딩 모델 '{EMBEDDING_MODEL_NAME}'을 로드합니다...")
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": device},
        encode_kwargs={"normalize_embeddings": True},
    )


def split_documents(text: str) -> List[Document]:
    """문서를 청크로 분할합니다."""
    print(f"문서를 청크로 분할합니다... (청크 크기: {CHUNK_SIZE}, 오버랩: {CHUNK_OVERLAP})")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )
    documents = text_splitter.create_documents([text])
    print(f"총 {len(documents)}개의 청크로 분할되었습니다.")
    return documents


def create_vector_store(documents: List[Document]) -> Chroma:
    """문서를 벡터 DB에 저장합니다."""
    print("벡터 DB를 초기화합니다...")
    embedding_model = get_embedding_model()
    
    print(f"총 {len(documents)}개의 문서를 임베딩하여 벡터 DB에 저장합니다...")
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_PATH,
        collection_name=CHROMA_COLLECTION_NAME,
    )
    print(f"벡터 DB가 {CHROMA_DB_PATH}에 저장되었습니다.")
    return vector_store


def load_vector_store() -> Chroma:
    """저장된 벡터 DB를 로드합니다."""
    print(f"벡터 DB를 {CHROMA_DB_PATH}에서 로드합니다...")
    embedding_model = get_embedding_model()
    vector_store = Chroma(
        persist_directory=CHROMA_DB_PATH,
        collection_name=CHROMA_COLLECTION_NAME,
        embedding_function=embedding_model,
    )
    print(f"벡터 DB 로드 완료 (총 {vector_store._collection.count()} 문서)")
    return vector_store