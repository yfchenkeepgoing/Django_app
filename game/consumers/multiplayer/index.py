from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings # 引用settings.py中的变量（ROOM_CAPCITY）
from django.core.cache import cache # 用redis存每局对战的信息

# thrift client需要的头文件
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

# 引入thrift server(match server)
from match_system.src.match_server.match_service import Match

# 处理wss连接的class
class MultiPlayer(AsyncWebsocketConsumer):

    # 第一个函数：连接
    async def connect(self):
        # 前端执行this.ws = new WebSocket("wss://app5894.acapp.acwing.com.cn/wss/multiplayer/");
        # 调用以下函数，会成功创建连接
        await self.accept()
    
    # 第二个函数：断开连接
    # 当前端断开连接（刷新/自行close）时，就会调用以下函数
    # 但在django channel中，用户连接断开时不一定执行以下函数（虽然大概率会执行以下函数）
    # 因此在维护在线人数/用户的连接状态时，使用此函数是不可靠的
    # 可能用户离线了，但没有执行以下函数
    # 用户离线但不会执行以下函数的特殊情况：用户电脑断电，无法发送请求，也就无法执行以下函数
    async def disconnect(self, close_code):
        # 若room_name不为空，则断联后需要将该room从组里删去
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    # async：异步函数
    # 重写create_player函数，作为thrift client
    # 在新的玩家被创建之后，不立即返回当前对局中有谁，而是给thrfit server(匹配服务)发送请求
    # 匹配服务匹配成功后，将结果告诉thrift client，这个过程会有延时
    async def create_player(self, data):
        # 初始化room_name
        self.room_name = None
        self.uuid = data['uuid']

        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)

        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        # Connect!
        transport.open()

        # 调用main.py中的add_player函数(向队列中添加玩家)
        client.add_player(1500, data['uuid'], data['username'], data['photo'], self.channel_name) # 初始分数为1500

        # Close!
        transport.close()
    
    # 后端实现move_to函数，类似于上面的create_player函数
    async def move_to(self, data):
        # 群发信息即可，不需要操作redis
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'], # move_to函数的发出者的uuid
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )
    
    # 后端实现shoot_fireball函数，类似于上面的create_player函数和move_to函数
    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data['uuid'], # 发出fireball的player的uuid
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'], # fireball的uuid
            }
        )
    
    # 后端实现attack函数，类似于上面的create_player函数，move_to函数和shoot_fireball函数
    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            # 参数较多，参照multiplayer/zbase.js中的send_attack函数发送的参数
            {
                'type': "group_send_event",
                'event': "attack",
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )
    
    # 后端实现blink函数，类似于上面的move_to函数
    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'], 
            }
        )
    
    # 后端实现message函数
    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )
    
    # 将更新后的信息群发后，需要一个函数来接收这些信息
    # 接收函数的名字就是type的关键字
    # 函数接收到信息后，直接将信息发送给前端
    # async def group_create_player(self, data):
    #     await self.send(text_data=json.dumps(data))

    # 由于所有需要广播的函数形态相同，所以把所有事件的群发函数写成一个即可
    async def group_send_event(self, data):
        # 更新room_name
        if not self.room_name:
            keys = cache.keys('*%s*' % (self.uuid)) # 通过uuid找到room_name
            if keys: # 若其中有元素
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data))

    # 第三个函数：receive
    # 用于接收前端向后端发送的请求
    async def receive(self, text_data):
        data = json.loads(text_data)
        # print(data)
        event = data['event'] # 取出收到信息中的event
        
        # 当接收到的事件类型是create_player，则调用create_player函数
        if event == "create_player":
            await self.create_player(data)
        # 当接收到的事件类型是move_to，则调用move_to函数
        elif event == "move_to":
            await self.move_to(data)
        # 当接收到的事件类型是shoot_fireball，则调用shoot_fireball函数
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        # 当接收到的事件类型是attack，则调用attack函数
        elif event == "attack":
            await self.attack(data)
        # 当接收到的事件类型是blink，则调用blink函数
        elif event == "blink":
            await self.blink(data)
        # 当接收到的事件类型是message，则调用message函数
        elif event == "message":
            await self.message(data)
