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
                Single Player
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                Multi Player
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-rankings">
                Rankings
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                Exit
            </div>
        </div>
</div>
`);
        this.$menu.hide(); // 写登录界面时先关闭菜单界面
        this.root.$ac_game.append(this.$menu); //将菜单页面类的对象menu按照定义时的样式插入总对象ac_game中

        // jquery中有find函数，可以在menu中找到某一个class对应的对象,注意class名前面要加上.，id前要加上#，这是jquery的语法
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');  // single按钮
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode'); //multi按钮
        this.$rankings = this.$menu.find('.ac-game-menu-field-item-rankings') // rankings按钮
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

        // 当rankings按钮被点击时，会自动调用以下函数
        this.$rankings.click(function(){
            // console.log("click rankings"); // 调试用
            outer.hide(); // 关闭菜单页面
            outer.root.rankings.show();
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
