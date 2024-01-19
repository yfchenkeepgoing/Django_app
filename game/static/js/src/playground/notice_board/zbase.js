// 提示牌：地图上方显示的信息栏，告诉我们当前有多少人就绪
class NoticeBoard extends AcGameObject {
    // 构造函数
    constructor(playground) {
        super(); // 调用父类的初始化函数

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 渲染则需要ctx
        this.text = "Ready: 0 Players"; // 初始显示的文本
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
}