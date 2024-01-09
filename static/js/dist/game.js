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
                退出
            </div>
        </div>
</div>
`);
        this.$menu.hide(); // 写登录界面时先关闭菜单界面
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
            outer.root.playground.show("single mode"); // 加入参数：模式名
        });

        //同理，当多人模式按钮被点击（click）时，会自动调用以下函数
        this.$multi_mode.click(function(){
            // console.log("click multi mode"); //先不写函数，先输出一句话
            outer.hide(); // 关闭菜单页面
            outer.root.playground.show("multi mode");
        });

        //同理，当设置按钮被点击（click）时，会自动调用以下函数
        // 设置按钮暂时被改为登出按钮
        this.$settings.click(function(){
            // console.log("click settings"); //先不写函数，先输出一句话
            outer.root.settings.logout_on_remote(); // 点击登出按钮则服务器端登出
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

        // 需要同步的所有东西的唯一id
        this.uuid = this.create_uuid();

        // console.log(this.uuid); // 调试
    }

    // 创建唯一编号的函数
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

    // gamemap中的resize函数可以动态地修改黑框（地图）的长宽
    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        // 为避免改变窗口大小后游戏界面由灰色变为黑色的渐变过程，我们每次完成resize后
        // 直接强行涂上一层完全不透明的黑色蒙板
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; 
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
}// 提示牌：地图上方显示的信息栏，告诉我们当前有多少人就绪
class NoticeBoard extends AcGameObject {
    // 构造函数
    constructor(playground) {
        super(); // 调用父类的初始化函数

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 渲染则需要ctx
        this.text = "已就绪: 0人"; // 初始显示的文本
    }

    // 这也是一个ac game object，故也需要实现start和update函数
    start() {

    }

    // 还需要实现一个更新文本信息的函数，即计数牌中的文字内容
    write(text) {
        this.text = text;
    }

    update() {
        this.render(); // 每帧渲染一遍
    }

    // ac game object需要每帧都渲染，因此需要渲染函数
    render() {
        // 渲染文本，来自yxc的讲义
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20); // 文本在宽度一半，高度距离顶部20的位置
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
        this.eps = 0.01; // 相对值，真实值为height * 0.01
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
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}//Player也是一个游戏对象，因此也需要从AcGameObject中扩展出来
class Player extends AcGameObject {
    //构造函数
    //需要传入的参数：游戏场景playground，2d游戏需要传入球的中心坐标（x, y），3d游戏还需要传入z，有朝向的话还需要传入朝向
    //还需传入球的半径、颜色、玩家的移速（每秒移动占地图高度的百分比，适合联机时大家用不同分辨率的电脑）、是否是自己
    //自己的操作方式是键盘和鼠标，敌人的操作方式是通过网络传过来的，因此需要标签表示是否是自己
    constructor(playground, x, y, radius, color, speed, character, username, photo) { 
        
        // console.log(character, username, photo); // 输出新创建的玩家的信息，理论上character应该为enemy

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
        this.character = character;

        // 用户名和照片
        this.username = username;
        this.photo = photo;

        // 移动时涉及浮点预算，需要eps, eps表示误差在多少以内就算0
        // eps统一为1%的scale
        this.eps = 0.01; //误差在0.1以内就算0

        // 倒计时
        this.spent_time = 0;

        // 由于fireball会消失，我们需要先将每个玩家发射的fireball都存下来
        this.fireballs = [];

        // 判断当前选择了什么技能
        this.cur_skill = null; // 当前并未选择技能

        // 只有用户为robot时，不需要加载用户头像
        if (this.character !== "robot") {
            this.img = new Image();
            // this.img.src = "图片地址";
            this.img.src = this.photo;
        }

        // 加上技能CD，技能冷却时间3秒钟
        if (this.character === "me") {
            this.fireball_coldtime = 3;
            this.fireball_img = new Image(); // 创建火球术的技能图片
            // 图片链接
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png"
        
            // 闪现技能CD：5秒
            this.blink_coldtime = 5;
            // 闪现技能图标
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png"
        }
    }

    //需要start和update函数
    start() {
        // 每次调用start函数，加入room的玩家人数+1
        this.playground.player_count ++ ;

        // 将notice_board上的已就绪人数渲染出来
        this.playground.notice_board.write("已就绪: " + this.playground.player_count + "人");

        // 已就绪人数大于等于3，则状态变为fighting，各个player可以开始移动同时发射fireball
        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting"; 
            this.playground.notice_board.write("Fighting"); // 更改notice_board上的文字为Fighting
        }

        if (this.character === "me") { // 判断是否为自己，自己是通过鼠标键盘操作的，敌人不能通过鼠标键盘操作
            this.add_listening_events(); // 监听函数只能加给自己，不能加给敌人
        } else if (this.character === "robot") { // 敌人用ai操纵
            let tx = Math.random() * this.playground.width / this.playground.scale; // random会返回一个0-1之间的随机数
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
            // 下面是移动和攻击的操作，只有在player的state为fighting时才可以进行
            if (outer.playground.state !== "fighting")
                return false; // return false是阻止默认事件的发生(点击事件不会继续处理)

            // const表示变量是常量
            const rect = outer.ctx.canvas.getBoundingClientRect();

            // 鼠标右键是e.which为3，鼠标左键是e.which为1，鼠标滚轮是e.which为2
            if (e.which === 3) { // 可以改为1，我更习惯用鼠标左键操纵小球的移动
                // 可以看看鼠标点击有没有出发move_to函数，不要用this，用outer
                // 若在此处用this, 则这个this指的是mousedown函数本身，外面的this才是指整个class
                // 将鼠标点击的位置e.clientX, e.clientY传给move_to函数的参数tx, ty
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty); // 鼠标坐标的api: e.clientX和e.clientY
                // 注意，e.clientX是整个屏幕的坐标，但player的x坐标是画布中的相对坐标
                // 需要将大坐标系中的绝对坐标映射为小坐标系中的相对坐标

                // 判断模式：多人模式则需要群发move_to函数
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                } 

            } else if (e.which === 1) { // 若点击的是鼠标左键
                // 在player.state变为fighting前，也不能按技能

                // 因为接下来要实现一个闪现技能，也需要求tx, ty，因此把tx, ty放在if判断外面
                let tx = (e.clientX- rect.left) / outer.playground.scale;
                let ty = (e.clientY- rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") { // 若当前技能是fireball，则应该释放一个火球
                    if (outer.fireball_coldtime > outer.eps)
                        return false;

                    let fireball = outer.shoot_fireball(tx, ty); // 鼠标点击的坐标是e.clientX和e.clientY

                    // 多人模式，则广播shoot_fireball函数
                    if (outer.playground.mode === "multi mode") { 
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid); // send_shoot_fireball函数定义在multiplayer/zbase.js中
                    }
                } else if (outer.cur_skill === "blink") { 
                    // 判断blink的CD
                    if (outer.blink_coldtime > outer.eps)
                        return false;

                    outer.blink(tx, ty); // 调用闪现函数
                }
                outer.cur_skill = null; // 当前技能被释放掉
            }
        });

        // 用window来获取按键, e表示传入一个事件, 可以查询网上的keycode对照表
        // 火球用q键开启，q键的keycode是81
        $(window).keydown(function(e) {
            // console.log(e.which); // 不知道某个键对应的数字，输出即可
            // 在player.state变为fighting前，也不能按技能
            if (outer.playground.state !== "fighting")
                return true; 

            if (e.which === 81) {  // q
                // 技能还未冷却好
                if (outer.fireball_coldtime > outer.eps)
                    return true;

                outer.cur_skill = "fireball" // 当前技能为火球
                return false; // 表示之后不处理
            }

            // 闪现技能，监听F键，对应的数字为70
            else if (e.which === 70) {
                // 判断闪现技能的冷却时间
                if (outer.blink_coldtime > outer.eps)
                    return true;

                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    // 发射火球的函数，需要传入坐标tx, ty，代表朝着这个点发射火球, 可以先不实现逻辑，先用console调试一下
    shoot_fireball(tx, ty) {
        // console.log("shoot fireball", tx, ty);
        // 先定义关于火球的各种参数
        let x = this.x, y = this.y; // 火球中心点的坐标和player中心点的坐标相同
        let radius = 0.01; // player的半径是0.05，火球的半径定为0.01

        // vx, vy由angle确定
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange"; // 火球的颜色为橘黄色
        let speed = 0.5; // 人的速度是height * 0.15, 火球的速度应该超过人
        let move_length = 1; // 火球的最大射程是高度的1倍

        // 创建火球，传入上述参数, 新加入火球的伤害值参数，每个玩家的半径是总高度的0.05，因此伤害值可以定义为总高度的0.01
        // 相当于每次可以打掉玩家20%的血量
        let fireball = new Fireball(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball); // 将发射的fireball存入fireballs数组中

        this.fireball_coldtime = 3; // 每次放完技能后，重置技能冷却时间，每3秒才能放出一个fireball

        return fireball; // 为了获取fireball的uuid，因此需要返回fireball
    }

    // 通过uuid来删除火球
    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i ++ ) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) { // 通过uuid找到了这个火球，则删除之
                fireball.destroy();
                break; // 删完后退出循环，可以提高程序运行效率
            }
        }
    }

    // 闪现技能对应的函数, tx, ty为闪现到的目的地
    blink(tx, ty) {
        // 求当前点到目标点的距离，判断其是否超过最大距离: height * 0.8，相对值为0.8
        let x = this.x, y = this.y;
        let d = this.get_dist(x, y, tx, ty);
        d = Math.min(d, 0.8);

        // 如何移动：求角度
        let angle = Math.atan2(ty - y, tx - x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        // 重置闪现冷却时间
        this.blink_coldtime = 5;

        // 让player闪现完后停下
        this.move_length = 0;
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
        if (this.radius < this.eps) { // 如果player的半径小于eps，则认为player已死
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

    // 接受并处理自己被攻击的信息的函数
    // 信息包括击中的坐标、角度，伤害，fireball的uuid和攻击者
    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid); // 从attacker的fireball列表中删掉击中别人的炮弹
        // 同步被击中者（即自己）的坐标
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage); // 调用is_attacked函数
    }

    update() {
        this.spent_time += this.timedelta / 1000; // 时间累计

        // 只有是自己，且对局没有结束（自己仍存活），才更新冷却时间
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime(); // 更新冷却时间
        }
            
        this.update_move(); // 更新移动

        this.render();
    }

    // 负责更新技能冷却时间的函数
    update_coldtime() {
        // 每一帧的冷却时间更新为当前冷却时间减去和上一帧的时间间隔即可
        this.fireball_coldtime -= this.timedelta / 1000;
        // 冷却时间不能小于0
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        // console.log(this.fireball_coldtime); // 输出技能冷却时间，用于调试

        // 更新闪现的技能冷却时间
        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    // 负责更新玩家移动
    update_move() {
        // 要求每五秒钟发射一枚炮弹，本函数每一秒钟被调用60次，因此每次被调用时发射炮弹的概率是1/300
        // 保证五秒钟之后机器人开始攻击player
        if (this.character === "robot" && this.spent_time > 4 && Math.random() < 1 / 300.0) {
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
        if (this.damage_speed > this.eps) {
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
                if (this.character === "robot") { // 若是机器人（由AI操控），则需要生成新的随机目的地
                    let tx = Math.random() * this.playground.width / this.playground.scale; // random会返回一个0-1之间的随机数
                    let ty = Math.random() * this.playground.height / this.playground.scale;
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
    }

    //渲染函数render
    render() {
        let scale = this.playground.scale;

        // 机器人渲染颜色，自己和敌人均渲染图片
        if (this.character !== "robot") {
            // 将图像渲染到代表player的圆圈上
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }
        else {
            //查看canvas教程，找到画圆的方法
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);  //arc(x,y,r,start,stop)
            this.ctx.fillStyle = this.color; //设置颜色
            this.ctx.fill(); //填入颜色
            //玩家也要每一帧中都画一次，因此需要在update函数中调用render函数
        }

        // 只有自己，且对局尚未结束，才会用自己的冷却时间渲染技能图片
        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime()
        }
    }

    // 用冷却时间渲染技能图片
    // 原理：渲染技能图片，然后在冷却时间尚存时在其上面渲染一张半透明的图片
    render_skill_coldtime() {
        // 屏幕宽度16/9=1.78，第一个技能图标渲染到1.5 * height的位置
        let x = 1.5, y = 0.9, r = 0.04; // 都是相对值，相对height

        let scale = this.playground.scale;

        // 渲染图片，复制自render函数
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        // 覆盖上半透明的蒙版，角度和冷却时间有关，画圆的代码复制自render函数
        // 技能还没冷却好才这样画，避免了技能冷却好后技能图片被蓝色蒙版完全覆盖的问题
        if (this.fireball_coldtime > 0) { 
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale); // 从圆心开始画
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);  //arc(x,y,r,start,stop)
            this.ctx.lineTo(x * scale, y * scale); // 画完后再移到圆心
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)"; //设置颜色：半透明的蓝色，透明度0.6
            this.ctx.fill(); //填入颜色
        }

        x = 1.62, y = 0.9, r = 0.04; // 放置技能图标的位置
        // 渲染闪现技能图标，复制自上面的代码
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        if (this.blink_coldtime > 0) { 
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale); // 从圆心开始画
            // 闪现是5秒CD，所以除数也改为5
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);  //arc(x,y,r,start,stop)
            this.ctx.lineTo(x * scale, y * scale); // 画完后再移到圆心
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)"; //设置颜色：半透明的蓝色，透明度0.6
            this.ctx.fill(); //填入颜色
        }
    }

    // 当前玩家血量耗尽后，删除当前玩家
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break; // 删完后退出循环，可以提高程序运行效率
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
        this.eps = 0.01 // 相对值，真实值为height的0.01倍
    }

    start() {

    }

    update() {
        // 不移动火球
        if (this.move_length < this.eps) {
            this.destroy(); // 删除火球，destroy函数在ac_game_object中实现了
            return false; // 停止函数的进一步执行，还阻止了事件的默认行为，并停止事件冒泡到父元素
        }

        // 调用update_move和update_attack
        this.update_move();

        // 炮弹的发射者是本窗口中的本玩家（me），才进行碰撞判断
        // 若炮弹的发射者是本窗口中的敌人（enemy），则不进行碰撞判断
        if (this.player.character !== "enemy") { // 多人模式下无robot角色
            this.update_attack();
        }
    
        this.render(); 
    }

    // 拆分自原本的update函数：move部分
    update_move() {
        // 移动火球
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 同player
        this.x += this.vx * moved; // 方向乘上距离（dcosθ）
        this.y += this.vy * moved; // dsinθ
        this.move_length -= moved; // 更新移动后的需要移动的距离
    }

    // 拆分自原本的update函数：attack部分
    update_attack() {
        // 判断炮弹是否击中敌人, playground中记录了所有的players，用于判断碰撞
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            // 当前枚举到的player不等于Fireball中的player, 即炮弹不应该伤害到自己本身
            // 如果当前枚举到的player并非发出炮弹者，且炮弹击中了当前枚举到的玩家
            if (this.player !== player && this.is_collision(player)) { 
                this.attack(player);
                break; // 一个fireball只攻击一名player
            }
        }
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

        // 多人模式下才需要去广播攻击函数
        if (this.playground.mode === "multi mode") {
            // send_attack(attackee_uuid, x, y, angle, damage, ball_uuid)
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy(); // 火球击中目标后，应该消失
    }

    render() { // 类似player的zbase.js中的render函数
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    // 由于在player中存储了fireball列表，因此在删除某个fireball前需要将其从player.fireballs中删去
    on_destroy() {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i ++ ) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1); // 从fireballs数组中删去当前的fireball
                break;
            }
        }
    }
}class MultiPlayerSocket {
    // 构造函数，传入参数playground，方便与地图中的其他元素产生关联
    constructor(playground) {
        this.playground = playground;

        // 建立wss的连接，连接地址为项目的域名，并将其中的https改为wss，在域名后面添加routing.py中的wss/multiplayer/
        // 注意若routing.py中以\结尾，则下面也需要以\结尾，ws协议的书写规范比http协议要求更为严格
        this.ws = new WebSocket("wss://app5894.acapp.acwing.com.cn/wss/multiplayer/");

        this.start(); // 调用start函数
    }

    start() {
        this.receive();
    }

    // 接收后端发送到前端的当前玩家的信息的函数
    receive() {
        let outer = this; 

        // 在前端接收wss协议的信息的api：onmessage
        this.ws.onmessage = function(e) {
            // 解析后端向前端传输的信息, 此处是将字符串变成字典（后端的index.py中是将字典变为字符串）
            let data = JSON.parse(e.data);
            // console.log(data); // 输出data，用于调试

            // 当前玩家本人并不需要接收到后端发送来的自己的消息，将这个消息pass掉即可
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            // 对后端发来的信息的event类型也进行判断，判断是否是create_player
            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo); // 调用本地处理create_player的函数
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                // data中的信息不包含uuid，因为uuid就是本player的uuid，不需要在data中传输
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
        };
    }

    // 前端向后端发送create player的函数，前端作为发送者
    // 本函数是创建当前玩家的函数
    send_create_player(username, photo) {
        let outer = this;

        // 将json封装为字符串，api是JSON.stringify
        this.ws.send(JSON.stringify({
            // 'message': "hello acapp server", // 调试用
            // 当前向服务器传递的信息
            'event': "create_player",
            // 此uuid是由playground/zbase.js中的this.mps.uuid = this.players[0].uuid赋值的
            // 因为mps就是class MultiPlayerSocket的对象
            'uuid': outer.uuid, 
            'username': username,
            'photo': photo,
        }));
    }

    // 实现get_player函数：通过uuid找到对应的player
    // 暴力遍历所有的player即可
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ ) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }

        // 找不到玩家则返回空
        return null;
    }

    // 根据后端发送来的新加入玩家的信息，在其他玩家的前端创建出该玩家的函数
    receive_create_player(uuid, username, photo) {
        // 参考player/zbase.js
        // constructor(playground, x, y, radius, color, speed, character, username, photo)
        // 新建的玩家放在playground的中心，x, y坐标使用相对位置
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale, 
            0.5,
            0.05,
            "white", // 颜色随便，后续会被图片覆盖掉
            0.15,
            "enemy", // 新建的玩家为敌人
            username,
            photo,
        );

        player.uuid = uuid; // 每个对象的uuid要等于创建它窗口的uuid
        this.playground.players.push(player); // 将该player加入到playground中
    }

    // 同步move_to函数
    // 将move_to函数从前端发送给服务器端，仿照send_create_player
    send_move_to(tx, ty) {
        let outer = this;

        // 将json封装为字符串，api是JSON.stringify
        this.ws.send(JSON.stringify({
            'event': "move_to",
            // 此uuid是由playground/zbase.js中的this.mps.uuid = this.players[0].uuid赋值的
            // 因为mps就是class MultiPlayerSocket的对象
            'uuid': outer.uuid, // 本uuid来自发出move_to指令的人
            'tx': tx, // 目的地的横坐标
            'ty': ty, // 目的地的纵坐标
        }));
    }

    // 从服务器端接收其他窗口的move_to函数信息的函数，仿照receive_create_player
    // 参数uuid来自move_to函数的发出者
    receive_move_to(uuid, tx, ty) {
        // 通过uuid找到命令的发出者
        let player = this.get_player(uuid); // move_to函数的uuid来自其发出者的uuid，这在send_move_to函数中有体现

        // 玩家存在，再去调用其move_to函数，防止玩家下线还调用了move_to函数
        if (player) {
            player.move_to(tx, ty); // move_to函数的发出者在本窗口中同步移动
        }
    }

    // 同步shoot fireball
    // 将shoot fireball函数从前端发送给服务器端，仿照send_create_player
    send_shoot_fireball(tx, ty, ball_uuid) { // tx, ty：子弹发射的目标地点, 接下来是子弹的uuid（因为需要在所有窗口中将子弹同步）
        let outer = this;

        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid, // 发射者的uuid
            'tx': tx, // 目的地的横坐标
            'ty': ty, // 目的地的纵坐标
            'ball_uuid': ball_uuid, // 子弹的uuid
        }));
    }

    // 从服务器端接收其他窗口的shoot fireball函数信息的函数，仿照receive_create_player
    // uuid: 发射者的uuid, ball_uuid: 子弹的uuid
    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        // 通过uuid找到发射者的uuid
        let player = this.get_player(uuid); 

        // 玩家存在，再去调用其shoot_fireball函数，防止玩家已经阵亡
        // 同时存储该名玩家创建的fireball
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid; // 所有窗口的火球的uuid需要统一
        }
    }

    // 同步attack函数
    // 模仿send_create_player & send_move_to & send_shoot_fireball
    // 传输信息：攻击者击中被攻击者, 故需要传输attacker和attackee的uuid
    // 所有同步过程都没有同步坐标，因此随着时间的推移，每名玩家的坐标可能发生变化，因为存在误差（来自三角函数的计算和浮点数的计算）和网络延迟
    // 击中其他player时，需要算角度，这个角度的误差可能越来越大
    // 做补偿：attacker击中attackee时，在所有窗口中将attackee的位置同步
    // 即我击中了你，你在所有窗口中的位置由我说了算
    // 因此传入的参数还有attackee在attacker窗口中的位置，角度，以及伤害值
    // 还需同步fireball，因为该炮弹已经击中了别人，在其他窗口中需要删掉（否则其他窗口中的该fireball就是一段动画，不会消失）
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid, // attacker的uuid
            'attackee_uuid': attackee_uuid, // attackee的uuid
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    // 模仿receive_create_player & receive_move_to & receive_shoot_fireball
    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid); // 通过uuid找到攻击者
        let attackee = this.get_player(attackee_uuid); // 通过uuid找到被攻击者

        // 若攻击者和被攻击者都还活着，就处理攻击
        if (attacker && attackee) {
            // 调用player/zbase.js中实现的接受并处理自己被攻击的信息的函数
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }
}class AcGamePlayground {
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

    //所有对象最好都有start函数，用于给对象绑定监听函数或者设置初值
    start() {
        let outer = this;

        // 当用户改变窗口大小时，本函数/事件会被触发
        $(window).resize(function() {
            outer.resize(); // 用户改变窗口大小时，调整界面大小
        }); 
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
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}
class Settings {
    // 构造函数，按照惯例有参数root
    constructor(root) {
        this.root = root;
        
        // 判断平台，平台的名字和views/settings/getinfo.py中的名字对应，默认是web平台
        // js是从前端向后端传，views中的getinfo.py则是从服务器里接收
        // 因此传的时候怎么传的，接的时候就应该怎么接，否则无法匹配
        this.platform = "WEB";

        // 若root中有参数AcWingOS，则平台是ACAPP
        if (this.root.AcWingOS) this.platform = "ACAPP";

        // 初始化当前用户的username和photo
        this.username = "";
        this.photo = "";

        // 使用jquery创建一个新的html元素
        this.$settings = $(`
<div class = "ac-game-settings">

    <div class="ac-game-settings-login">

        <div class="ac-game-settings-title">
            登录
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>

        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div> 
        </div>

        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            注册
        </div>

        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/third_party_login_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>

        <br>
        <div class="ac-game-settings-github">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/github_login_logo.png">
            <br>
            <div>
                GitHub一键登录
            </div>
        </div>

    </div>

    <div class="ac-game-settings-register">
    
        <div class="ac-game-settings-title">
            注册
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div> 
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div> 
        </div>

        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            登录
        </div>

        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/third_party_login_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>

        <br>
        <div class="ac-game-settings-github">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/github_login_logo.png">
            <br>
            <div>
                GitHub一键登录
            </div>
        </div>

    </div>

</div>
`);
        // 登录界面
        this.$login = this.$settings.find(".ac-game-settings-login");

        // 索引username中的input，即在html的username模块寻找input
        // 由于input和username模块不在同一级，因此应该用空格隔开，而非>
        // 用>隔开说明input和username是相邻的两级
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        // 索引password中的input
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        // 索引submit模块中的button按钮
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        // 索引error message，由于其中什么也没有，因此直接索引本体即可
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        // 索引option（登录页面的注册按钮），由于其中什么也没有，因此直接索引本体即可
        this.$login_register = this.$login.find(".ac-game-settings-option");

        // 默认隐藏登录界面
        this.$login.hide();
        
        // 注册界面
        this.$register = this.$settings.find(".ac-game-settings-register");
        // 同理，也需要索引出login中索引出的相应内容
        // 索引username
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        // 索引password
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        // 索引确认password
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        // 索引submit
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        // 索引error message
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        // 索引option（注册页面的登录按钮）
        this.$register_login = this.$register.find(".ac-game-settings-option");

        // 默认隐藏注册界面
        this.$register.hide();

        // 索引acwing一键登录图标
        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img')

        // 索引github一键登录图标
        this.$github_login = this.$settings.find('.ac-game-settings-github img')

        //将settings加到窗口中去
        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    // 创建之初需要执行的函数
    start() {
        // acapp端则执行其相应的getinfo函数, acapp端也不需要绑定监听函数
        // 因为监听函数用于操作登录和注册界面的按钮，而acapp端用不到这些信息
        // 不加监听函数可以使acapp运行更加流畅
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else { // web端执行其相应的getinfo函数
            this.getinfo_web();
            this.add_listening_events(); // 绑定监听函数
        }
    }

    // 写一个专门的函数来绑定事件，其中包含登录界面的监听函数和注册界面的监听函数
    add_listening_events() {
        let outer = this;
        this.add_listening_events_login(); // 登录界面的监听函数
        this.add_listening_events_register(); // 注册界面的监听函数

        // acwing一键登录图标的监听函数
        // 若点击这个图标，则调用acwing_login
        this.$acwing_login.click(function() {
            outer.acwing_login();
        });

        // github一键登录图标的监听函数
        this.$github_login.click(function() {
            outer.github_login();
        });
    }

    // 登录界面的监听函数
    add_listening_events_login() {
        // 凡是有click函数，外面都定义outer
        let outer = this;

        // 登录界面的注册按钮点完后要跳到注册界面
        this.$login_register.click(function() {
            outer.register(); // 跳到注册界面
        });

        // 给登录界面的登录按钮加一个监听函数
        this.$login_submit.click(function() {
            outer.login_on_remote(); // 调用在远程服务器上登录的函数
        });
    }

    // 注册界面的监听函数
    add_listening_events_register() {
        // 凡是有click函数，外面都定义outer
        let outer = this;

        // 注册界面的登录按钮点完后要跳到登录界面
        this.$register_login.click(function() {
            outer.login(); // 跳到注册界面
        });

        // 绑定点击注册界面注册按钮的动作到注册函数
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    // acwing一键登录的前端和后端交互的函数
    acwing_login() {
        // console.log("click acwing login") // 先不产生作用，直接输出，用于调试
        // 改为ajax
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            // 无需传数据，因此只需要成功函数
            success: function(resp) {
                // console.log(resp);
                // 成功，则将当前页面重定向
                // resp.result和resp.apply_code_url和apply_code.py中的写法保持一致
                if (resp.result === "success") {
                    // 调用重定向的api, 重定向到acwing申请授权界面
                    window.location.replace(resp.apply_code_url); 
                }
            }
        });
    }

    // github一键登录的前端和后端交互的函数
    github_login() {
        // console.log("click github login") // 用于调试
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/acwing/web/apply_code_github/",
            type: "GET",
            // 无需传数据，因此只需要成功函数
            success: function(resp) {
                // console.log(resp);
                // 成功，则将当前页面重定向
                // resp.result和resp.apply_code_url和apply_code.py中的写法保持一致
                if (resp.result === "success") {
                    // 调用重定向的api, 重定向到acwing申请授权界面
                    window.location.replace(resp.apply_code_url); 
                }
            }
        });
    }

    // 在远程服务器上登录的函数，是一个ajax
    // 点击登录界面的登录按钮时登录，因此给这个按钮绑定一个触发函数
    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val(); // 取出login_username的值
        let password = this.$login_password.val(); // 取出login_password的值
        // 每次登录时，清空上一次的login_error_message
        this.$login_error_message.empty();

        // 调用服务器的登录函数
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) { // 返回值为后端传回来的一个字典，将其传入参数resp中
                // console.log(resp) // 输出resp，看对不对
                // 三等号用于比较
                // 若登录成功，则刷新，在cookie中会记录已经登录成功，刷新页面后进入菜单界面
                if (resp.result === "success") {
                    location.reload(); 
                } else {
                    outer.$login_error_message.html(resp.result); // 登录失败则显示用户名或密码不正确       
                }
            }
        });
    }

    // 在远程服务器上注册的函数
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        
        this.$register_error_message.empty(); // 清空error message

        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/register/",
            type: "GET", // 按理来说应该用POST，凡是改数据库都要用POST, 此处为方便调试用GET
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },

            // 回调函数，后端返回的字典被传入resp种
            success: function(resp) {
                // console.log(resp); // 输出结果，便于调试
                // 判断是否成功
                if (resp.result === "success") {
                    // 刷新页面，注册成功后刷新页面就进入登录状态，打开菜单，因为register.py中有login
                    location.reload(); 
                } else {
                    // 否则直接将错误信息通过error message展现出来
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    // 在远程服务器上登出的函数
    logout_on_remote() {
        // 若前端是acapp，则不需要退出，acapp中关掉游戏界面就算是退出
        // 调用api实现菜单界面的退出功能
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close(); // yxc提供的关闭窗口的api
        } else {
            // 若前端是web，则有如下的登出操作
            $.ajax({
                url: "https://app5894.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                // 退出不需要参数，因此不需要data
                success: function(resp) {
                    // console.log(resp); // 输出后端返回的结果，用于调试
                    // 后端返回的resp的result必定为success
                    if (resp.result === "success") {
                        location.reload(); // 刷新页面
                    }
                }
            });
        }
    }

    // 打开注册界面
    register() {
        // 关掉登录界面
        this.$login.hide();
        // 打开注册界面
        this.$register.show();
    }
    
    // 打开登录界面
    login() {
        // 关掉注册界面
        this.$register.hide();
        // 打开登录界面
        this.$login.show();
    }

    // 发起授权的函数
    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        // 请求授权码的API
        // 标准格式AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, callback)
        // 其中callback需要自定义一个函数来实现，其返回值是resp
        // resp是redirect_uri的返回值，redirect_uri就是receive_code函数
        // 因此resp是receive_code函数的返回值。返回值为用户名和头像（有待实现）
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            // console.log("called from acapp_login function"); // 方便显示下面的输出的来源
            // console.log(resp); // 输出，看返回结果是否正确
            if (resp.result === "success") {
                // 成功获取用户名和头像，后面和web端的getinfo函数逻辑相同
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide(); // 隐藏当前的settings页面
                outer.root.menu.show(); // 显示菜单界面
            }
        });

    }

    // acapp端的getinfo函数，因为acapp端一定没有登录，所以需要单独写
    // acapp端：直接从后台获取授权登录的4个参数即可
    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    // 发起授权，需要传入4个参数，对应于apply_code.py返回的结果
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state); 
                }
            }
        });
    }

    // web端的getinfo函数：从服务器端获取用户信息（用户名和头像）的函数
    // 需要记住这是怎么写的，用ajax来写，ajax中传一个字典
    // 其中包括getinfo函数显示在网站端的完整路径，这是因为本项目不仅要跑在web端还要跑在acapp端
    getinfo_web() {
        let outer = this; 
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET", // 类型都默认为GET
            // getinfo.py中需要什么数据，就传入什么数据
            // getinfo.py:
            // def getinfo(request):
            // # 判断从哪个前端发送而来，传入参数platform，这个参数需要我们在前端自定义
            // platform = request.GET.get('platform')
            // if platform == "ACAPP":
            //     return getinfo_acapp(request)
            // elif platform = "WEB":
            //     return getinfo_web(request)
            data: {
                // 函数内部不宜直接用this，函数内部的this可能是函数本身，而非这个class本身
                // 函数内部用this需要在函数外部定义: let outer = this; 
                platform: outer.platform,
            },

            // 调用成功则返回success
            // resp是getinfo.py中返回的值，由下面的代码可知
            // # 返回信息
            // return JsonResponse({
            //     'result': "success", # 返回查询结果，成功则返回success，失败则返回理由
            //     'username': player.user.username,
            //     'photo': player.photo,
            // })
            // 返回值确切来说是一个字典(dict)，这个返回值会被传给参数resp，可以打印出来观察
            success: function(resp) {
                // console.log(resp); // 打印getinfo.py的返回值
                // 若返回值为success，则应该打开菜单界面，隐藏登录界面（当前界面）
                // 因此，本文件中也需要实现隐藏函数和显示函数
                if (resp.result == "success") {
                    // 将resp中的username和photo存入outer中
                    outer.username = resp.username;
                    outer.photo = resp.photo;

                    outer.hide(); // 隐藏登录界面
                    outer.root.menu.show(); // 打开菜单界面
                } 

                // 若获取返回信息未成功，则应该弹出登录界面
                else {
                    outer.login(); // 弹出登录界面
                    // outer.register(); // 展示注册界面
                }
            }
        });
    }

    // 隐藏函数
    hide() {
        this.$settings.hide();
    }

    // 显示函数
    show() {
        this.$settings.show();
    }
}//名称和web.html中的let ac_game = new AcGame();中的AcGame()保持一致
export class AcGame {
    //构造函数，类似cpp中的构造函数或者python中的__init__函数
    //参数为id参见web.html
    constructor(id, AcWingOS) {
        // 输出参数AcWingOS，观察其是什么，其本质是一个提供了很多api的对象
        // 通过这个参数可以判断我们是通过web去访问还是通过acapp去访问
        // console.log(AcWingOS) 
        this.id = id; //存下id，传入的id是web.html中div的id
        //创建总对象ac_game：需要利用jquery在web.html中根据id找出div，将这个div存入总对象ac_game中
        this.$ac_game = $('#' + id);

        // 记下AcWingOS
        this.AcWingOS = AcWingOS;

        // 创建settings/zbase.js中的class Settings
        this.settings = new Settings(this);
        
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
