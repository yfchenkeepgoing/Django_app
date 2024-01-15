class ScoreBoard extends AcGameObject {
    // 构造函数
    constructor(playground) {
        super(); // 调用基类的构造函数
        this.playground = playground;
        // 画布
        this.ctx = this.playground.game_map.ctx;

        // 当前状态：win: 胜利, lose: 失败
        this.status = null;

        // 两个状态对应两张图
        // 胜利的图片
        this.win_img = new Image();
        this.win_img.src = "https://ugc.futurelearn.com/uploads/images/db/c2/dbc2e5d7-3e39-4d63-bcf8-0a5cf9efbfab.jpg";

        // 失败的图片
        this.lose_img = new Image();
        this.lose_img.src = "https://img.freepik.com/premium-vector/you-lose-comic-speech-bubble-cartoon-game-assets_1056-3237.jpg";
    }

    start() {
        // this.lose(); // 调试用，画胜利
    }

    // 监听函数
    add_listening_events() {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas; // 事件绑定到画布上

        // 将关闭游戏界面和打开菜单界面的函数绑定到canvas对象的click操作上
        // 本事件不需要手动移除，因为hide函数就会把canvas对象移除掉，移除对象后与之绑定的事件也就不存在了
        $canvas.on('click', function() {
            outer.playground.hide(); // 关闭游戏界面
            outer.playground.root.menu.show(); // 打开菜单界面
        });
    }

    win() {
        this.state = "win";

        let outer = this;
        // 胜出现一秒钟后再绑定返回菜单的函数
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";

        let outer = this;
        // 败出现一秒钟后再绑定返回菜单的函数
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    late_update() {
        this.render(); // 每次update时渲染一下
    }

    render() {
        // 字的边长设置为高度的一半
        let len = this.playground.height / 2;

        if (this.state === "win") {
            // 后4个参数为图片左上角在画布中的横纵坐标和图片的长和宽
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}