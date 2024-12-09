from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from openai import OpenAI
from pydantic import BaseModel

from ragflow import create_session_with_chat_assistant, converse_with_chat_assistant


class ChatSessionRequest(BaseModel):
    chat_assistant_id: str


class ChatRequest(BaseModel):
    chat_assistant_id: str
    session_id: str
    query: str


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)


@app.post("/create_session")
async def create_session(request: ChatSessionRequest):
    try:
        session_id = create_session_with_chat_assistant(
            request.chat_assistant_id,
        )
        return JSONResponse(
            status_code=200,
            content={
                "session_id": session_id,
                "message": "Session created successfully",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = converse_with_chat_assistant(
            chat_id=request.chat_assistant_id,
            session_id=request.session_id,
            query=request.query,
        )
        return StreamingResponse(
            response,
            media_type="text/plain",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)
