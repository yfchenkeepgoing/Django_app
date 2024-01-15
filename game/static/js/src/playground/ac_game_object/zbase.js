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

    // 仿照unity3D添加late_update函数，在每一帧的最后执行一次
    // 即在所有ac game object的update执行完后，再去执行late_update
    // 渲染胜/败就放入late_update中，就可以保证胜/败被渲染在所有图层的上面
    late_update() {

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

// console.log("run!"); // 调试用，展示全局变量的问题

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

    // 调用late_update
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        obj.late_update();
    }
    
    last_timestamp = timestamp; //更新last_timestamp
    
    requestAnimationFrame(AC_GAME_ANIMATION); //递归
}

//触发第一次调用: 下面这行代码手动触发了AC_GAME_ANIMATION的第一次调用。
//通过调用requestAnimationFrame()并将AC_GAME_ANIMATION作为参数传入，来告诉浏览器在下一次重绘前调用AC_GAME_ANIMATION函数
//当浏览器准备好进行下一次重绘时，它会自动调用AC_GAME_ANIMATION函数，并传入一个时间戳（timestamp）表示当前时间。
requestAnimationFrame(AC_GAME_ANIMATION);  

