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

    }

    // 前端向后端发送create player的函数，前端作为发送者
    send_create_player() {
        let outer = this;

        // 将json封装为字符串，api是JSON.stringify
        this.ws.send(JSON.stringify({
            // 'message': "hello acapp server", // 调试用
            // 当前向服务器传递的信息
            'event': "create player",
            // 此uuid是由playground/zbase.js中的this.mps.uuid = this.players[0].uuid赋值的
            // 因为mps就是class MultiPlayerSocket的对象
            'uuid': outer.uuid, 
        }));
    }

    // 后端向另一个前端发送create player的函数，另一个前端作为接收者
    receive_create_player() {

    }
}