# 本函数的作用：receive完code后要重定向到web端的根目录下
from django.shortcuts import redirect
# 引入redis
from django.core.cache import cache
# 请求链接的库
import requests
# 取来存储于数据库中的所有用户的信息，避免重复存储用户信息
from django.contrib.auth.models import User
from game.models.player.player import Player
# 用户需要登录
from django.contrib.auth import login
# 随机数
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')
    # print(code, state) # 输出code和state，用于调试
    # 重定向到urls/index.py中的第一条路由：path("", index, name="index"), 是urls的根目录
    # 这里的index就是name，因此name有一定用处，若无name则需要写完整的url链接

    # 判断授权码是否存在
    # 若授权码对应的state不在redis中，则说明该授权码是来自其他服务器的攻击，则pass掉该授权码，返回根目录
    # 若用户进入请求授权页面但两个小时都没有进行授权，则code也会过期，但此种情况极其罕见
    if not cache.has_key(state):
        return redirect("index")
    
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

    players = Player.objects.filter(openid=openid)
    # 若该用户已存在，则无需重新获取信息，直接登录即可
    if players.exists(): 
        login(request, players[0].user) # login函数的统一用法
        return redirect("index") # 重定向到主页
    
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
    login(request, user)

    # 重定向到主页
    return redirect("index") 

def receive_code_github(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')
    # print(code, state) # 调试用

    if not cache.has_key(state):
        return redirect("index")
    
    cache.delete(state)

    # 下一步，通过授权码申请授权令牌access token
    apply_access_token_url = "https://github.com/login/oauth/access_token"

    # 参数列表：三个参数: client_id, client_secret, code
    params = {
        'client_id': "e89272f068bdd76fac67", # 即client_id，可在github oauth app设置界面中查到
        'client_secret': "3130697584702eaba00a64ad6c0970a3fbf61265", # 即client_secret，可在github oauth app设置界面中查到
        'code': code # 刚刚拿到的code，来自apply_code_github函数
    }

    # 在请求头中添加以下内容，否则会报错
    headers = {
        'Accept': 'application/json'
    }

    access_token_res = requests.post(apply_access_token_url, params=params, headers=headers).json()

    access_token = access_token_res['access_token']

    # print(tokenResponse.json()) # 调试用

    get_userinfo_url = 'https://api.github.com/user'

    # 准备认证头部，包含我们的access token
    headers = {
        'Authorization': f'token {access_token}',
        'Accept': 'application/vnd.github.v3+json',  # 使用GitHub API version 3，一个广泛使用而稳定的版本
    }

    # 发送请求
    userinfo_res = requests.get(get_userinfo_url, headers=headers).json()

    # 提取所需的信息, 这里的userid相当于acwing一键登录中的openid，是用户的唯一标识
    # openid取自access_token_res，但userid取自userinfo_res
    userid = userinfo_res['id']
    username = userinfo_res['name']
    photo = userinfo_res['avatar_url']

    players = Player.objects.filter(openid=userid)
    # 若该用户已存在，则无需重新获取信息，直接登录即可
    if players.exists(): 
        login(request, players[0].user) # login函数的统一用法
        return redirect("index") # 重定向到主页

    # 根据用户信息完成注册
    # 游戏的用户名不可重复，但acwing的用户名可能和直接通过网站注册的用户名是重复的
    # 解决方法：出现重名时直接在后来的名字末尾加上一位随机数，若再重复则再加一位随机数，以此类推
    while User.objects.filter(username=username).exists(): # 找到一个新用户名
        username += str(randint(0, 9))
    
    # 创建新用户
    user = User.objects.create(username=username)
    # 在用户的基础上创建玩家, create完后会自动保存到数据库中
    player = Player.objects.create(user=user, photo=photo, openid=userid)

    # 根据新创建的用户信息登录
    login(request, user)

    return redirect("index")


