from django.urls import path, include

# 引用getinfo函数（定义于views/settings/getinfo.py）
from game.views.settings.getinfo import getinfo

# 引用login.py中的signin函数
from game.views.settings.login import signin

# 引用logout.py中的signout函数
from game.views.settings.logout import signout

# 引用register.py种的register函数
from game.views.settings.register import register

urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo"), # getinfo函数的路由
    path("login/", signin, name="settings_login"), # signin函数的路由
    path("logout/", signout, name="settings_logout"), # signout函数的路由
    path("register/", register, name="settings_register"), # register函数的路由
    path("acwing/", include("game.urls.settings.acwing.index")), # 引用acwing/index.py
]
