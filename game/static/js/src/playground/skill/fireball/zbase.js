class Fireball extends AcGameObject {
    // 火球在攻击完别人后，需要一个计分系统，让后台知道是谁发的技能，同时自己发的火球不能打中自己，因此需要传入发出火球的玩家player作为参数
    // constructor函数类似player的zbase.js中的constructor函数
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length) {
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
        this.eps = 0.1 // 精度，小于0.1就认为是0
    }

    start() {

    }

    update() {
        // 不移动火球
        if (this.move_length < this.eps) {
            this.destroy(); // 删除火球，destroy函数在ac_game_object中实现了
            return false;
        }

        // 移动火球
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 同player
        this.x += this.vx * moved; // 方向乘上距离（dcosθ）
        this.y += this.vy * moved; // dsinθ
        this.move_length -= moved; // 更新移动后的需要移动的距离
        
        this.render(); 
    }

    render() { // 类似player的zbase.js中的render函数
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}