from django.urls import path, include

# 引用getinfo函数（定义于views/settings/getinfo.py）
from game.views.settings.getinfo import InfoView

# 引用login.py中的signin函数
# from game.views.settings.login import signin

# 引用logout.py中的signout函数
# from game.views.settings.logout import signout

# 引用register.py种的register函数
from game.views.settings.register import register

# 引入用于获取令牌和刷新令牌的包
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='settings_token'), # 获取令牌的api，access和refresh令牌同时获取
    path('token/refresh/', TokenRefreshView.as_view(), name='settings_token_refresh'), # 刷新令牌的api, as_view会将class写法变为函数写法
    path("getinfo/", InfoView.as_view(), name="settings_getinfo"), # getinfo函数的路由, as_view会将class写法变为函数写法
    # path("login/", signin, name="settings_login"), # signin函数的路由
    # path("logout/", signout, name="settings_logout"), # signout函数的路由
    path("register/", register, name="settings_register"), # register函数的路由
    path("acwing/", include("game.urls.settings.acwing.index")), # 引用acwing/index.py
]
