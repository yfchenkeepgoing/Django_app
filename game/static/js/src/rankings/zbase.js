class Rankings {
    constructor(root) {
        this.root = root;

        this.$rankings = $(`
            <div class="ac-game-rankings">
                <div class="rankings-title">
                    <div class="rankings-header">Username</div>
                    <div class="rankings-header">Score</div>
                    <div class="rankings-header">Ranking</div>
                </div>
                <div class="rankings-list"></div>
                <button class="rankings-return">Back</button>
            </div>
        `);

        // 将html对象rankings-list中的内容归为一类
        this.$rankings_list = this.$rankings.find('.rankings-list');
        this.$rankings_return = this.$rankings.find('.rankings-return'); // 同理
        this.root.$ac_game.append(this.$rankings); // 将rankings插入总对象

        this.$rankings.hide(); // 先隐藏rankings

        this.start();
    }

    start() {
        // 点击返回按钮，则隐藏rankings页面，显示菜单页面
        this.$rankings_return.click(() => {
            this.$rankings.hide();
            this.root.menu.show();
        });
        this.getRankings(); // 更新排名信息
    }

    // 通过向后端发送带有验证信息的链接，获取排名信息
    getRankings() {
        $.ajax({
            url: "https://app5894.acapp.acwing.com.cn/settings/ranklist/",
            type: "get",
            headers: {
                'Authorization': "Bearer " + this.root.access,
            },
            success: (resp) => {
                this.renderRankings(resp);
            },
            error: (xhr, status, error) => {
                console.error("Failed to fetch rankings:", error);
            }
        });
    }

    // 渲染排名信息
    renderRankings(rankings) {
        this.$rankings_list.empty(); // 每次渲染前先清空上一次渲染的结果
        // 渲染每个player的信息
        rankings.forEach((player, index) => {
            const $player = $(`
                <div class="ranking-item">
                    <div class="rankings-username">${player.username}</div>
                    <div class="rankings-score">${player.score}</div>
                    <div class="rankings-rank">${index + 1}</div>
                </div>
            `);
            this.$rankings_list.append($player); // 将每个player的信息依次插入到rankings_list中
        });
    }

    show() {
        this.$rankings.show();
        this.getRankings(); // Refresh rankings data every time it is shown
    }

    hide() {
        this.$rankings.hide();
    }
}
