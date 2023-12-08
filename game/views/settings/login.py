# 验证用户是否登录成功，两个函数，第一个用于验证用户名和密码是否正确，第二个函数用于用户的实际登录
from django.contrib.auth import authenticate, login 
from django.http import JsonResponse # 返回JsonResponse，变量类型为字典

# 定义登录函数，注意不要和上面的login重名，因此改名为signin，这个函数还需要在urls和js中写
def signin(request):
    data = request.GET # 取出数据
    username = data.get('username')
    password = data.get('password')

    # 验证输入的用户名和密码是否正确，存储的是password的哈希值，因此输入密码哈希之后与存储的哈希值比较
    user = authenticate(username=username, password=password) 
    
    # 用户名或密码不正确
    if not user:
        return JsonResponse({
            'result': "用户名或密码不正确"
        })
    
    # 用户名和密码都正确时，用户登录
    # web中登陆时，是将登录信息直接存入cookie中
    # acapp中登录时，登录信息存储在内存中，退出登录则信息注销
    # acapp打开时，会自动登录，只需要用户每个月授权一次即可，相比浏览器登录更加流畅安全
    login(request, user)

    # 返回登录结果：成功 
    return JsonResponse({
        'result': "success"
    })




