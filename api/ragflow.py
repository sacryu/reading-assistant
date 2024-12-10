import json
import os
import re
from uuid import uuid4

import requests
from dotenv import load_dotenv
from loguru import logger

# List datasets
# url = "/api/v1/datasets?page={page}&page_size={page_size}&orderby={orderby}&desc={desc}&name={dataset_name}&id={dataset_id}"

# List documents
# url = "/api/v1/datasets/{dataset_id}/documents?page={page}&page_size={page_size}&orderby={orderby}&desc={desc}&keywords={keywords}&id={document_id}&name={document_name}"

# 召回：Retrieve chunks
# url = "/api/v1/retrieval"

# List chat assistants
# url = "/api/v1/chats?page={page}&page_size={page_size}&orderby={orderby}&desc={desc}&name={chat_name}&id={chat_id}"

# Create session with chat assistant
# url = "/api/v1/chats/{chat_id}/sessions"

# Converse with chat assistant
# url = "/api/v1/chats/{chat_id}/completions"


load_dotenv()

api_key = os.getenv("RAGFLOW_API_KEY")
base_url = os.getenv("RAGFLOW_BASE_URL")


def list_datasets(
    page=1,
    page_size=10,
    orderby="create_time",
    desc="true",
    dataset_name=None,
    dataset_id=None,
):
    url = f"{base_url}/api/v1/datasets?page={page}&page_size={page_size}&orderby={orderby}&desc={desc}"
    if dataset_name:
        url += f"&name={dataset_name}"
    if dataset_id:
        url += f"&id={dataset_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    response = requests.get(url, headers=headers)
    return response.json()


def list_documents(
    dataset_id,
    page=1,
    page_size=10,
    orderby="create_time",
    desc="true",
    keywords=None,
    document_id=None,
    document_name=None,
):
    url = f"{base_url}/api/v1/datasets/{dataset_id}/documents?page={page}&page_size={page_size}&orderby={orderby}&desc={desc}"
    if keywords:
        url += f"&keywords={keywords}"
    if document_id:
        url += f"&id={document_id}"
    if document_name:
        url += f"&name={document_name}"
    headers = {"Authorization": f"Bearer {api_key}"}
    response = requests.get(url, headers=headers)
    return response.json()


def list_chat_assistants(
    page=1,
    page_size=30,
    orderby="create_time",
    desc="true",
    chat_name=None,
    chat_id=None,
):
    url = f"{base_url}/api/v1/chats?page={page}&page_size={page_size}&orderby={orderby}&desc={desc}"
    if chat_name:
        url += f"&name={chat_name}"
    if chat_id:
        url += f"&id={chat_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    response = requests.get(url, headers=headers)
    return response.json()


def create_session_with_chat_assistant(chat_id):
    """
    {'code': 0, 'data': {'chat_id': '957af222b5ca11efb7770242ac1e0006', 'create_date': 'Mon, 09 Dec 2024 09:47:01 GMT', 'create_time': 1733708821305, 'id': '7be23122b5cf11ef929a0242ac1e0006', 'messages': [{'content': '你好！ 我是你的助理，有什么可以帮到你的吗？', 'role': 'assistant'}], 'name': '88e5df28-5f34-4544-8a1c-0a02dd0ef1b5', 'update_date': 'Mon, 09 Dec 2024 09:47:01 GMT', 'update_time': 1733708821305}}
    """
    session_name = str(uuid4())

    url = f"{base_url}/api/v1/chats/{chat_id}/sessions"
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {"name": session_name}
    response = requests.post(url, headers=headers, json=data)
    try:
        session_id = response.json()["data"]["id"]
        logger.info(f"Session created successfully with id: {session_id}")
        return session_id
    except Exception as e:
        print(e)
        return None


def converse_with_chat_assistant(chat_id, session_id, query):
    logger.info(f"Conversing with chat assistant for query: {query}")
    url = f"{base_url}/api/v1/chats/{chat_id}/completions"
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {"session_id": session_id, "question": query, "stream": True}
    response = requests.post(url, headers=headers, json=data, stream=True)

    previous_answer = ""
    for line in response.iter_lines():
        if not line:
            continue

        line = line.decode("utf-8")
        data = line.split("data:")[1]
        json_data = json.loads(data)

        if isinstance(json_data["data"], dict) and "answer" in json_data["data"]:
            current_answer = json_data["data"]["answer"].strip()
            # Remove ##number$$ patterns if present
            current_answer = re.sub(r" ##\d+\$\$", "", current_answer).strip()
            if len(current_answer) > len(previous_answer):
                delta = current_answer[len(previous_answer) :]
                previous_answer = current_answer
                yield delta
        elif json_data["data"] is True:
            break
        else:
            yield json_data["data"]


if __name__ == "__main__":
    # print(list_datasets())

    # dataset_id = "b5b99246b21e11ef9adf0242ac1e0006"
    # print(list_documents(dataset_id))

    # print(list_chat_assistants())

    # chat_assistant_id = "957af222b5ca11efb7770242ac1e0006"
    # print(create_session_with_chat_assistant(chat_assistant_id))

    converse_with_chat_assistant(
        "957af222b5ca11efb7770242ac1e0006",
        "7be23122b5cf11ef929a0242ac1e0006",
        "武汉达梦2024年主营业务收入为多少？",
    )
