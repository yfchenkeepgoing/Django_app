# 返回JsonResponse，变量类型为字典，返回到js/src/settings/zbase.js中的resp中
from django.http import JsonResponse 
from django.contrib.auth import login # 引入用于登入的函数
from django.contrib.auth.models import User # 注册，需要User
# 不仅需要django内置的User，还需要我们根据User定义的Player
# 同时创建一个User和Player
from game.models.player.player import Player 

# register没有重名，不需改名
def register(request):
    data = request.GET
    # username存储在data的username中，没有则返回空, strip去掉用户名的前后空格
    username = data.get("username", "").strip()
    password = data.get("password", "").strip() # 和username同理
    password_confirm = data.get("password_confirm", "").strip() # 确认密码

    # 判断用户名或密码是否为空
    # 为空则给用户以下的提示，由js/src/settings/zbase.js中的error message负责显示出来
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })

    # 若两次密码不同
    # 判断密码是否一致最后前端后端一起判断，但此处在后端判断了，再前端就不再判断了
    if password != password_confirm:
        return JsonResponse({
            'result': "两个密码不一致"
        })
    
    # 用户名已存在, filter用于查找数据库
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })

    # 排除上述几种特殊情况，则用户名和密码可以被用于创建user
    user = User(username=username)
    # 设置密码，数据库中存下的密码是明文的哈希值
    user.set_password(password)
    user.save() # 保存用户名和密码，完成用户名和密码的创建

    # 创建完user, 还需创建player，默认头像：神代利世
    # django数据库创建的标准写法
    Player.objects.create(user=user, photo="https://bkimg.cdn.bcebos.com/pic/5366d0160924ab1846bed2653dfae6cd7b890b33?x-bce-process=image/resize,m_lfit,w_536,limit_1/quality,Q_70")
    
    # 创建完user和player后登录
    login(request, user)
    return JsonResponse({
        'result': "success"
    })

