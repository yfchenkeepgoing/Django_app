# 本函数的作用：receive完code后要重定向到web端的根目录下
from django.shortcuts import redirect
# 引入redis
from django.core.cache import cache
# 请求链接的库
import requests
# 取来存储于数据库中的所有用户的信息，避免重复存储用户信息
from django.contrib.auth.models import User
from game.models.player.player import Player
# acapp中的用户不需要登录
# from django.contrib.auth import login
# 随机数
from random import randint
# JsonResponse
from django.http import JsonResponse

def receive_code(request):
    data = request.GET

    # 用户拒绝授权则会返回:
    # {
    #     errcode: "40010"
    #     errmsg: "user reject"
    # }

    # 出现errcode，则返回请求失败，并将errcode和errmsg传到前端
    if "errcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })

    code = data.get('code')
    state = data.get('state')
    # print(code, state) # 输出code和state，用于调试
    # 重定向到urls/index.py中的第一条路由：path("", index, name="index"), 是urls的根目录
    # 这里的index就是name，因此name有一定用处，若无name则需要写完整的url链接

    # 判断授权码是否存在
    # 若授权码对应的state不在redis中，则说明该授权码是来自其他服务器的攻击，则pass掉该授权码，返回根目录
    # 若用户进入请求授权页面但两个小时都没有进行授权，则code也会过期，但此种情况极其罕见
    if not cache.has_key(state):
        # return redirect("index")
        # acapp中不存在重定向到根目录，但需要将JsonResponse传递给callback函数
        return JsonResponse({
            'result': "state not exist"
        })
    
    # 若授权码存在，则删除掉该授权码对应的state（取消暗号）
    cache.delete(state)

    # 下一步，通过授权码申请授权令牌access token
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"

    # 参数列表：三个参数-appid, secret, code
    params = {
        'appid': "5894", # 即AppID
        'secret': "9a9f431f86d74e96a6d514cdc2aa1998", # 即AppSecret，可以重置，防止被窃取
        'code': code # 刚刚拿到的code
    }

    # 通过上述链接获取返回结果
    # 返回结果为json形式的字典
    access_token_res = requests.get(apply_access_token_url, params=params).json()

    # print(access_token_res) # 调试用，在后台打印出access_token_res的具体内容

    # 从返回结果中取出access_token和openid
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    # 当一个元素可能存在也可能不存在时，用filter来查找数据库，只需要判断其返回的列表是否为空
    # 由于openid是唯一的，因此返回的列表长度为1，其中只有一个元素
    players = Player.objects.filter(openid=openid)
    # 若该用户已存在，则无需重新获取信息，直接登录即可
    if players.exists(): 
        # acapp中无需login, acapp端的用户每次打开都需要重新登录，不会保留其登录状态，这样更安全
        # login(request, players[0].user) # login函数的统一用法
        # return redirect("index") # 重定向到主页
        # 直接返回用户的用户名和头像
        player = players[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username, # 注意此处，别写成player.username
            'photo': player.photo,
        })
    
    # 若用户不存在，则需要通过授权令牌和openid申请用户信息
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }

    # 返回userinfo，包括username和photo
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    # 根据用户信息完成注册
    # 游戏的用户名不可重复，但acwing的用户名可能和直接通过网站注册的用户名是重复的
    # 解决方法：出现重名时直接在后来的名字末尾加上一位随机数，若再重复则再加一位随机数，以此类推
    while User.objects.filter(username=username).exists(): # 找到一个新用户名
        username += str(randint(0, 9))
    
    # 创建新用户
    user = User.objects.create(username=username)
    # 在用户的基础上创建玩家, create完后会自动保存到数据库中
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    # 根据新创建的用户信息登录
    # login(request, user)

    # 重定向到主页, acapp中不需要
    # return redirect("index") 

    # 直接返回用户的用户名和头像
    return JsonResponse({
        'result': "success",
        'username': player.user.username, # 注意此处，别写成player.username
        'photo': player.photo,
    })


