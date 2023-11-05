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
        this.vx = 0; // x方向上的速度，初始速度设置为0
        this.vy = 0; // y方向上的速度，初始速度设置为0
        this.move_length = 0; // 小球需要移动的距离，设置为全局变量

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
        if (this.is_me) { // 判断是否为自己，自己是通过鼠标键盘操作的，敌人不能通过鼠标键盘操作
            this.add_listening_events(); // 监听函数只能加给自己，不能加给敌人
        }
    }

    // 监听函数
    add_listening_events() {
        let outer = this; // 存下this，方便函数内部使用
        // 在游戏界面上鼠标右键会出现一个菜单，希望将这个右键菜单的功能删掉
        // contextmenu为菜单事件, return false表示菜单事件不再处理
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        
        // 读取鼠标点击坐标的函数，需要参数e
        this.playground.game_map.$canvas.mousedown(function(e) {
            // 鼠标右键是e.which为3，鼠标左键是e.which为1，鼠标滚轮是e.which为2
            if (e.which === 3) { // 可以改为1，我更习惯用鼠标左键操纵小球的移动
                // 可以看看鼠标点击有没有出发move_to函数，不要用this，用outer
                // 若在此处用this, 则这个this指的是mousedown函数本身，外面的this才是指整个class
                // 将鼠标点击的位置e.clientX, e.clientY传给move_to函数的参数tx, ty
                outer.move_to(e.clientX, e.clientY); // 鼠标坐标的api: e.clientX和e.clientY
            }
        });
    }

    // 求(x, y)和(tx, ty)间的欧几里得距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 鼠标右键后小球移动到哪个位置(target x, target y)的函数
    move_to(tx, ty) {
        console.log("move to", tx, ty); // 输出移动到的位置tx, ty
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 小球需要移动的距离通过get_dist函数计算出来
        let angle = Math.atan2(ty - this.y, tx - this.x); // 求小球移动的角度, atan2(y, x)，注意两个参数不要颠倒
        
        // vx, vy实际上存储的是速度向量与单位圆的交点在x, y轴上的投影
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() {
        // 若需要移动的长度小于eps，则不需要再移动了
        if (this.move_length < this.eps) {
            // 不需要移动时模长和单位速度的两个分量都为0
            this.move_length = 0;
            this.vx = this.vy = 0; 
        } else {
            // 两帧之间的时间间隔为timedelta，定义在ac_game_object/zbase.js中
            // 由于AcGameObject是本类的基类,所以会直接继承进来, timedelta的单位为ms，所以还需要/1000
            // 真实的移动距离为this.speed * this.timedelta / 1000和两点间模长取一个最小值，避免在当前的更新周期中移动超过目标点
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // moved为update周期中应该移动的距离
            this.x += this.vx * moved; // vx实际上是速度向量与x轴的夹角的cos值
            this.y += this.vy * moved; // vy实际上是速度向量与x轴的夹角的sin值

            // 更新剩余需要移动的距离
            this.move_length -= moved; // 每次移动的距离需要从总移动距离中减去
        }
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
