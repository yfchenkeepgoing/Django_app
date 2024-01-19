class AcGamePlayground {
    constructor(root) {
        this.root = root; //存下root

        //AcGamePlayground类的html对象名为playground
        this.$playground = $(`<div class="ac-game-playground"></div>`); //写得简单点

        //打开网页时，应该先打开菜单界面，再打开游戏界面，因此在将playground加入总对象ac_game前应该先关掉游戏界面
        this.hide(); //为方便调试，打开网页时暂时先不隐藏游戏界面
        // 上述注释在第五节课中解开，打开游戏应该先看到菜单界面，再看到游戏界面，因此需要先隐藏游戏界面
        
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    // 给敌人随机颜色，自己设定几个颜色，在设定颜色的范围内随机
    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)]; // 随机数为0-5，下取整
    }

    // 创建唯一编号的函数，复制自ac_game_object/zbase.js中
    // 可以随机一个8位数，出现重复的概率很低，可以认为它是唯一的
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            // Math.random()返回[0, 1)之间的随机数, floor下取整, parseInt将其转换为int
            let x = parseInt(Math.floor(Math.random() * 10)); 
            res += x;
        }
        return res;
    }

    //所有对象最好都有start函数，用于给对象绑定监听函数或者设置初值
    start() {
        // console.log(AC_GAME_OBJECTS); // 输出全局变量，用于调试

        let outer = this;
        let uuid = this.create_uuid(); // 创建一个游戏窗口的唯一的标志：uuid

        // 当用户改变窗口大小时，本函数/事件会被触发
        // on来绑定，off来移除
        // 只需在acapp中移除对window的监听，网页端由于只有这个游戏，随着网页的关闭，window自然也不再被游戏监听了
        $(window).on(`resize.${uuid}`, function() {
            // console.log('resize'); // 调试用
            outer.resize(); // 用户改变窗口大小时，调整界面大小
        }); 

        // 需要监听关闭窗口的事件，需要在关闭窗口事件触发前移除函数
        if (this.root.AcWingOS) { // 判断是否是acapp端
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uuid}`); // 解除绑定
            });
        }
    }

    // 实现可以调整游戏界面长宽比的函数
    // 不仅希望初始时窗口的长宽比是固定的，且地图大小还可以随着用户调整窗口大小而动态变化
    // 实现以下函数，让窗口的长宽比是16:9，且达到最大
    resize() {
        // console.log("resize"); // 调试用，观察resize函数能否被正常调用

        this.width = this.$playground.width(); // 界面的宽度
        this.height = this.$playground.height(); // 界面的高度

        // 单位长度取为由宽度计算的单位长度和由高度计算的单位长度的最小值
        let unit = Math.min(this.width / 16, this.height / 9);

        // 调整后的宽度和高度
        this.width = unit * 16;
        this.height = unit * 9;

        // 用scale来表示地图的大小的基准，因为未来地图不仅长宽比确定，还要随着窗口大小动态调整
        // 因此需要基准，用scale表示
        // 地图大小一变，地图中的所有元素的大小和绝对位置也应该发生变化，地图中元素的相对位置应该不变
        // 因此地图中所有距离都应该改为相对距离
        this.scale = this.height; // scale取成地图的高度

        // 有game_map则一定要记得调用gamemap中的resize函数
        if (this.game_map) this.game_map.resize();
    }

    //未来写游戏时还有常用函数：update
    update() {
    }

    //游戏界面也需要实现一个show函数和一个hide函数
    show(mode) { // 打开playground界面
        let outer = this;
        this.$playground.show();
        // 将playground对象加入到总对象ac_game中
        // 未来可能会show多次，不能每次show都append一个新元素，因此将下面的话移到构造函数中
        // this.root.$ac_game.append(this.$playground);

        // 界面打开后需要resize一遍
        // this.resize();

        this.width = this.$playground.width(); //记下界面的宽度
        this.height = this.$playground.height(); //记下界面的高度
        // 生成一个GameMap类的对象game_map，用于放置画布canvas，传入的参数是AcGamePlayground本身
        this.game_map = new GameMap(this);
        
        // 记录下模式：单人/多人
        this.mode = mode;

        // 记录玩家的状态，玩家在room未满3人时，处于waiting状态，不可移动
        // 当room达到3人时，进入fighting状态，可以移动
        // 当玩家死后，进入over状态，不能发射fireball
        this.state = "waiting";

        // 在playground中创建notice_board
        this.notice_board = new NoticeBoard(this); 

        // 在playground中创建score_board，显示胜利/失败
        this.score_board = new ScoreBoard(this);

        // 统计notice_board中的人数
        this.player_count = 0;
        
        this.resize(); // 将resize调整到产生game_map之后，这样resize也能作用到game_map

        this.players = []; //创建数组用于存储玩家
        // 创建Player类的对象，并将其插入存储玩家的数组中，其中心坐标在游戏界面的中心，其半径是游戏界面高度的0.05
        // 颜色为白色，移速是每秒移动height的0.15，是自己，因此is_me = true
        // 三种角色：自己、机器人、敌人，自己用me，机器人用robot，敌人用enemy
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        
        // 单人模式，则加入机器人
        if (mode === "single mode") {
            // 6人一局，创建5个敌人
            // 注意敌人不是自己，所以最后一个参数是false，敌人的颜色换为蓝色
            for (let i = 0; i < 5; i ++ ) {
                // 颜色随机，blue->this.get_random_color()
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if (mode === "multi mode") {
            // 在多人模式下将chat_field添加到playground中
            this.chat_field = new ChatField(this);
             
            // 将MultiPlayerSocket添加到playground中
            this.mps = new MultiPlayerSocket(this); // mps: multi player socket
            this.mps.uuid = this.players[0].uuid; // players[0]是自己，始终是第一个被加入到数组中的

            // 尝试前端向后端发送一个消息，要等待链接创建成功再发送
            // onopen函数：链接创建成功时会回调本函数
            // send_create_player函数：创建当前玩家
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
        else if (mode === "rankings") {
            this.$playground.hide();

            if (!this.root.rankings) {
                this.root.rankings = new Rankings(this);
            }
            this.root.rankings.show();
        }
    }

    hide() {  // 关闭playground界面
        // 删除所有players
        // 若players存在（有可能不存在，因为新创建playground后就会先调用一遍this.hide()，此时players尚不存在）
        // 不能用for循环，数组下标会出问题
        while(this.players && this.players.length > 0) {
            // destroy函数在ac_game_objects/zbase.js中定义，其中的on_destroy函数在player/zbase.js中定义
            // on_destroy函数会将players[0]从playground的players数组中删去
            this.players[0].destroy(); // 移除这名玩家
        }

        // 删除game_map
        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        // 删除notice_board
        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        // 删除score_board
        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        // 删除html
        // 在gam_map中添加过一个html: this.$canvas = $(`<canvas tabindex=0></canvas>`);，也需要删去
        // 调用清空playground的html的api, empty()表示清空当前的html对象
        this.$playground.empty(); 

        // fireball射程有限，射程到后会自行清除，因此不用管

        this.$playground.hide();
    }
}
