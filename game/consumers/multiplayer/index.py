from channels.generic.websocket import AsyncWebsocketConsumer
import json

# 处理wss连接的class
class MultiPlayer(AsyncWebsocketConsumer):

    # 第一个函数：连接
    async def connect(self):
        # 前端执行this.ws = new WebSocket("wss://app5894.acapp.acwing.com.cn/wss/multiplayer/");
        # 调用以下函数，会成功创建连接
        await self.accept() 
        print('accept') # 输出accept

        self.room_name = "room"
        await self.channel_layer.group_add(self.room_name, self.channel_name)
    
    # 第二个函数：断开连接
    # 当前端断开连接（刷新/自行close）时，就会调用以下函数
    # 但在django channel中，用户连接断开时不一定执行以下函数（虽然大概率会执行以下函数）
    # 因此在维护在线人数/用户的连接状态时，使用此函数是不可靠的
    # 可能用户离线了，但没有执行以下函数
    # 用户离线但不会执行以下函数的特殊情况：用户电脑断电，无法发送请求，也就无法执行以下函数
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    # 第三个函数：receive
    # 用于接收前端向后端发送的请求
    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)