//名称和web.html中的let ac_game = new AcGame();中的AcGame()保持一致
export class AcGame {
    //构造函数，类似cpp中的构造函数或者python中的__init__函数
    //参数为id参见web.html
    constructor(id, AcWingOS) {
        this.id = id; //存下id，传入的id是web.html中div的id
        //创建总对象ac_game：需要利用jquery在web.html中根据id找出div，将这个div存入总对象ac_game中
        this.$ac_game = $('#' + id);

        // 记下AcWingOS
        this.AcWingOS = AcWingOS;
        
        //创建出一个菜单页面类AcGameMenu的对象menu
        this.menu = new AcGameMenu(this); // 第五节课中解开了这个注释
        //AcGameMenu函数需要传入参数root，参数root是总类的对象，也就是class AcGame的this对象
        
        //创建游戏界面对象
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    //好习惯，给所有类都加上start函数，一些初始化操作放入start函数中, start本质是构造函数的延申
    start() {
    }
}
