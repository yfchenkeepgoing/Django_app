class AcGamePlayground {
    constructor(root) {
        this.root = root; //存下root

        //AcGamePlayground类的html对象名为playground
        this.$playground = $(`<div class="ac-game-playground"></div>`); //写得简单点

        //打开网页时，应该先打开菜单界面，再打开游戏界面，因此在将playground加入总对象ac_game前应该先关掉游戏界面
        this.hide(); //为方便调试，打开网页时暂时先不隐藏游戏界面
        // 上述注释在第五节课中解开，打开游戏应该先看到菜单界面，再看到游戏界面，因此需要先隐藏游戏界面
    
        this.start();
    }

    // 给敌人随机颜色，自己设定几个颜色，在设定颜色的范围内随机
    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)]; // 随机数为0-5，下取整
    }

    //所有对象最好都有start函数，用于给对象绑定监听函数或者设置初值
    start() {
    }

    //未来写游戏时还有常用函数：update
    update() {
    }

    //游戏界面也需要实现一个show函数和一个hide函数
    show() { // 打开playground界面
        this.$playground.show();
        //将playground对象加入到总对象ac_game中
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width(); //记下界面的宽度
        this.height = this.$playground.height(); //记下界面的高度
        //生成一个GameMap类的对象game_map，用于放置画布canvas，传入的参数是AcGamePlayground本身
        this.game_map = new GameMap(this); 

        this.players = []; //创建数组用于存储玩家
        // 创建Player类的对象，并将其插入存储玩家的数组中，其中心坐标在游戏界面的中心，其半径是游戏界面高度的0.05
        // 颜色为白色，移速是每秒移动height的0.15，是自己，因此is_me = true
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        
        // 6人一局，创建5个敌人
        // 注意敌人不是自己，所以最后一个参数是false，敌人的颜色换为蓝色
        for (let i = 0; i < 5; i ++ ) {
            // 颜色随机，blue->this.get_random_color()
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}
