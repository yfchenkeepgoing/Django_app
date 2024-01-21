from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated # 注册不需要验证
from django.contrib.auth.models import User
from game.models.player.player import Player

# 将函数改造为class类型
# register没有重名，不需改名
class PlayerView(APIView):
    # 创建用户，创建一般用方法post
    def post(self, request):
        data = request.POST # get方法改为post方法
        # username存储在data的username中，没有则返回空, strip去掉用户名的前后空格
        username = data.get("username", "").strip()
        password = data.get("password", "").strip() # 和username同理
        password_confirm = data.get("password_confirm", "").strip() # 确认密码

        # 判断用户名或密码是否为空
        # 为空则给用户以下的提示，由js/src/settings/zbase.js中的error message负责显示出来
        if not username or not password:
            # 需要用restframwork自带的response, 而不能用json response
            return Response({ 
                'result': "用户名和密码不能为空"
            })

        # 若两次密码不同
        # 判断密码是否一致最后前端后端一起判断，但此处在后端判断了，再前端就不再判断了
        if password != password_confirm:
            return Response({
                'result': "两个密码不一致"
            })
        
        # 用户名已存在, filter用于查找数据库
        if User.objects.filter(username=username).exists():
            return Response({
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
        
        # 改用rest framework后，不再需要登录
        # # 创建完user和player后登录
        # login(request, user)

        # 需要用restframwork自带的response, 而不能用json response
        return Response({
            'result': "success"
        })

