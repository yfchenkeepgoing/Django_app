from django.urls import path, include # 新添加include
from  game.views.index import index # 将views中的总函数直接import进来

urlpatterns = [
    path("", index, name="index"), # 对应上面的第二个import，由于是总函数，因此不需要路径，取名为index（全局的index）
    # 如果上面的path中加了路径，则访问游戏页面输入网址时也要相应地加上路径
    # include中的路径从game文件夹开始写，注意是index而不是index.py，后面的也是类似去写
    path("menu/", include("game.urls.menu.index")),   
    path("playground/", include("game.urls.playground.index")),
    path("settings/", include("game.urls.settings.index")),
]