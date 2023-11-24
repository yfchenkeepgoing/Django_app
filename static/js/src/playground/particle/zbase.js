class Particle extends AcGameObject {
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
}