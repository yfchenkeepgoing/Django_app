class AcGamePlayground {
    constructor(root) {
        this.root = root; //存下root

        //AcGamePlayground类的html对象名为playground
        this.$playground = $(`<div>游戏界面</div>`); //写得简单点

        //打开网页时，应该先打开菜单界面，再打开游戏界面，因此在将playground加入总对象ac_game前应该先关掉游戏界面
        this.hide();

        //将playground对象加入到总对象ac_game中
        this.root.$ac_game.append(this.$playground);

        this.start();
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
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}
