from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated # 假设需要做验证
from game.models.player.player import Player

# 本类继承自APIView
class InfoView(APIView):
    permission_classes = ([IsAuthenticated])

    # 从服务器端获取当前用户的信息，用get函数
    # 类中的成员函数第一个参数都是self，即类自己
    def get(self, request):
        user = request.user
        player = Player.objects.get(user=user)
        return Response({
            'result': "success",
            'username': user.username,
            'photo': player.photo,
        })
