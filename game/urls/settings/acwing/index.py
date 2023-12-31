from django.urls import path
# 为避免acapp和web中的同名函数出现重名，可以用as给它们起一个别名
from game.views.settings.acwing.web.apply_code import apply_code as web_apply_code
from game.views.settings.acwing.web.receive_code import receive_code as web_receive_code
from game.views.settings.acwing.acapp.apply_code import apply_code as acapp_apply_code
from game.views.settings.acwing.acapp.receive_code import receive_code as acapp_receive_code

from game.views.settings.acwing.web.apply_code import apply_code_github as web_apply_code_github
from game.views.settings.acwing.web.receive_code import receive_code_github as web_receive_code_github

urlpatterns = [
    path("web/apply_code/", web_apply_code, name="settings_acwing_web_apply_code"), # name可以没有，但习惯上要有
    path("web/receive_code/", web_receive_code, name="settings_acwing_web_receive_code"),
    path("acapp/apply_code/", acapp_apply_code, name="settings_acwing_acapp_apply_code"), 
    path("acapp/receive_code/", acapp_receive_code, name="settings_acwing_acapp_receive_code"),
    
    # 用于github一键登录的路由
    path("web/apply_code_github/", web_apply_code_github, name="settings_acwing_web_apply_code_github"),
    path("web/receive_code_github/", web_receive_code_github, name="settings_acwing_web_receive_code_github"),
]
