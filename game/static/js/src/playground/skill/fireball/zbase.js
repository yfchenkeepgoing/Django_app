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
}