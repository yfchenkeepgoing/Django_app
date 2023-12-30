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
        this.update_attack();

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
}