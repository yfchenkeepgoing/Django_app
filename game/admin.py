from django.contrib import admin

# 让自定义的数据表出现在admin界面中，需要在此处注册之
from game.models.player.player import Player

# Register your models here.
admin.site.register(Player) # 讲自定义的数据表player注册到admin中

