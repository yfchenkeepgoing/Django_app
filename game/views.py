from django.http import HttpResponse

def index(request): # 每个从前端过来的页面都会有一个request，其中会存储很多前端页面信息
    line1 = '<h1 style="text-align: center">Warlock Brawl</h1>' # <h1>大标题, style="text-al": 居中
    line4 = '<a href="/play/">start game</a>'
    line3 = '<hr>'
    line2 = '<img src="https://wallpapercave.com/dwp2x/wp2994373.jpg", width=1700>' # 插入一张图片
    return HttpResponse(line1 + line4 + line3 + line2)

# 增加一个游戏界面，就需要增加一个与路由对应的函数
def play(request):
    line1 = '<h1 style="text-align: center">game interface</h1>'
    line3 = '<a href="/">return to main menu</a>'
    line2 = '<img src="https://wallpapercave.com/dwp2x/wp2994356.jpg", width=1700>' # 插入一张图片
    return HttpResponse(line1 + line3 + line2)







