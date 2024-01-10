//Player也是一个游戏对象，因此也需要从AcGameObject中扩展出来
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
                return true; // return false是阻止默认事件的发生(点击事件不会继续处理)

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

                    // 多人模式下广播闪现函数
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }
                outer.cur_skill = null; // 当前技能被释放掉
            }
        });

        // 用window来获取按键, e表示传入一个事件, 可以查询网上的keycode对照表
        // 火球用q键开启，q键的keycode是81
        this.playground.game_map.$canvas.keydown(function(e) {
            // 游戏开始前就可以聊天
            // enter键和ESC键的编号分别为13和27
            if (e.which === 13) { // enter键
                // 单人模式下不需要聊天，多人模式下才需要聊天
                if (outer.playground.mode === "multi mode") { // 打开聊天框
                    outer.playground.chat_field.show_input(); // 调用chat_field中的show_input函数展示输入内容
                    return false;
                }
            } else if (e.which === 27) { // esc键
                if (outer.playground.mode === "multi mode") { // 关闭聊天框
                    outer.playground.chat_field.hide_input(); // 调用chat_field中的hide_input函数隐藏输入内容
                }
            }

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
        // 当前player死后，当前playground的状态改为over，不能再做任何移动或者发炮的操作
        if (this.character === "me")
            this.playground.state = "over";

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] == this) {
                this.playground.players.splice(i, 1);
                break; // 删完后退出循环，可以提高程序运行效率
            }
        }
    }
}
