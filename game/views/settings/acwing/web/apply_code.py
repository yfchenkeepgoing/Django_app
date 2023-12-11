# 本函数的作用：web端向acwing端发送授权登录的请求，并上报了appid等相关信息，返回参数为授权码code和state，返回到receive_code.py中
from django.http import JsonResponse
# 用于封装链接的函数
from urllib.parse import quote
# randint可以返回一个区间内的随机值
from random import randint
# redis用于存储state
from django.core.cache import cache

# 返回一个长度为8位的随机数
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9)) # 返回一个0-9之内的随机数，加入字符串中
    return res


def apply_code(request):
    # 参数appid
    appid = "5894" # 写成字符串的形式，不要写成数字

    # 参数redirect_uri：重新编码url，将其中的特殊字符转换为一般字符，避免后续处理url时特殊字符导致的报错
    # quote内部的url是接收授权码code的链接
    redirect_uri = quote("https://app5894.acapp.acwing.com.cn/settings/acwing/web/receive_code/")

    # 参数scope
    scope = "userinfo"

    # 参数 state，设为一个8位的随机值
    state = get_state()

    # state在传给acwing前需要先存下来
    # 未来从acwing接收到state，就去redis中查找改state是否存在
    # 存在则说明code来自acwing服务器，否则说明code来自陌生人的攻击
    cache.set(state, True, 7200) # 值随便设置，可以设置为true，有效期2小时：7200秒

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })