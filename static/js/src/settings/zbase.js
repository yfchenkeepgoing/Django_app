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

        <div class="ac-game-settings-error-message">
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

        <br>
        <div class="ac-game-settings-github">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/github_login_logo.png">
            <br>
            <div>
                GitHub一键登录
            </div>
        </div>

    </div>

    <div class="ac-game-settings-register">
    
        <div class="ac-game-settings-title">
            注册
        </div>

        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div> 
        </div>

        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div> 
        </div>

        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class="ac-game-settings-option">
            登录
        </div>

        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/third_party_login_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>

        <br>
        <div class="ac-game-settings-github">
            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/github_login_logo.png">
            <br>
            <div>
                GitHub一键登录
            </div>
        </div>

    </div>

</div>
`);
        // 登录界面
        this.$login = this.$settings.find(".ac-game-settings-login");

        // 索引username中的input，即在html的username模块寻找input
        // 由于input和username模块不在同一级，因此应该用空格隔开，而非>
        // 用>隔开说明input和username是相邻的两级
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        // 索引password中的input
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        // 索引submit模块中的button按钮
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        // 索引error message，由于其中什么也没有，因此直接索引本体即可
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        // 索引option（登录页面的注册按钮），由于其中什么也没有，因此直接索引本体即可
        this.$login_register = this.$login.find(".ac-game-settings-option");

        // 默认隐藏登录界面
        this.$login.hide();
        
        // 注册界面
        this.$register = this.$settings.find(".ac-game-settings-register");
        // 同理，也需要索引出login中索引出的相应内容
        // 索引username
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        // 索引password
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        // 索引确认password
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        // 索引submit
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        // 索引error message
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        // 索引option（注册页面的登录按钮）
        this.$register_login = this.$register.find(".ac-game-settings-option");

        // 默认隐藏注册界面
        this.$register.hide();

        // 索引acwing一键登录图标
        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img')

        // 索引github一键登录图标
        this.$github_login = this.$settings.find('.ac-game-settings-github img')

        //将settings加到窗口中去
        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    // 创建之初需要执行的函数
    start() {
        // acapp端则执行其相应的getinfo函数, acapp端也不需要绑定监听函数
        // 因为监听函数用于操作登录和注册界面的按钮，而acapp端用不到这些信息
        // 不加监听函数可以使acapp运行更加流畅
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else { // web端执行其相应的getinfo函数
            this.getinfo_web();
            this.add_listening_events(); // 绑定监听函数
        }
    }

    // 写一个专门的函数来绑定事件，其中包含登录界面的监听函数和注册界面的监听函数
    add_listening_events() {
        let outer = this;
        this.add_listening_events_login(); // 登录界面的监听函数
        this.add_listening_events_register(); // 注册界面的监听函数

        // acwing一键登录图标的监听函数
        // 若点击这个图标，则调用acwing_login
        this.$acwing_login.click(function() {
            outer.acwing_login();
        });

        // github一键登录图标的监听函数
        this.$github_login.click(function() {
            outer.github_login();
        });
    }

    // 登录界面的监听函数
    add_listening_events_login() {
        // 凡是有click函数，外面都定义outer
        let outer = this;

        // 登录界面的注册按钮点完后要跳到注册界面
        this.$login_register.click(function() {
            outer.register(); // 跳到注册界面
        });

        // 给登录界面的登录按钮加一个监听函数
        this.$login_submit.click(function() {
            outer.login_on_remote(); // 调用在远程服务器上登录的函数
        });
    }

    // 注册界面的监听函数
    add_listening_events_register() {
        // 凡是有click函数，外面都定义outer
        let outer = this;

        // 注册界面的登录按钮点完后要跳到登录界面
        this.$register_login.click(function() {
            outer.login(); // 跳到注册界面
        });

        // 绑定点击注册界面注册按钮的动作到注册函数
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    // acwing一键登录的前端和后端交互的函数
    acwing_login() {
        // console.log("click acwing login") // 先不产生作用，直接输出，用于调试
        // 改为ajax
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            // 无需传数据，因此只需要成功函数
            success: function(resp) {
                // console.log(resp);
                // 成功，则将当前页面重定向
                // resp.result和resp.apply_code_url和apply_code.py中的写法保持一致
                if (resp.result === "success") {
                    // 调用重定向的api, 重定向到acwing申请授权界面
                    window.location.replace(resp.apply_code_url); 
                }
            }
        });
    }

    // github一键登录的前端和后端交互的函数
    github_login() {
        // console.log("click github login") // 用于调试
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/acwing/web/apply_code_github/",
            type: "GET",
            // 无需传数据，因此只需要成功函数
            success: function(resp) {
                // console.log(resp);
                // 成功，则将当前页面重定向
                // resp.result和resp.apply_code_url和apply_code.py中的写法保持一致
                if (resp.result === "success") {
                    // 调用重定向的api, 重定向到acwing申请授权界面
                    window.location.replace(resp.apply_code_url); 
                }
            }
        });
    }

    // 在远程服务器上登录的函数，是一个ajax
    // 点击登录界面的登录按钮时登录，因此给这个按钮绑定一个触发函数
    login_on_remote() {
        let outer = this;
        let username = this.$login_username.val(); // 取出login_username的值
        let password = this.$login_password.val(); // 取出login_password的值
        // 每次登录时，清空上一次的login_error_message
        this.$login_error_message.empty();

        // 调用服务器的登录函数
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) { // 返回值为后端传回来的一个字典，将其传入参数resp中
                // console.log(resp) // 输出resp，看对不对
                // 三等号用于比较
                // 若登录成功，则刷新，在cookie中会记录已经登录成功，刷新页面后进入菜单界面
                if (resp.result === "success") {
                    location.reload(); 
                } else {
                    outer.$login_error_message.html(resp.result); // 登录失败则显示用户名或密码不正确       
                }
            }
        });
    }

    // 在远程服务器上注册的函数
    register_on_remote() {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        
        this.$register_error_message.empty(); // 清空error message

        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/register/",
            type: "GET", // 按理来说应该用POST，凡是改数据库都要用POST, 此处为方便调试用GET
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },

            // 回调函数，后端返回的字典被传入resp种
            success: function(resp) {
                // console.log(resp); // 输出结果，便于调试
                // 判断是否成功
                if (resp.result === "success") {
                    // 刷新页面，注册成功后刷新页面就进入登录状态，打开菜单，因为register.py中有login
                    location.reload(); 
                } else {
                    // 否则直接将错误信息通过error message展现出来
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    // 在远程服务器上登出的函数
    logout_on_remote() {
        // 若前端是acapp，则不需要退出，acapp中关掉游戏界面就算是退出
        // 调用api实现菜单界面的退出功能
        if (this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close(); // yxc提供的关闭窗口的api
        } else {
            // 若前端是web，则有如下的登出操作
            $.ajax({
                url: "https://app5894.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                // 退出不需要参数，因此不需要data
                success: function(resp) {
                    // console.log(resp); // 输出后端返回的结果，用于调试
                    // 后端返回的resp的result必定为success
                    if (resp.result === "success") {
                        location.reload(); // 刷新页面
                    }
                }
            });
        }
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

    // 发起授权的函数
    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        // 请求授权码的API
        // 标准格式AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, callback)
        // 其中callback需要自定义一个函数来实现，其返回值是resp
        // resp是redirect_uri的返回值，redirect_uri就是receive_code函数
        // 因此resp是receive_code函数的返回值。返回值为用户名和头像（有待实现）
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            // console.log("called from acapp_login function"); // 方便显示下面的输出的来源
            // console.log(resp); // 输出，看返回结果是否正确
            if (resp.result === "success") {
                // 成功获取用户名和头像，后面和web端的getinfo函数逻辑相同
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide(); // 隐藏当前的settings页面
                outer.root.menu.show(); // 显示菜单界面
            }
        });

    }

    // acapp端的getinfo函数，因为acapp端一定没有登录，所以需要单独写
    // acapp端：直接从后台获取授权登录的4个参数即可
    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    // 发起授权，需要传入4个参数，对应于apply_code.py返回的结果
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state); 
                }
            }
        });
    }

    // web端的getinfo函数：从服务器端获取用户信息（用户名和头像）的函数
    // 需要记住这是怎么写的，用ajax来写，ajax中传一个字典
    // 其中包括getinfo函数显示在网站端的完整路径，这是因为本项目不仅要跑在web端还要跑在acapp端
    getinfo_web() {
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
                // console.log(resp); // 打印getinfo.py的返回值
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
                    // outer.register(); // 展示注册界面
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