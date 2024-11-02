from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
# import requests
from fastapi import HTTPException
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import logging
import sys
import os
from urllib.parse import urljoin
import urllib.parse

app = FastAPI()

# 正常情况日志级别使用 INFO，需要定位时可以修改为 DEBUG，此时 SDK 会打印和服务端的通信信息
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

# 1. 设置用户属性, 包括 secret_id, secret_key, region 等。Appid 已在 CosConfig 中移除，请在参数 Bucket 中带上 Appid。Bucket 由 BucketName-Appid 组成
secret_id = os.getenv('COS_SECRET_ID', 'your own')     # 用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参见 https://cloud.tencent.com/document/product/598/37140
secret_key = os.getenv('COS_SECRET_KEY', 'your own')   # 用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参见 https://cloud.tencent.com/document/product/598/37140
region = None              # 通过自定义域名初始化不需要配置 region
token = None               # 如果使用永久密钥不需要填入 token，如果使用临时密钥需要填入，临时密钥生成和使用指引参见 https://cloud.tencent.com/document/product/436/14048
scheme = 'http'           # 指定使用 http/https 协议来访问 COS，默认为 https，可不填

domain = 'your own url' # 用户自定义域名，需要先开启桶的自定义域名，具体请参见 https://cloud.tencent.com/document/product/436/36638
config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key, Token=token, Domain=domain, Scheme=scheme)
client = CosS3Client(config)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = []

def list_files():
    """List all files in the specified Google Cloud Storage bucket."""
    bucket = client.list_objects(
        Bucket='sound-1304995045',
        Prefix='SOUND_EFFECTS_PACK'
    )
    return [blob['Key'] for blob in bucket['Contents']]
    # return ['a','ab', 'cc']

def best_match(query: str, filenames: list) -> str:
    """Return the best match for the query from the list of filenames."""
    query = query.lower()
    best_filename = None
    best_score = float('inf')  # Initialize with infinity for comparison

    for filename in filenames:
        # Basic matching score based on length difference
        score = abs(len(filename) - len(query))
        if query in filename.lower() and score < best_score:
            best_score = score
            best_filename = filename

    return best_filename


def search_sound(query):
    filenames = list_files()
    if not filenames:
        return None
    
    match = best_match(query, filenames)
    if not match:
        return None
    
    file_url = urllib.parse.quote(urljoin(f'http://{domain}/', match), safe=':/')
    # print(file_url)
    return file_url


def search_drop_sound():
    file_url = urllib.parse.quote(urljoin(f'http://{domain}/', 'metal-pipe-fall-227522.mp3'), safe=':/')
    return file_url

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            username = message_data.get('username', 'Anonymous')
            message = message_data.get('message')

            # Prepare the message to broadcast
            if message.lower() == 'drop':
                sound_url = search_drop_sound()
                broadcast_data = {
                    'type': 'drop',
                    'username': username,
                    'message': message,
                    'sound_url': sound_url,
                }
            else:
                sound_url = search_sound(message)
                if sound_url:
                    broadcast_data = {
                        'type': 'meme',
                        'username': username,
                        'message': message,
                        'sound_url': sound_url
                    }
                else:
                    # If sound not found, treat as a chat message
                    broadcast_data = {
                        'type': 'chat',
                        'username': username,
                        'message': f"Couldn't find sound for '{message}'."
                    }

            # Broadcast to all connected clients
            for client in connected_clients:
                await client.send_text(json.dumps(broadcast_data))

    except WebSocketDisconnect:
        connected_clients.remove(websocket)
    except Exception as e:
        print(f"Error: {e}")

@app.get("/api/sound-files")
async def get_sound_files():
    """Retrieve the list of sound files from the bucket."""
    try:
        files = list_files()
        return {"sound_files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# For local testing, you can run this:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
    # uvicorn.run(app, host="10.11.203.91", port=8000)