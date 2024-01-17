# 需要渲染一个文件，django中有一个api
from django.shortcuts import render # render函数用于在服务器端渲染一个html文件
# 渲染的意思：就是将html文件的内容生成好（即拼接字符串）

def index(request): # 每个函数会传一个request信息，目前不用这个函数
    # 从data中获取两个参数，data来自web/receive_code.py的return redirect(reverse("index") + "?access=%s&refresh=%s" % (str(refresh.access_token), str(refresh))) 
    # 是用get方法传过来的，因此这里也用get方法来接收
    data = request.GET
    print(data)
    context = {
        'access': data.get("access", ""), # 取出access参数，没有则为空
        'refresh': data.get("refresh", ""), # 取出refresh参数，没有则为空
    }
    return render(request, "multiends/web.html", context) # render函数两个参数，一个是request，另一个是web.html的路径，路径从templates文件夹后面开始写
    
