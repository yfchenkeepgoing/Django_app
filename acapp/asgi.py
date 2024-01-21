"""
ASGI config for acapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

import django # 引入django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'acapp.settings')
django.setup() # 设置环境变量

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from game.routing import websocket_urlpatterns
from game.channelsmiddleware import JwtAuthMiddlewareStack # 引入中间件的class

from channels.layers import get_channel_layer # 一定要写在完成环境变量设置的语句之后
# 记录下channel_layer，可以帮助我们实现在channels外面调用channels内部函数的功能
# 即在match_system/src/main.py的进程中调用consumers/multiplayer/index.py的进程中的函数
channel_layer = get_channel_layer()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # 将自带的中间件换为刚刚实现的中间件channelsmiddleware.py
    # "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    "websocket": JwtAuthMiddlewareStack(URLRouter(websocket_urlpatterns))
})

