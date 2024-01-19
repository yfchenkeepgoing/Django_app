class Rankings {
    constructor(root) {
        this.root = root;
        this.$rankings = $(`
            <div class="ac-game-rankings">
                <div class="rankings-list"></div>
                <button class="rankings-return">返回</button>
            </div>
        `);
        this.$rankings_list = this.$rankings.find('.rankings-list');
        this.$rankings_return = this.$rankings.find('.rankings-return');
        this.root.$playground.append(this.$rankings);
        this.$rankings.hide(); // 默认隐藏排行榜界面
        this.start();
    }

    start() {
        this.getRankings();
        this.$rankings_return.click(() => {
            this.hide(); // 点击返回按钮时隐藏排行榜界面
            this.root.show("menu"); // 并显示菜单界面
        });
    }

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
                // 处理错误情况
                console.error("Failed to fetch rankings:", error);
            }
        });
    }

    renderRankings(rankings) {
        this.$rankings_list.empty();
        rankings.forEach((player, index) => {
            const $player = $(`
                <div class="ranking-item">
                    <span class="rank">${index + 1}</span>
                    <img class="photo" src="${player.photo}" />
                    <span class="username">${player.username}</span>
                    <span class="score">${player.score}</span>
                </div>
            `);
            this.$rankings_list.append($player);
        });
    }

    show() {
        this.$rankings.show();
        this.getRankings(); // 每次显示时都刷新排行榜数据
    }

    hide() {
        this.$rankings.hide();
    }
}
