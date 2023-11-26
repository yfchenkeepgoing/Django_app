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
}class Particle extends AcGameObject {
    // 构造函数
    // vx和vy是速度的方向，需要playground因为需要ctx
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) { 
        super(); // 调用基类AcGameObject的构造函数，将particle注册到基类的全局数组AC_GAME_OBJECTS中
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        // 粒子效果也有一个逐渐变慢的过程，因此也需要一个摩擦力
        this.friction = 0.9;
        this.eps = 1;
    }

    // 第一帧
    start() {

    }

    // 第二帧及后面帧调用的函数
    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy(); // 销毁
            return false; // 停止函数的进一步执行，还阻止了事件的默认行为，并停止事件冒泡到父元素
        }

        // 实际可以移动的距离在最大移动距离和理论可移动距离之间取二者的最小值
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);

        this.x += this.vx * moved; // 时间单位有ms变成s
        this.y += this.vy * moved; 
        this.speed *= this.friction; // 速度每次乘上摩擦力系数
        this.move_length -= moved; 
        this.render(); // 渲染
    }

    //渲染函数，和其他类中的render函数完全相同
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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

        // player被fireball击中后，会被击晕且不受控制地滑行, vx和vy不可用，取而代之的是damage_x, damage_y, damage_speed
        this.damage_x = 0; // cos(angle)
        this.damage_y = 0; // sin(angle)
        this.damage_speed = 0; // player被fireball击晕后的速度

        // player被击中后，先退的快，后退的慢，因此需要定义摩擦力的概念
        this.friction = 0.9; // 先定为0.9，后续可以调

        this.move_length = 0; // 小球需要移动的距离，设置为全局变量

        //半径、颜色、速度
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;

        //移动时涉及浮点预算，需要eps, eps表示误差在多少以内就算0
        this.eps = 0.1; //误差在0.1以内就算0

        // 倒计时
        this.spent_time = 0;

        // 判断当前选择了什么技能
        this.cur_skill = null; // 当前并未选择技能
    }

    //需要start和update函数
    start() {
        if (this.is_me) { // 判断是否为自己，自己是通过鼠标键盘操作的，敌人不能通过鼠标键盘操作
            this.add_listening_events(); // 监听函数只能加给自己，不能加给敌人
        } else { // 敌人用ai操纵
            let tx = Math.random() * this.playground.width; // random会返回一个0-1之间的随机数
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty) // 将敌人移动到随机生成的目的地上
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
            // const表示变量是常量
            const rect = outer.ctx.canvas.getBoundingClientRect();

            // 鼠标右键是e.which为3，鼠标左键是e.which为1，鼠标滚轮是e.which为2
            if (e.which === 3) { // 可以改为1，我更习惯用鼠标左键操纵小球的移动
                // 可以看看鼠标点击有没有出发move_to函数，不要用this，用outer
                // 若在此处用this, 则这个this指的是mousedown函数本身，外面的this才是指整个class
                // 将鼠标点击的位置e.clientX, e.clientY传给move_to函数的参数tx, ty
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top); // 鼠标坐标的api: e.clientX和e.clientY
                // 注意，e.clientX是整个屏幕的坐标，但player的x坐标是画布中的相对坐标
                // 需要将大坐标系中的绝对坐标映射为小坐标系中的相对坐标
            } else if (e.which === 1) { // 若点击的是鼠标左键
                if (outer.cur_skill === "fireball") { // 若当前技能是fireball，则应该释放一个火球
                    outer.shoot_fireball(e.clientX- rect.left, e.clientY- rect.top); // 鼠标点击的坐标是e.clientX和e.clientY
                }
                outer.cur_skill = null; // 当前技能被释放掉
            }
        });

        // 用window来获取按键, e表示传入一个事件, 可以查询网上的keycode对照表
        // 火球用q键开启，q键的keycode是81
        $(window).keydown(function(e) {
            if (e.which === 81) {  // q
                outer.cur_skill = "fireball" // 当前技能为火球
                return false; // 表示之后不处理
            }
        });
    }

    // 发射火球的函数，需要传入坐标tx, ty，代表朝着这个点发射火球, 可以先不实现逻辑，先用console调试一下
    shoot_fireball(tx, ty) {
        // console.log("shoot fireball", tx, ty);
        // 先定义关于火球的各种参数
        let x = this.x, y = this.y; // 火球中心点的坐标和player中心点的坐标相同
        let radius = this.playground.height * 0.01; // player的半径是0.05，火球的半径定为0.01

        // vx, vy由angle确定
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange"; // 火球的颜色为橘黄色
        let speed = this.playground.height * 0.5; // 人的速度是height * 0.15, 火球的速度应该超过人
        let move_length = this.playground.height * 1; // 火球的最大射程是高度的1倍

        // 创建火球，传入上述参数, 新加入火球的伤害值参数，每个玩家的半径是总高度的0.05，因此伤害值可以定义为总高度的0.01
        // 相当于每次可以打掉玩家20%的血量
        new Fireball(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    // 求(x, y)和(tx, ty)间的欧几里得距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 鼠标右键后小球移动到哪个位置(target x, target y)的函数
    move_to(tx, ty) {
        // console.log("move to", tx, ty); // 输出移动到的位置tx, ty
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 小球需要移动的距离通过get_dist函数计算出来
        let angle = Math.atan2(ty - this.y, tx - this.x); // 求小球移动的角度, atan2(y, x)，注意两个参数不要颠倒
        
        // vx, vy实际上存储的是速度向量与单位圆的交点在x, y轴上的投影
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    // player被火球击中，因此需要定义函数is_attacked，需要传入参数火球攻击的角度angle和伤害值damage
    is_attacked(angle, damage) {

        // 每次释放随机数量的粒子效果
        // 粒子效果的数量在20-30之间
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            let x = this.x, y = this.y; // 从player的中心释放出粒子效果
            // radius也是一个随机值，但其大小应该和player的大小正相关
            let radius = this.radius * Math.random() * 0.1;
            // 释放粒子的角度：四面八方的随机
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color; // 当前player的颜色
            let speed = this.speed * 10; // 当前player速度的10倍
            let move_length = this.radius * Math.random() * 5; 

            // 创建particle类的对象
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        // player的血量就是其半径，因此攻击后player的新半径为原本的半径-伤害值
        this.radius -= damage;
        if (this.radius < 10) { // 如果player的半径小于10像素，则认为player已死
            this.destroy();
            return false; // 不再处理后续
        }

        // 否则火球会给player一个angle朝向的冲击力，即速度
        // 火球会击晕player，导致其不受控制的滑动一段距离
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        // 后退速度，可以逐步手动调整，太小了观察不到player被击退的效果
        this.damage_speed = damage * 100; 
        // 每次被攻击后，玩家的移速衰减
        this.speed *= 0.8;
    }

    update() {
        this.spent_time += this.timedelta / 1000; // 时间累计

        // 要求每五秒钟发射一枚炮弹，本函数每一秒钟被调用60次，因此每次被调用时发射炮弹的概率是1/300
        // 保证五秒钟之后敌人开始攻击player
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            // 随机产生一个被针对的玩家
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)]; 

            // 让AI更智能：加上轨迹预判，朝player0.3秒以后的位置射击
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;

            // 朝玩家释放炮弹，随机选择玩家，参加playground/zbase.js
            this.shoot_fireball(tx, ty);
        }

        // 新的优先级，若this.damage_speed依然存在，则player的速度清零, player停下来
        // 在damage_speed消失( < 10 )之前，被击中的player暂时无法有自己移动的距离move_length
        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0; // player被击中后停下，然后一直往后退，无法操作，知道damage_speed衰减到0
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000; // 有伤害，则优先用伤害移动自己
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction; // 加上摩擦力，减小damage_speed
        }
        else {
            // 若需要移动的长度小于eps，则不需要再移动了
            if (this.move_length < this.eps) {
                // 不需要移动时模长和单位速度的两个分量都为0
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) { // 若是敌人（由AI操控），则需要生成新的随机目的地
                    let tx = Math.random() * this.playground.width; // random会返回一个0-1之间的随机数
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty) // 将敌人移动到随机生成的目的地上
                }
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

    // 当前玩家血量耗尽后，删除当前玩家
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class Fireball extends AcGameObject {
    // 火球在攻击完别人后，需要一个计分系统，让后台知道是谁发的技能，同时自己发的火球不能打中自己，因此需要传入发出火球的玩家player作为参数
    // constructor函数类似player的zbase.js中的constructor函数
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super(); // 调用基类的构造函数
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed; 
        this.move_length = move_length; // move_length为火球的移动距离(射程)
        this.damage = damage;
        this.eps = 0.1 // 精度，小于0.1就认为是0
    }

    start() {

    }

    update() {
        // 不移动火球
        if (this.move_length < this.eps) {
            this.destroy(); // 删除火球，destroy函数在ac_game_object中实现了
            return false; // 停止函数的进一步执行，还阻止了事件的默认行为，并停止事件冒泡到父元素
        }

        // 移动火球
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 同player
        this.x += this.vx * moved; // 方向乘上距离（dcosθ）
        this.y += this.vy * moved; // dsinθ
        this.move_length -= moved; // 更新移动后的需要移动的距离

        // 判断炮弹是否击中敌人, playground中记录了所有的players，用于判断碰撞
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            // 当前枚举到的player不等于Fireball中的player, 即炮弹不应该伤害到自己本身
            // 如果当前枚举到的player并非发出炮弹者，且炮弹击中了当前枚举到的玩家
            if (this.player !== player && this.is_collision(player)) { 
                this.attack(player);
            }
        }
        
        this.render(); 
    }

    // 重复实现求两点间距离的函数，用于求两个圆心间的距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 判断碰撞的函数, 即判断火球和player圆心的距离是否小于两半径之和
    // 修改：本函数不仅可以用于判断火球和player间的碰撞，还可以用来判断任何两个物体之间的碰撞
    // 比如火球和火球之间的碰撞，两个火球相撞则互相抵消
    is_collision(player) {
        // 前两个参数是火球的中心坐标，后两个参数是player的中心坐标
        let distance = this.get_dist(this.x, this.y, player.x, player.y); 
        // 擦边不算击中
        if (distance < this.radius + player.radius) 
            return true; // 表示已经击中
        return false; // 未打中
    }

    // 攻击某个玩家的函数
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // 玩家被攻击到, 需要传入一个火球击中player的角度，同时传入一个伤害值
        player.is_attacked(angle, this.damage); 
        this.destroy(); // 火球击中目标后，应该消失
    }

    render() { // 类似player的zbase.js中的render函数
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground {
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
//名称和web.html中的let ac_game = new AcGame();中的AcGame()保持一致
export class AcGame {
    //构造函数，类似cpp中的构造函数或者python中的__init__函数
    //参数为id参见web.html
    constructor(id) {
        this.id = id; //存下id，传入的id是web.html中div的id
        //创建总对象ac_game：需要利用jquery在web.html中根据id找出div，将这个div存入总对象ac_game中
        this.$ac_game = $('#' + id);

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
