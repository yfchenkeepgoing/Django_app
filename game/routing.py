from django.urls import path

from game.consumers.multiplayer.index import MultiPlayer

# 路由的写法类似http协议，也是path
websocket_urlpatterns = [
    # class MultiPlayer要变成一个函数的形式，因此有：MultiPlayer.as_asgi()
    path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss_multiplayer"),
]