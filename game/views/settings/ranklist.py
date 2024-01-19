# 引用直接复制自getinfo.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated # 假设需要做验证
from game.models.player.player import Player

# 本类继承自APIView
class RanklistView(APIView):
    # permission_classes = ([IsAuthenticated]) # 用于验证，需要我们进行授权

    # 按照数据库里的score返回排名前十的玩家
    def get(self, request):
        # user = request.user # 从request中获取访问排行榜的用户是谁

        # score从小到大排，-score从大到小排
        players = Player.objects.all().order_by('-score')[:10]
        resp = []
        for player in players:
            resp.append({
                'username': player.user.username,
                'photo': player.photo,
                'score': player.score,
            })
        return Response(resp)