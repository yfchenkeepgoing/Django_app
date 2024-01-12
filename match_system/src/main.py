#! /usr/bin/env python3 

import glob
import sys
# sys.path.append('gen-py')
# sys.path.insert(0, glob.glob('../../lib/py/build/lib*')[0])
sys.path.insert(0, glob.glob('../../')[0]) # 目录改为acapp的家目录，只有做这样的修改后才能import django项目中的包

# from tutorial import Calculator
# from tutorial.ttypes import InvalidOperation, Operation
# from shared.ttypes import SharedStruct

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

# 导入match_server文件夹中的内容
from match_server.match_service import Match # 导入Match.py

from queue import Queue # python中自带的消息队列，这个队列是一个线程安全的队列（即同步队列，不会出现读写冲突）
# 其api可以参见python的官方文档, 本节课需要Queue.get_nowait()和Queue.put(item, block=True, timeout=None)

from time import sleep # 可以让进程休眠1s
from threading import Thread # 用于开线程的库

from acapp.asgi import channel_layer # 引入asgi.py中通过get channel layer得到的channel_layer，用于match server和web server间的通信
from asgiref.sync import async_to_sync # 将index.py中的多线程（async）变为单线程
from django.core.cache import cache # 将匹配成功的信息存储在redis中

queue = Queue() # 全局的消息队列

# 实现player类
class Player:
    # 构造函数
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0 # 等待时间, 随着等待时间的变长，玩家的匹配条件会降低


# 匹配池
class Pool:
    # 构造函数
    def __init__(self):
        self.players = []
    
    # 向匹配池中添加玩家的函数
    def add_player(self, player):
        self.players.append(player)
    
    # 检验是否匹配，暂不实现
    # 借鉴一下main.cpp，a, b为两个player
    def check_match(self, a, b):
        dt = abs(a.score - b.score) # 分数差
        a_max_dif = a.waiting_time * 50 # a容忍的分数差的阈值，每过一秒阈值增加50
        b_max_dif = b.waiting_time * 50 # 同理
        return dt <= a_max_dif and dt <= b_max_dif # 同时满足a和b的阈值
    
    # 匹配成功后，输出三个人的信息
    def match_success(self, ps):
        print("Match Success: %s %s %s" % (ps[0].username, ps[1].username, ps[2].username))
        # room_name取名为room-a.uuid-b.uuid-c.uuid
        # 这样取名的目的，查找a所在的room_name，只需要cache.keys('*a.uuid*')
        # 不这样做也可，但需要在redis中存一个映射，比较麻烦
        room_name = "room-%s-%s-%s" % (ps[0].uuid, ps[1].uuid, ps[2].uuid)
        players = [] # 未来需存入redis中的信息
        # 遍历匹配成功的玩家
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name) # group_add函数异步转同步
            # 存入redis中的信息
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                # 血条，方便下节课用于更新战绩
                # 战绩最好在服务端计算，因为在客户端计算容易让玩家作弊，因此需要在服务器端记录血条
                'hp': 100, # 血条初始化为100
            })
        cache.set(room_name, players, 3600)  # 信息存入redis, 有效时间：1小时
        
        # 将3名匹配在一起的玩家加入一个room后，就能向room内广播玩家的信息，以在3个窗口中创建另外两名玩家
        # 在三名玩家全部加入room之后，再广播
        # 实现匹配的进程直接调用web server中index.py中的进程，即实现了进程间的通信
        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                # 参数参照index.py中group_send函数的参数的用法
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )


    # 每匹配一次，等待时间+1
    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    # 匹配的函数
    def match(self):
        # 玩家数量大于等于3，则一直匹配
        while len(self.players) >= 3:
            # 用简单暴力的做法，匹配三名玩家需要写三重循环，时间复杂度过高，想贪心原则来简化时间复杂度
            # 尽可能将分数接近的匹配在一起，将玩家按照分数值排序后，将相邻的玩家匹配在一起即可。
            self.players = sorted(self.players, key = lambda p: p.score)
            flag = False # 表示三人是否匹配成功
            # 枚举长度为3的段，因此预留两个位置
            for i in range(len(self.players) - 2): 
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                # 判断三名玩家之间两两是否都满足要求
                if self.check_match(a, b) and self.check_match(a, c) and self.check_match(b, c):
                    self.match_success([a, b, c]) # 打印三人信息
                    self.players = self.players[:i] + self.players[i + 3:] # 删去这三个人（0 to i - 1 & i + 3 to end, delete i, i + 1, i + 2）
                    flag = True
                    break
            
            # 没有成功的对，则结束循环
            if not flag:
                break

        self.increase_waiting_time() # 分差的阈值增大


# 删去原有内容，实现add_player即可
class MatchHandler:
    # 5个参数，同match.thrift中的定义
    # 向队列中添加玩家的函数
    def add_player(self, score, uuid, username, photo, channel_name):
        print("Add Player: %s %d" % (username, score)) # 输出添加的玩家的用户名和分数，用于调试
        # 若请求进入时正在匹配过程中，则需要将请求缓存，这就需要消息队列
        # 之前在cpp中手写了消息队列，而python中自带消息队列
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player) # 将player加入到消息队列中
        return 0 # 一定要有返回值，否则会报错


# 从队列中获取元素的辅助函数，队列是多线程的队列，故需要判断队列中是否有元素，有则取出元素，无则返回空
def get_player_from_queue():
    # api参见：https://docs.python.org/zh-cn/3/library/queue.html
    # Queue.put_nowait(item): 有元素则返回该元素，没元素则报一个异常，因此可通过判断有无异常的方式来判断队列中有无元素
    try:
        return queue.get_nowait()
    except:
        return None


# 需要一个消费者，单开一个线程，做死循环不断吸收消息队列中的信息，将信息扔给匹配池
def worker():
    pool = Pool()
    # 死循环
    while True:
        player = get_player_from_queue() # 从队列中取出一个玩家
        # 有玩家则将其加入匹配池中，无玩家则将匹配池匹配一遍，然后休眠1秒
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # 单线程，效率较低，但在匹配系统中可用，因为匹配系统需要的计算量不大
    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    # 每来一个请求，就开一个新的线程来处理，并行度最高，效率也最高，但可能比较浪费资源
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)

    # 匹配池server，举例：先开10个线程，10并发处理请求，超过限制就阻塞，是上一种多线程模式的限制版本
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    Thread(target=worker, daemon=True).start() # daemon=true表示杀掉主线程后，此线程就会关闭, daemon=false反之

    print('Starting the server...')
    server.serve() # 开线程的函数需要在本句话之前执行，因为本句话是一个死循环，到此卡死
    print('done.')
