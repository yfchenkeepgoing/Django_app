from django.db import models # django中数据库的基类
from django.contrib.auth.models import User # User类

# 定义新数据表player，其中有关键字photo和user
# photo是头像，user表示和admin中的哪个用户是一一对应的
# Player需要继承自数据库的基类，每个数据库的class需要继承自models.Model这个类
class Player(models.Model):
    # Player这个数据表扩充自User，需要定义一个关联关系，每个player唯一对应一个User
    # 一一对应的类型OneToOneField，一一对应自User表
    # on_delete: 当user被删除时，如何处理Player数据
    # models.CASCADE表示当user被删除时，与其关联的player会被一并删掉：级联删除
    user = models.OneToOneField(User, on_delete = models.CASCADE)

    # 除去基础信息外，还需存储玩家的头像，类型是URL
    # 最大长度是256，可以为空
    photo = models.URLField(max_length = 256, blank = True) 

    # 用于显示每个player数据展示在admin页面中的名字
    def __str__(self):
        return str(self.user) # 直接返回用户的用户名
