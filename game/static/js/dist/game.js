// 创建菜单页面类
class AcGameMenu{
    // 构造函数
    constructor(root) {   //除了总class AcGame外，都传入总class的对象root，即ac_game(参见web.html)
        // 存下root的信息
        this.root = root;

        // 定义菜单页面对象
        // 在jquery这种结构中，html对象的变量名前面可以加上$，普通对象的变量名前面不加$
        // ``之间怎么写就会怎么显示到前端
        // 首先创建一个背景，是div，html中大多数东西都是div，div是一种结构
        // html的class名用_或者-都可以
        // 接着设置背景图案的样式，需要用到css文件
        this.$menu = $(`
<div class="ac-game-menu">
        <div class="ac-game-menu-field">
            <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                单人模式
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                多人模式
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                设置
            </div>
        </div>
</div>
`);
        this.root.$ac_game.append(this.$menu); //将菜单页面类的对象menu按照定义时的样式插入总对象ac_game中

        // jquery中有find函数，可以在menu中找到某一个class对应的对象,注意class名前面要加上.，id前要加上#，这是jquery的语法
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');  // single按钮
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode'); //multi按钮
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings'); //settings按钮

        this.start(); //创建AcGameMenu的对象时自动调用start函数
    }

    start() {
        this.add_listening_events();
    }

    //给menu绑定监听函数，在start函数中被调用
    //利用jquery的封装可以给三个按钮绑定函数
    add_listening_events() {
        let outer = this; //存储this

        //当单人模式按钮被点击（click）时，会自动调用以下函数，效果是隐藏菜单，显示游戏界面
        this.$single_mode.click(function(){
            //注意：在函数内部调用this，不是函数外的this，例如若此处直接调用this，就是function函数
            //若想在函数内部调用函数外部的this，需要先把外面的this存储下来
            //console.log("click single mode"); //先不写函数，先输出一句话
            outer.hide(); //关闭当前页面
            //outer.root是总class的对象ac_game，ac_game中有对象playground，调用playground中的show函数，显示playground界面
            outer.root.playground.show();
        });

        //同理，当多人模式按钮被点击（click）时，会自动调用以下函数
        this.$multi_mode.click(function(){
            console.log("click multi mode"); //先不写函数，先输出一句话
        });

        //同理，当设置按钮被点击（click）时，会自动调用以下函数
        this.$settings.click(function(){
            console.log("click settings"); //先不写函数，先输出一句话
        });
    }

    //两个辅助函数，每个界面都需要show和hide两个辅助函数，用于从当前界面切换到另一个界面
    //show函数：展示当前界面
    show() { // 显示menu界面，用jquery的api实现
        this.$menu.show();
    }

    hide() { // 关闭menu界面，点完单人模式的按钮后，应该是先关闭菜单界面，然后打开游戏界面。返回菜单界面时，需要关闭游戏界面，打开菜单界面
        this.$menu.hide(); // 用jquery的api实现
    }
}
//属于这个基类的物体每一帧都要被重新画一次，因此在创建物体时需要将其先存入全局数组中，然后每秒钟调用全局数组中的对象60次
//js提供api：requestAnimationFrame();用于在执行动画或其他高频率更新的操作时，告知浏览器你希望进行一次重绘
//重绘函数requestAnimationFrame
let AC_GAME_OBJECTS = []; //全局数组

class AcGameObject {
    //构造函数
    constructor() {
        AC_GAME_OBJECTS.push(this); //每次调用构造函数创建物体时，都将物体（即对象）直接加入到全局数组中

        this.has_called_start = false; //表示是否执行了start函数
        //若没执行过start函数，则需要先执行start函数，若执行过start函数，则每次只需要执行update函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔，单位是ms
        //由于部分不标准的浏览器的requestAnimationFrame函数不是每秒钟调用60次，因此物体的移动速度最好用时间衡量，而不用帧来衡量，因此需要统计两帧之间的时间间隔
        //玩家在移动时的速度用时间去衡量
        //timedelta很容易算，因为重绘每一帧都会给一个时刻timestamp
    }

    //物体会有三个函数
    //第一个函数：物体刚出现的时候需要执行这个函数，用于设置小球的颜色、分值、昵称（昵称信息从服务器中加载出来）
    start() {  //只会在第一帧执行一次

    }

    //第二个函数：渲染等操作需要每帧都执行，除了第一帧之外的每帧都要执行
    update() {  //每一帧均会执行一次，每一帧循环一遍全局数组中的所有对象

    }

    //一个物体被删除前还需要去恢复现场，比如某人被删除前需要给其对手加分
    //对象在被销毁前执行一次
    on_destroy() {

    }
    //第三个函数：删除对象（物体）
    destroy() { //删掉该物体，即从全局数组中删除这个物体，在js中当一个对象没有被任何变量存储时，就会被自动释放掉
        this.on_destroy(); //对象在被销毁前执行一次on_destroy函数

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) { //js中最好用三个=，表示全等
                AC_GAME_OBJECTS.splice(i, 1); // js中的删除函数，从i开始删除一个
                break;
            }
        }
    }
}

let last_timestamp; //记录上一帧的时刻，这一帧和上一帧的时刻之差就是时间间隔timedelta
//不用初始化last_timestamp，因为所有物体第一次执行都会执行第一帧（start函数）,start函数中不需要用到last_timestamp
//所有物体都被执行完第一帧后，last_timestamp就会被附上初值，执行第二帧及以后的帧last_timestamp就可以被用到

//本函数形成了一个递归调用。即AC_GAME_ANIMATION函数会反复调用自己，每次调用都是在浏览器准备好进行下一个画面重绘时。
let AC_GAME_ANIMATION = function(timestamp) {   //timestrap为时间戳，这个参数表示本函数被调用的具体时刻
    //每一帧需要遍历数组中的所有物体，然后执行一遍update函数，第一帧除外，第一帧执行start函数
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i]; //当前物体用obj存储下来
        //若当前物体没有执行过第一帧，则执行start函数
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true; //标记obj已经执行过第一帧了
        } 
        
        //不是第一帧，则需要执行update函数，执行update函数前需要先初始化timedelta，告诉obj对象两帧之间的时间间隔是多少
        else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; //更新last_timestamp
    
    requestAnimationFrame(AC_GAME_ANIMATION); //递归
}

//触发第一次调用: 下面这行代码手动触发了AC_GAME_ANIMATION的第一次调用。
//通过调用requestAnimationFrame()并将AC_GAME_ANIMATION作为参数传入，来告诉浏览器在下一次重绘前调用AC_GAME_ANIMATION函数
//当浏览器准备好进行下一次重绘时，它会自动调用AC_GAME_ANIMATION函数，并传入一个时间戳（timestamp）表示当前时间。
requestAnimationFrame(AC_GAME_ANIMATION);  

class GameMap extends AcGameObject { //GameMap是游戏引擎中的AcGameObject类的派生类，因此GameMap可以用AcGameObject中的函数
    //调用函数时，会先看当前类中有无这个函数的定义，没有就会看基类中有无这个函数的定义
    //构造函数
    constructor(playground) {
        //调用基类中的构造函数
        super(); //调用完基类的构造函数后，会把自身通过AC_GAME_OBJECTS.push(this)插入到AC_GAME_OBJECTS这个数组中
        
        //传入playground，因为未来会用到playground中的一些参数，比如宽度和高度
        this.playground = playground;

        //在playground中渲染一个画面，需要用到js提供的渲染画面的工具canvas
        this.$canvas = $(`<canvas></canvas>`);
        //未来操作canvas中的ctx
        this.ctx = this.$canvas[0].getContext('2d'); //canvas是一个数组，目前的canvas是一个2d的画布
        //设置画布的宽度和高度，不懂api的话建议看菜鸟教程，IDE不一定能自动补全
        //画布的高度和宽度设置的和playground中的宽度和高度一致即可
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        //将canvas加入playground中，注意playground中的html标签是$playground
        this.playground.$playground.append(this.$canvas);
    }

    //GameMap中也需要实现两个函数，分别是start和update
    start() {

    }

    update() {
        this.render();
    }

    //渲染地图
    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; //矩形的颜色：黑色，黑色用rgba(0, 0, 0)表示, 透明度为20%
         //画出矩形，可以查看菜鸟教程html中的画布，四个参数分别是左上角的坐标和右下角的坐标
         //画布左上角的坐标是(0, 0)，右下角的坐标是(width, height)
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        //由于每一帧都需要重绘一遍地图，因此render函数应该是在update中执行，若在start中执行则只会在第一帧执行一次render函数
    }
}//Player也是一个游戏对象，因此也需要从AcGameObject中扩展出来
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
class AcGamePlayground {
    constructor(root) {
        this.root = root; //存下root

        //AcGamePlayground类的html对象名为playground
        this.$playground = $(`<div class="ac-game-playground"></div>`); //写得简单点

        //打开网页时，应该先打开菜单界面，再打开游戏界面，因此在将playground加入总对象ac_game前应该先关掉游戏界面
        //this.hide(); //为方便调试，打开网页时暂时先不隐藏游戏界面

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
//名称和web.html中的let ac_game = new AcGame();中的AcGame()保持一致
export class AcGame {
    //构造函数，类似cpp中的构造函数或者python中的__init__函数
    //参数为id参见web.html
    constructor(id) {
        this.id = id; //存下id，传入的id是web.html中div的id
        //创建总对象ac_game：需要利用jquery在web.html中根据id找出div，将这个div存入总对象ac_game中
        this.$ac_game = $('#' + id);

        //创建出一个菜单页面类AcGameMenu的对象menu
        //this.menu = new AcGameMenu(this); 
        //AcGameMenu函数需要传入参数root，参数root是总类的对象，也就是class AcGame的this对象
        
        //创建游戏界面对象
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    //好习惯，给所有类都加上start函数，一些初始化操作放入start函数中, start本质是构造函数的延申
    start() {
    }
}
