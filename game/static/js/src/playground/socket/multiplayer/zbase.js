class MultiPlayerSocket {
    // 构造函数，传入参数playground，方便与地图中的其他元素产生关联
    constructor(playground) {
        this.playground = playground;

        // 建立wss的连接，连接地址为项目的域名，并将其中的https改为wss，在域名后面添加routing.py中的wss/multiplayer/
        // 注意若routing.py中以\结尾，则下面也需要以\结尾，ws协议的书写规范比http协议要求更为严格
        this.ws = new WebSocket("wss://app5894.acapp.acwing.com.cn/wss/multiplayer/");

        this.start(); // 调用start函数
    }

    start() {
        this.receive();
    }

    // 接收后端发送到前端的当前玩家的信息的函数
    receive() {
        let outer = this; 

        // 在前端接收wss协议的信息的api：onmessage
        this.ws.onmessage = function(e) {
            // 解析后端向前端传输的信息, 此处是将字符串变成字典（后端的index.py中是将字典变为字符串）
            let data = JSON.parse(e.data);
            // console.log(data); // 输出data，用于调试

            // 当前玩家本人并不需要接收到后端发送来的自己的消息，将这个消息pass掉即可
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            // 对后端发来的信息的event类型也进行判断，判断是否是create_player
            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo); // 调用本地处理create_player的函数
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                // data中的信息不包含uuid，因为uuid就是本player的uuid，不需要在data中传输
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty); // 路由
            }
        };
    }

    // 前端向后端发送create player的函数，前端作为发送者
    // 本函数是创建当前玩家的函数
    send_create_player(username, photo) {
        let outer = this;

        // 将json封装为字符串，api是JSON.stringify
        this.ws.send(JSON.stringify({
            // 'message': "hello acapp server", // 调试用
            // 当前向服务器传递的信息
            'event': "create_player",
            // 此uuid是由playground/zbase.js中的this.mps.uuid = this.players[0].uuid赋值的
            // 因为mps就是class MultiPlayerSocket的对象
            'uuid': outer.uuid, 
            'username': username,
            'photo': photo,
        }));
    }

    // 实现get_player函数：通过uuid找到对应的player
    // 暴力遍历所有的player即可
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ ) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }

        // 找不到玩家则返回空
        return null;
    }

    // 根据后端发送来的新加入玩家的信息，在其他玩家的前端创建出该玩家的函数
    receive_create_player(uuid, username, photo) {
        // 参考player/zbase.js
        // constructor(playground, x, y, radius, color, speed, character, username, photo)
        // 新建的玩家放在playground的中心，x, y坐标使用相对位置
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale, 
            0.5,
            0.05,
            "white", // 颜色随便，后续会被图片覆盖掉
            0.15,
            "enemy", // 新建的玩家为敌人
            username,
            photo,
        );

        player.uuid = uuid; // 每个对象的uuid要等于创建它窗口的uuid
        this.playground.players.push(player); // 将该player加入到playground中
    }

    // 同步move_to函数
    // 将move_to函数从前端发送给服务器端，仿照send_create_player
    send_move_to(tx, ty) {
        let outer = this;

        // 将json封装为字符串，api是JSON.stringify
        this.ws.send(JSON.stringify({
            'event': "move_to",
            // 此uuid是由playground/zbase.js中的this.mps.uuid = this.players[0].uuid赋值的
            // 因为mps就是class MultiPlayerSocket的对象
            'uuid': outer.uuid, // 本uuid来自发出move_to指令的人
            'tx': tx, // 目的地的横坐标
            'ty': ty, // 目的地的纵坐标
        }));
    }

    // 从服务器端接收其他窗口的move_to函数信息的函数，仿照receive_create_player
    // 参数uuid来自move_to函数的发出者
    receive_move_to(uuid, tx, ty) {
        // 通过uuid找到命令的发出者
        let player = this.get_player(uuid); // move_to函数的uuid来自其发出者的uuid，这在send_move_to函数中有体现

        // 玩家存在，再去调用其move_to函数，防止玩家下线还调用了move_to函数
        if (player) {
            player.move_to(tx, ty); // move_to函数的发出者在本窗口中同步移动
        }
    }

    // 同步shoot fireball
    // 将shoot fireball函数从前端发送给服务器端，仿照send_create_player
    send_shoot_fireball(tx, ty, ball_uuid) { // tx, ty：子弹发射的目标地点, 接下来是子弹的uuid（因为需要在所有窗口中将子弹同步）
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid, // 发射者的uuid
            'tx': tx, // 目的地的横坐标
            'ty': ty, // 目的地的纵坐标
            'ball_uuid': ball_uuid, // 子弹的uuid
        }));
    }

    // 从服务器端接收其他窗口的shoot fireball函数信息的函数，仿照receive_create_player
    // uuid: 发射者的uuid, ball_uuid: 子弹的uuid
    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        // 通过uuid找到发射者的uuid
        let player = this.get_player(uuid); 

        // 玩家存在，再去调用其shoot_fireball函数，防止玩家已经阵亡
        // 同时存储该名玩家创建的fireball
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid; // 所有窗口的火球的uuid需要统一
        }
    }

    // 同步attack函数
    // 模仿send_create_player & send_move_to & send_shoot_fireball
    // 传输信息：攻击者击中被攻击者, 故需要传输attacker和attackee的uuid
    // 所有同步过程都没有同步坐标，因此随着时间的推移，每名玩家的坐标可能发生变化，因为存在误差（来自三角函数的计算和浮点数的计算）和网络延迟
    // 击中其他player时，需要算角度，这个角度的误差可能越来越大
    // 做补偿：attacker击中attackee时，在所有窗口中将attackee的位置同步
    // 即我击中了你，你在所有窗口中的位置由我说了算
    // 因此传入的参数还有attackee在attacker窗口中的位置，角度，以及伤害值
    // 还需同步fireball，因为该炮弹已经击中了别人，在其他窗口中需要删掉（否则其他窗口中的该fireball就是一段动画，不会消失）
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid, // attacker的uuid
            'attackee_uuid': attackee_uuid, // attackee的uuid
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    // 模仿receive_create_player & receive_move_to & receive_shoot_fireball
    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid); // 通过uuid找到攻击者
        let attackee = this.get_player(attackee_uuid); // 通过uuid找到被攻击者

        // 若攻击者和被攻击者都还活着，就处理攻击
        if (attacker && attackee) {
            // 调用player/zbase.js中实现的接受并处理自己被攻击的信息的函数
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    // 同步blink（闪现）函数
    // 模仿send_move_to
    send_blink(tx, ty) {
        let outer = this;

        this.ws.send(JSON.stringify(
            {
                'event': "blink",
                'uuid': outer.uuid,
                'tx': tx,
                'ty': ty,
            }));
    }

    // 模仿receive_move_to函数
    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);

        // 若player还存在
        if (player) {
            player.blink(tx, ty);
        }
    }
}