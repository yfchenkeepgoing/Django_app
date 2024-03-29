//名称和web.html中的let ac_game = new AcGame();中的AcGame()保持一致
export class AcGame {
    //构造函数，类似cpp中的构造函数或者python中的__init__函数
    //参数为id参见web.html
    // 两个额外的参数access和refresh
    constructor(id, AcWingOS, access, refresh) {
        // 输出参数AcWingOS，观察其是什么，其本质是一个提供了很多api的对象
        // 通过这个参数可以判断我们是通过web去访问还是通过acapp去访问
        // console.log(AcWingOS) 
        this.id = id; //存下id，传入的id是web.html中div的id
        //创建总对象ac_game：需要利用jquery在web.html中根据id找出div，将这个div存入总对象ac_game中
        this.$ac_game = $('#' + id);

        // 记下AcWingOS
        this.AcWingOS = AcWingOS;

        // 存下access和refresh
        this.access = access;
        this.refresh = refresh;

        // 创建settings/zbase.js中的class Settings
        this.settings = new Settings(this);
        
        //创建出一个菜单页面类AcGameMenu的对象menu
        this.menu = new AcGameMenu(this); // 第五节课中解开了这个注释
        //AcGameMenu函数需要传入参数root，参数root是总类的对象，也就是class AcGame的this对象
        
        //创建游戏界面对象
        this.playground = new AcGamePlayground(this);

        // 创建排行榜对象
        this.rankings = new Rankings(this);

        this.start();
    }

    //好习惯，给所有类都加上start函数，一些初始化操作放入start函数中, start本质是构造函数的延申
    start() {
    }
}
