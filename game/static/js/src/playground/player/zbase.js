//Player也是一个游戏对象，因此也需要从AcGameObject中扩展出来
class Player extends AcGameObject {
    //构造函数
    //需要传入的参数：游戏场景playground，2d游戏需要传入球的中心坐标（x, y），3d游戏还需要传入z，有朝向的话还需要传入朝向
    //还需传入球的半径、颜色、玩家的移速（每秒移动占地图高度的百分比，适合联机时大家用不同分辨率的电脑）、是否是自己
    //自己的操作方式是键盘和鼠标，敌人的操作方式是通过网络传过来的，因此需要标签表示是否是自己
    constructor(playground, x, y, radius, color, speed, is_me) { 
        super(); //调用基类的构造函数，将自身通过AC_GAME_OBJECTS.push(this)插入到AC_GAME_OBJECTS这个数组中
        //保存player的playground和横纵坐标
        this.playground = playground;
        //找出class AcGamePlayground中的GameMap类的对象game_map的画布，ctx是画布的引用
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;

        //半径、颜色、速度
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;

        //移动时涉及浮点预算，需要eps, eps表示误差在多少以内就算0
        this.eps = 0.1; //误差在0.1以内就算0
    }

    //需要start和update函数
    start() {
        // this.render();
    }

    update() {
        this.render();
    }

    //渲染函数render
    render() {
        //查看canvas教程，找到画圆的方法
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  //arc(x,y,r,start,stop)
        this.ctx.fillStyle = this.color; //设置颜色
        this.ctx.fill(); //填入颜色
        //玩家也要每一帧中都画一次，因此需要在update函数中调用render函数
    }
}