from django.http import JsonResponse # 返回JsonResponse，变量类型为字典
from game.models.player.player import Player # 导入数据库（class Player）

# 暂时不判断当前用户是否登录，直接返回第一名玩家的信息

# 前端为acpp时处理请求的函数
def getinfo_acapp(request):
    # 每次从数据库中取出第一名玩家的信息
    player = Player.objects.all()[0]

    # 返回信息
    return JsonResponse({
        'result': "success", # 返回查询结果，成功则返回success，失败则返回理由
        'username': player.user.username,
        'photo': player.photo,
    })

# 前端为web时处理请求的函数
def getinfo_web(request):
    # 获取当前请求的客户，具体为什么这样写参考笔记
    user = request.user 

    # 判断用户是否登录的内置函数
    # 若未登录，则返回未登录字样
    if not user.is_authenticated: 
        return JsonResponse({
            'result': "未登录",
        })
    else: 
        # 每次从数据库中取出第一名玩家的信息
        player = Player.objects.all()[0]

        # 返回信息
        return JsonResponse({
            'result': "success", # 返回查询结果，成功则返回success，失败则返回理由
            'username': player.user.username,
            'photo': player.photo,
        })

# 定义处理请求的函数
def getinfo(request):
    # 判断从哪个前端发送而来，传入参数platform，这个参数需要我们在前端自定义
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
    

        
