from django.http import JsonResponse # 返回JsonResponse，变量类型为字典
from django.contrib.auth import logout # 引入用于登出的函数

# 为了不重名，函数改名为signout
def signout(request):
    user = request.user

    # 如果用户不在登录状态，说明已经登出，则返回成功
    if not user.is_authenticated:
        return JsonResponse({
            'result': "success", 
        })
    # 如果用户还在登录状态，则需要手动登出
    logout(request) # 本函数的作用是从request中将cookie删除
    
    # 返回成功
    return JsonResponse({
        'result': "success", 
    })




