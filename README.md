## Game based on Django framework, developed by yifanChen
### Website
https://app5894.acapp.acwing.com.cn/
### Gameplay
1. Right-click to move
2. Left-click plus 'Q' for the skill: Fireball, with a cooldown of 3 seconds
3. Left-click plus 'F' for the skill: Flash, with a cooldown of 5 seconds
4. In multiplayer mode, the winning player gains 10 points, and the losing player loses 5 points
### Technology Stack
1. Frontend: jQuery
2. Backend: Django
3. Database: SQLite, Redis
3. Network Protocols: HTTPS, WSS
4. RPC: Thrift
5. Authorization Protocol: OAuth
6. Authentication: JWT
### Features
1. Complete menu interface and game interface
2. Frontend and backend separation, with ACApp and Web versions on the frontend
3. Deployed with Nginx to interface with the ACApp
4. Comprehensive account system, username and password login, and one-click login with AcWing & GitHub OAuth
5. Online multiplayer and chat system implemented via WSS protocol
6. Matchmaking system implemented through Thrift service
7. Cross-origin issues resolved through Rest Framework and JWT authentication, achieving complete frontend-backend separation
8. The ranking board displays the top ten players ranked by score
