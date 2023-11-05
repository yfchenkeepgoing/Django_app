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
        this.ctx.fillStyle = "rgba(0, 0, 0)"; //矩形的颜色：黑色，黑色用rgba(0, 0, 0)表示
         //画出矩形，可以查看菜鸟教程html中的画布，四个参数分别是左上角的坐标和右下角的坐标
         //画布左上角的坐标是(0, 0)，右下角的坐标是(width, height)
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        //由于每一帧都需要重绘一遍地图，因此render函数应该是在update中执行，若在start中执行则只会在第一帧执行一次render函数
    }
}