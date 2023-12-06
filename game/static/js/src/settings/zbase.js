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
        <div class="ac-game-settings-error-messages">
            用户密码错误
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
    </div>
    <div class="ac-game-settings-register">
    </div>
</div>
`);
        // 登录界面
        this.$login = this.$settings.find(".ac-game-settings-login");
        // 默认隐藏登录界面
        this.$login.hide();
        
        // 注册界面
        this.$register = this.$settings.find(".ac-game-settings-register");
        // 默认隐藏注册界面
        this.$register.hide();

        //将settings加到窗口中去
        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    // 创建之初需要执行的函数
    start() {
        this.getinfo(); // 创建之初需要从服务器端获取用户信息，因此需要函数getinfo
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

    // 从服务器端获取用户信息的函数
    // 需要记住这是怎么写的，用ajax来写，ajax中传一个字典
    // 其中包括getinfo函数显示在网站端的完整路径，这是因为本项目不仅要跑在web端还要跑在acapp端
    getinfo() {
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
                console.log(resp); // 打印getinfo.py的返回值
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
}