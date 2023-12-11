# 本函数的作用：receive完code后要重定向到web端的根目录下
from django.shortcuts import redirect

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')
    print(code, state) # 输出code和state，用于调试
    # 重定向到urls/index.py中的第一条路由：path("", index, name="index"), 是urls的根目录
    # 这里的index就是name，因此name有一定用处，若无name则需要写完整的url链接
    return redirect("index") 


