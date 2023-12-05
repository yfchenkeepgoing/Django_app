from django.urls import path 

# 引用getinfo函数（定义于views/settings/getinfo.py）
from game.views.settings.getinfo import getinfo

urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo"), # 写一个路径
]
