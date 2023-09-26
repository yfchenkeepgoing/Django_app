from django.urls import path
from game.views import index, play

urlpatterns = [
    path("", index, name="index"),
    #path是解析的过程，此处什么也不解析
    path("play/", play, name="play")
]


