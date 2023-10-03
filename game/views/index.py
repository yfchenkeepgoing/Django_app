# 需要渲染一个文件，django中有一个api
from django.shortcuts import render # render函数用于在服务器端渲染一个html文件
# 渲染的意思：就是将html文件的内容生成好（即拼接字符串）

def index(request): # 每个函数会传一个request信息，目前不用这个函数
    return render(request, "multiends/web.html") # render函数两个参数，一个是request，另一个是web.html的路径，路径从templates文件夹后面开始写
    
