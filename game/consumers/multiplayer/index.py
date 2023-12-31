from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings # 引用settings.py中的变量（ROOM_CAPCITY）
from django.core.cache import cache # 用redis存每局对战的信息

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
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    # async：异步函数
    async def create_player(self, data):
        self.room_name = None # 初始时room_name定义为空

        start = 0
        # if data['username'] != "cyflyingflat843":
        #     start = 100000

        # 暂定服务器有1000个房间，暴力枚举这1000个房间，超出1000个房间则报错
        for i in range(start, 100000000):
            name = "room-%d" % (i) # room的名字，从room-0到room-999
            # 若房间名不存在，或房间中人数少于上限，则该房间名可用
            # len(cache.get(name)):获取与 name 键关联的值的长度
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPCITY:
                self.room_name = name
                break
        
        # 若没有有空位的房间，则直接返回，不要建立连接，不要accept加入的新player
        # 若有有空位的房间，则accept加入新player的请求
        if not self.room_name:
            return

        # 没有该房间，则创建房间
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) # 值为空链表，每局对战的有效期为3600s，即一小时

        # 为了向新创建的player所在的窗口发送所有已有玩家的信息，需先遍历所有已有玩家
        # dumps：将一个字典变为字符串, 字典中包含uuid, username, photo
        # uuid用于表示从哪个窗口发来的
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)

        # 找到当前的对局中的所有玩家
        players = cache.get(self.room_name)
        # 将新加入的玩家加入到当前对局的玩家列表中
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        # 将更新后的玩家列表重新加入到redis中
        cache.set(self.room_name, players, 3600) # 有效期1小时

        # 将更新后的信息群发给组（group/room）内的所有人
        await self.channel_layer.group_send(
            self.room_name, # 第一个参数：group的名字，一个room即为一个group
            # 第二个参数：需要发送的信息
            {
                # type关键字非常重要，相当于把以下信息发送给名为group_send_event的函数
                'type': "group_send_event", 
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )
    
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
    
    # 将更新后的信息群发后，需要一个函数来接收这些信息
    # 接收函数的名字就是type的关键字
    # 函数接收到信息后，直接将信息发送给前端
    # async def group_create_player(self, data):
    #     await self.send(text_data=json.dumps(data))

    # 由于所有需要广播的函数形态相同，所以把所有事件的群发函数写成一个即可
    async def group_send_event(self, data):
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
