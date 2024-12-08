from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@app.post("/chat")
async def chat(request: ChatRequest):
    # Integrate with your preferred LLM here
    # For example, using OpenAI's API
    # response = await openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=request.messages
    # )

    # Placeholder response
    return {
        "response": "This is a placeholder response. Integrate with your preferred LLM."
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)
