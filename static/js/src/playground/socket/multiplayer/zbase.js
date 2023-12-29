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
}