// 聊天框不画在canvas地图中，它仅仅是一个html元素，因此不需要继承自AcGameObject
class ChatField {
    // 构造函数
    constructor(playground) {
        this.playground = playground;

        // 历史记录区域
        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);

        // 输入区域
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        // 初始时，两区域都隐藏
        this.$history.hide(); // hide是jquery的api，可以隐藏掉一个元素
        this.$input.hide();

        this.func_id = null; // 记录下函数的id，方便在打开输入框后删去之前展示历史记录的计时函数

        // 将两区域加入地图中
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    // 监听函数
    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) { // esc: 27
                // 此时不需判断是否是多人模式，单人模式下不需打开和退出聊天框
                outer.hide_input(); // 关闭聊天框
                return false;
            } else if (e.which === 13) {
                // 按下enter键，调用将输入的信息添加到历史记录中的函数
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();

                // 若信息不为空
                if (text) {
                    // 清空输入框
                    outer.$input.val("");
                    // 调用将输入的信息添加到历史记录中的函数
                    outer.add_message(username, text);
                }
                return false; // 回车按键不继续向后传递
            }
        });
    }

    // 渲染函数：起到将字符串封装为html对象的作用
    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    // 在历史记录中添加新信息
    // 两个参数：发送消息的人，发送的内容
    add_message(username, text) {
        this.show_history(); // 每次添加新信息时，需要展示历史记录
        let message = `[${username}]${text}`; // js语法：中括号内部写人名，中括号外部写信息
        // 渲染message并将其添加到history中
        this.$history.append(this.render_message(message));
        // 将历史记录的滚动条移到最下面
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    // 展示历史记录的函数
    show_history() {
        let outer = this;
        // this.show()瞬间出来，不好看，改为慢慢出来
        this.$history.fadeIn(); // fadeIn: 慢慢显示出来

        if (this.func_id) clearTimeout(this.func_id); // 若之前存在setTimeout函数，则将其删去，重新开始计时并显示3秒

        // 显示3秒，即3秒后关闭
        this.func_id = setTimeout(function() {
            outer.$history.fadeOut(); // 慢慢消失
            outer.func_id = null; // 函数结束后删去func_id
        }, 3000); 
    }

    // 展示输入内容
    show_input() {
        // 打开输入框时就应该看到历史记录
        this.show_history();

        this.$input.show();
        // 要先聚焦，才能在任何一个元素上输入内容
        this.$input.focus();
    }

    // 隐藏输入内容
    hide_input() {
        this.$input.hide();

        // input关闭后，重新聚焦到地图上
        this.playground.game_map.$canvas.focus();
    }
}