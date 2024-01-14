class AcGameMenu{constructor(t){this.root=t,this.$menu=$('\n<div class="ac-game-menu">\n        <div class="ac-game-menu-field">\n            <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">\n                单人模式\n            </div>\n            <br>\n            <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">\n                多人模式\n            </div>\n            <br>\n            <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">\n                退出\n            </div>\n        </div>\n</div>\n'),this.$menu.hide(),this.root.$ac_game.append(this.$menu),this.$single_mode=this.$menu.find(".ac-game-menu-field-item-single-mode"),this.$multi_mode=this.$menu.find(".ac-game-menu-field-item-multi-mode"),this.$settings=this.$menu.find(".ac-game-menu-field-item-settings"),this.start()}start(){this.add_listening_events()}add_listening_events(){let t=this;this.$single_mode.click((function(){t.hide(),t.root.playground.show("single mode")})),this.$multi_mode.click((function(){t.hide(),t.root.playground.show("multi mode")})),this.$settings.click((function(){t.root.settings.logout_on_remote()}))}show(){this.$menu.show()}hide(){this.$menu.hide()}}let last_timestamp,AC_GAME_OBJECTS=[];class AcGameObject{constructor(){AC_GAME_OBJECTS.push(this),this.has_called_start=!1,this.timedelta=0,this.uuid=this.create_uuid()}create_uuid(){let t="";for(let i=0;i<8;i++){t+=parseInt(Math.floor(10*Math.random()))}return t}start(){}update(){}on_destroy(){}destroy(){this.on_destroy();for(let t=0;t<AC_GAME_OBJECTS.length;t++)if(AC_GAME_OBJECTS[t]===this){AC_GAME_OBJECTS.splice(t,1);break}}}let AC_GAME_ANIMATION=function(t){for(let i=0;i<AC_GAME_OBJECTS.length;i++){let s=AC_GAME_OBJECTS[i];s.has_called_start?(s.timedelta=t-last_timestamp,s.update()):(s.start(),s.has_called_start=!0)}last_timestamp=t,requestAnimationFrame(AC_GAME_ANIMATION)};requestAnimationFrame(AC_GAME_ANIMATION);class ChatField{constructor(t){this.playground=t,this.$history=$('<div class="ac-game-chat-field-history">历史记录</div>'),this.$input=$('<input type="text" class="ac-game-chat-field-input">'),this.$history.hide(),this.$input.hide(),this.func_id=null,this.playground.$playground.append(this.$history),this.playground.$playground.append(this.$input),this.start()}start(){this.add_listening_events()}add_listening_events(){let t=this;this.$input.keydown((function(i){if(27===i.which)return t.hide_input(),!1;if(13===i.which){let i=t.playground.root.settings.username,s=t.$input.val();return s&&(t.$input.val(""),t.add_message(i,s),t.playground.mps.send_message(i,s)),!1}}))}render_message(t){return $(`<div>${t}</div>`)}add_message(t,i){this.show_history();let s=`[${t}]${i}`;this.$history.append(this.render_message(s)),this.$history.scrollTop(this.$history[0].scrollHeight)}show_history(){let t=this;this.$history.fadeIn(),this.func_id&&clearTimeout(this.func_id),this.func_id=setTimeout((function(){t.$history.fadeOut(),t.func_id=null}),3e3)}show_input(){this.show_history(),this.$input.show(),this.$input.focus()}hide_input(){this.$input.hide(),this.playground.game_map.$canvas.focus()}}class GameMap extends AcGameObject{constructor(t){super(),this.playground=t,this.$canvas=$("<canvas tabindex=0></canvas>"),this.ctx=this.$canvas[0].getContext("2d"),this.ctx.canvas.width=this.playground.width,this.ctx.canvas.height=this.playground.height,this.playground.$playground.append(this.$canvas)}start(){this.$canvas.focus()}resize(){this.ctx.canvas.width=this.playground.width,this.ctx.canvas.height=this.playground.height,this.ctx.fillStyle="rgba(0, 0, 0, 1)",this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)}update(){this.render()}render(){this.ctx.fillStyle="rgba(0, 0, 0, 0.2)",this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)}}class NoticeBoard extends AcGameObject{constructor(t){super(),this.playground=t,this.ctx=this.playground.game_map.ctx,this.text="已就绪: 0人"}start(){}write(t){this.text=t}update(){this.render()}render(){this.ctx.font="20px serif",this.ctx.fillStyle="white",this.ctx.textAlign="center",this.ctx.fillText(this.text,this.playground.width/2,20)}}class Particle extends AcGameObject{constructor(t,i,s,e,a,n,h,r,l){super(),this.playground=t,this.ctx=this.playground.game_map.ctx,this.x=i,this.y=s,this.radius=e,this.vx=a,this.vy=n,this.color=h,this.speed=r,this.move_length=l,this.friction=.9,this.eps=.01}start(){}update(){if(this.move_length<this.eps||this.speed<this.eps)return this.destroy(),!1;let t=Math.min(this.move_length,this.speed*this.timedelta/1e3);this.x+=this.vx*t,this.y+=this.vy*t,this.speed*=this.friction,this.move_length-=t,this.render()}render(){let t=this.playground.scale;this.ctx.beginPath(),this.ctx.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.ctx.fillStyle=this.color,this.ctx.fill()}}class Player extends AcGameObject{constructor(t,i,s,e,a,n,h,r,l){super(),this.playground=t,this.ctx=this.playground.game_map.ctx,this.x=i,this.y=s,this.vx=0,this.vy=0,this.damage_x=0,this.damage_y=0,this.damage_speed=0,this.friction=.9,this.move_length=0,this.radius=e,this.color=a,this.speed=n,this.character=h,this.username=r,this.photo=l,this.eps=.01,this.spent_time=0,this.fireballs=[],this.cur_skill=null,"robot"!==this.character&&(this.img=new Image,this.img.src=this.photo),"me"===this.character&&(this.fireball_coldtime=3,this.fireball_img=new Image,this.fireball_img.src="https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png",this.blink_coldtime=5,this.blink_img=new Image,this.blink_img.src="https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png")}start(){if(this.playground.player_count++,this.playground.notice_board.write("已就绪: "+this.playground.player_count+"人"),this.playground.player_count>=3&&(this.playground.state="fighting",this.playground.notice_board.write("Fighting")),"me"===this.character)this.add_listening_events();else if("robot"===this.character){let t=Math.random()*this.playground.width/this.playground.scale,i=Math.random()*this.playground.height/this.playground.scale;this.move_to(t,i)}}add_listening_events(){let t=this;this.playground.game_map.$canvas.on("contextmenu",(function(){return!1})),this.playground.game_map.$canvas.mousedown((function(i){if("fighting"!==t.playground.state)return!0;const s=t.ctx.canvas.getBoundingClientRect();if(3===i.which){let e=(i.clientX-s.left)/t.playground.scale,a=(i.clientY-s.top)/t.playground.scale;t.move_to(e,a),"multi mode"===t.playground.mode&&t.playground.mps.send_move_to(e,a)}else if(1===i.which){let e=(i.clientX-s.left)/t.playground.scale,a=(i.clientY-s.top)/t.playground.scale;if("fireball"===t.cur_skill){if(t.fireball_coldtime>t.eps)return!1;let i=t.shoot_fireball(e,a);"multi mode"===t.playground.mode&&t.playground.mps.send_shoot_fireball(e,a,i.uuid)}else if("blink"===t.cur_skill){if(t.blink_coldtime>t.eps)return!1;t.blink(e,a),"multi mode"===t.playground.mode&&t.playground.mps.send_blink(e,a)}t.cur_skill=null}})),this.playground.game_map.$canvas.keydown((function(i){if(13===i.which){if("multi mode"===t.playground.mode)return t.playground.chat_field.show_input(),!1}else 27===i.which&&"multi mode"===t.playground.mode&&t.playground.chat_field.hide_input();return"fighting"!==t.playground.state||(81===i.which?t.fireball_coldtime>t.eps||(t.cur_skill="fireball",!1):70===i.which?t.blink_coldtime>t.eps||(t.cur_skill="blink",!1):void 0)}))}shoot_fireball(t,i){let s=this.x,e=this.y,a=Math.atan2(i-this.y,t-this.x),n=Math.cos(a),h=Math.sin(a),r=new Fireball(this.playground,this,s,e,.01,n,h,"orange",.5,1,.01);return this.fireballs.push(r),this.fireball_coldtime=3,r}destroy_fireball(t){for(let i=0;i<this.fireballs.length;i++){let s=this.fireballs[i];if(s.uuid===t){s.destroy();break}}}blink(t,i){let s=this.x,e=this.y,a=this.get_dist(s,e,t,i);a=Math.min(a,.8);let n=Math.atan2(i-e,t-s);this.x+=a*Math.cos(n),this.y+=a*Math.sin(n),this.blink_coldtime=5,this.move_length=0}get_dist(t,i,s,e){let a=t-s,n=i-e;return Math.sqrt(a*a+n*n)}move_to(t,i){this.move_length=this.get_dist(this.x,this.y,t,i);let s=Math.atan2(i-this.y,t-this.x);this.vx=Math.cos(s),this.vy=Math.sin(s)}is_attacked(t,i){for(let t=0;t<20+10*Math.random();t++){let t=this.x,i=this.y,s=this.radius*Math.random()*.1,e=2*Math.PI*Math.random(),a=Math.cos(e),n=Math.sin(e),h=this.color,r=10*this.speed,l=this.radius*Math.random()*5;new Particle(this.playground,t,i,s,a,n,h,r,l)}if(this.radius-=i,this.radius<this.eps)return this.destroy(),!1;this.damage_x=Math.cos(t),this.damage_y=Math.sin(t),this.damage_speed=100*i,this.speed*=.8}receive_attack(t,i,s,e,a,n){n.destroy_fireball(a),this.x=t,this.y=i,this.is_attacked(s,e)}update(){this.spent_time+=this.timedelta/1e3,"me"===this.character&&"fighting"===this.playground.state&&this.update_coldtime(),this.update_move(),this.render()}update_coldtime(){this.fireball_coldtime-=this.timedelta/1e3,this.fireball_coldtime=Math.max(this.fireball_coldtime,0),this.blink_coldtime-=this.timedelta/1e3,this.blink_coldtime=Math.max(this.blink_coldtime,0)}update_move(){if("robot"===this.character&&this.spent_time>4&&Math.random()<1/300){let t=this.playground.players[Math.floor(Math.random()*this.playground.players.length)],i=t.x+t.speed*this.vx*this.timedelta/1e3*.3,s=t.y+t.speed*this.vy*this.timedelta/1e3*.3;this.shoot_fireball(i,s)}if(this.damage_speed>this.eps)this.vx=this.vy=0,this.move_length=0,this.x+=this.damage_x*this.damage_speed*this.timedelta/1e3,this.y+=this.damage_y*this.damage_speed*this.timedelta/1e3,this.damage_speed*=this.friction;else if(this.move_length<this.eps){if(this.move_length=0,this.vx=this.vy=0,"robot"===this.character){let t=Math.random()*this.playground.width/this.playground.scale,i=Math.random()*this.playground.height/this.playground.scale;this.move_to(t,i)}}else{let t=Math.min(this.move_length,this.speed*this.timedelta/1e3);this.x+=this.vx*t,this.y+=this.vy*t,this.move_length-=t}}render(){let t=this.playground.scale;"robot"!==this.character?(this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.ctx.stroke(),this.ctx.clip(),this.ctx.drawImage(this.img,(this.x-this.radius)*t,(this.y-this.radius)*t,2*this.radius*t,2*this.radius*t),this.ctx.restore()):(this.ctx.beginPath(),this.ctx.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.ctx.fillStyle=this.color,this.ctx.fill()),"me"===this.character&&"fighting"===this.playground.state&&this.render_skill_coldtime()}render_skill_coldtime(){let t=1.5,i=.9,s=.04,e=this.playground.scale;this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(t*e,i*e,s*e,0,2*Math.PI,!1),this.ctx.stroke(),this.ctx.clip(),this.ctx.drawImage(this.fireball_img,(t-s)*e,(i-s)*e,2*s*e,2*s*e),this.ctx.restore(),this.fireball_coldtime>0&&(this.ctx.beginPath(),this.ctx.moveTo(t*e,i*e),this.ctx.arc(t*e,i*e,s*e,0-Math.PI/2,2*Math.PI*(1-this.fireball_coldtime/3)-Math.PI/2,!0),this.ctx.lineTo(t*e,i*e),this.ctx.fillStyle="rgba(0, 0, 255, 0.6)",this.ctx.fill()),t=1.62,i=.9,s=.04,this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(t*e,i*e,s*e,0,2*Math.PI,!1),this.ctx.stroke(),this.ctx.clip(),this.ctx.drawImage(this.blink_img,(t-s)*e,(i-s)*e,2*s*e,2*s*e),this.ctx.restore(),this.blink_coldtime>0&&(this.ctx.beginPath(),this.ctx.moveTo(t*e,i*e),this.ctx.arc(t*e,i*e,s*e,0-Math.PI/2,2*Math.PI*(1-this.blink_coldtime/5)-Math.PI/2,!0),this.ctx.lineTo(t*e,i*e),this.ctx.fillStyle="rgba(0, 0, 255, 0.6)",this.ctx.fill())}on_destroy(){"me"===this.character&&(this.playground.state="over");for(let t=0;t<this.playground.players.length;t++)if(this.playground.players[t]==this){this.playground.players.splice(t,1);break}}}class Fireball extends AcGameObject{constructor(t,i,s,e,a,n,h,r,l,o,c){super(),this.playground=t,this.player=i,this.ctx=this.playground.game_map.ctx,this.x=s,this.y=e,this.vx=n,this.vy=h,this.radius=a,this.color=r,this.speed=l,this.move_length=o,this.damage=c,this.eps=.01}start(){}update(){if(this.move_length<this.eps)return this.destroy(),!1;this.update_move(),"enemy"!==this.player.character&&this.update_attack(),this.render()}update_move(){let t=Math.min(this.move_length,this.speed*this.timedelta/1e3);this.x+=this.vx*t,this.y+=this.vy*t,this.move_length-=t}update_attack(){for(let t=0;t<this.playground.players.length;t++){let i=this.playground.players[t];if(this.player!==i&&this.is_collision(i)){this.attack(i);break}}}get_dist(t,i,s,e){let a=t-s,n=i-e;return Math.sqrt(a*a+n*n)}is_collision(t){return this.get_dist(this.x,this.y,t.x,t.y)<this.radius+t.radius}attack(t){let i=Math.atan2(t.y-this.y,t.x-this.x);t.is_attacked(i,this.damage),"multi mode"===this.playground.mode&&this.playground.mps.send_attack(t.uuid,t.x,t.y,i,this.damage,this.uuid),this.destroy()}render(){let t=this.playground.scale;this.ctx.beginPath(),this.ctx.arc(this.x*t,this.y*t,this.radius*t,0,2*Math.PI,!1),this.ctx.fillStyle=this.color,this.ctx.fill()}on_destroy(){let t=this.player.fireballs;for(let i=0;i<t.length;i++)if(t[i]===this){t.splice(i,1);break}}}class MultiPlayerSocket{constructor(t){this.playground=t,this.ws=new WebSocket("wss://app5894.acapp.acwing.com.cn/wss/multiplayer/"),this.start()}start(){this.receive()}receive(){let t=this;this.ws.onmessage=function(i){let s=JSON.parse(i.data),e=s.uuid;if(e===t.uuid)return!1;let a=s.event;"create_player"===a?t.receive_create_player(e,s.username,s.photo):"move_to"===a?t.receive_move_to(e,s.tx,s.ty):"shoot_fireball"===a?t.receive_shoot_fireball(e,s.tx,s.ty,s.ball_uuid):"attack"===a?t.receive_attack(e,s.attackee_uuid,s.x,s.y,s.angle,s.damage,s.ball_uuid):"blink"===a?t.receive_blink(e,s.tx,s.ty):"message"===a&&t.receive_message(e,s.username,s.text)}}send_create_player(t,i){this.ws.send(JSON.stringify({event:"create_player",uuid:this.uuid,username:t,photo:i}))}get_player(t){let i=this.playground.players;for(let s=0;s<i.length;s++){let e=i[s];if(e.uuid===t)return e}return null}receive_create_player(t,i,s){let e=new Player(this.playground,this.playground.width/2/this.playground.scale,.5,.05,"white",.15,"enemy",i,s);e.uuid=t,this.playground.players.push(e)}send_move_to(t,i){this.ws.send(JSON.stringify({event:"move_to",uuid:this.uuid,tx:t,ty:i}))}receive_move_to(t,i,s){let e=this.get_player(t);e&&e.move_to(i,s)}send_shoot_fireball(t,i,s){this.ws.send(JSON.stringify({event:"shoot_fireball",uuid:this.uuid,tx:t,ty:i,ball_uuid:s}))}receive_shoot_fireball(t,i,s,e){let a=this.get_player(t);if(a){a.shoot_fireball(i,s).uuid=e}}send_attack(t,i,s,e,a,n){this.ws.send(JSON.stringify({event:"attack",uuid:this.uuid,attackee_uuid:t,x:i,y:s,angle:e,damage:a,ball_uuid:n}))}receive_attack(t,i,s,e,a,n,h){let r=this.get_player(t),l=this.get_player(i);r&&l&&l.receive_attack(s,e,a,n,h,r)}send_blink(t,i){this.ws.send(JSON.stringify({event:"blink",uuid:this.uuid,tx:t,ty:i}))}receive_blink(t,i,s){let e=this.get_player(t);e&&e.blink(i,s)}send_message(t,i){this.ws.send(JSON.stringify({event:"message",uuid:this.uuid,username:t,text:i}))}receive_message(t,i,s){this.playground.chat_field.add_message(i,s)}}class AcGamePlayground{constructor(t){this.root=t,this.$playground=$('<div class="ac-game-playground"></div>'),this.hide(),this.root.$ac_game.append(this.$playground),this.start()}get_random_color(){return["blue","red","pink","grey","green"][Math.floor(5*Math.random())]}create_uuid(){let t="";for(let i=0;i<8;i++){t+=parseInt(Math.floor(10*Math.random()))}return t}start(){let t=this,i=this.create_uuid();$(window).on(`resize.${i}`,(function(){t.resize()})),this.root.AcWingOS&&this.root.AcWingOS.api.window.on_close((function(){$(window).off(`resize.${i}`)}))}resize(){this.width=this.$playground.width(),this.height=this.$playground.height();let t=Math.min(this.width/16,this.height/9);this.width=16*t,this.height=9*t,this.scale=this.height,this.game_map&&this.game_map.resize()}update(){}show(t){let i=this;if(this.$playground.show(),this.width=this.$playground.width(),this.height=this.$playground.height(),this.game_map=new GameMap(this),this.mode=t,this.state="waiting",this.notice_board=new NoticeBoard(this),this.player_count=0,this.resize(),this.players=[],this.players.push(new Player(this,this.width/2/this.scale,.5,.05,"white",.15,"me",this.root.settings.username,this.root.settings.photo)),"single mode"===t)for(let t=0;t<5;t++)this.players.push(new Player(this,this.width/2/this.scale,.5,.05,this.get_random_color(),.15,"robot"));else"multi mode"===t&&(this.chat_field=new ChatField(this),this.mps=new MultiPlayerSocket(this),this.mps.uuid=this.players[0].uuid,this.mps.ws.onopen=function(){i.mps.send_create_player(i.root.settings.username,i.root.settings.photo)})}hide(){this.$playground.hide()}}class Settings{constructor(t){this.root=t,this.platform="WEB",this.root.AcWingOS&&(this.platform="ACAPP"),this.username="",this.photo="",this.$settings=$('\n<div class = "ac-game-settings">\n\n    <div class="ac-game-settings-login">\n\n        <div class="ac-game-settings-title">\n            登录\n        </div>\n\n        <div class="ac-game-settings-username">\n            <div class="ac-game-settings-item">\n                <input type="text" placeholder="用户名">\n            </div>\n        </div>\n\n        <div class="ac-game-settings-password">\n            <div class="ac-game-settings-item">\n                <input type="password" placeholder="密码">\n            </div> \n        </div>\n\n        <div class="ac-game-settings-submit">\n            <div class="ac-game-settings-item">\n                <button>登录</button>\n            </div>\n        </div>\n\n        <div class="ac-game-settings-error-message">\n        </div>\n\n        <div class="ac-game-settings-option">\n            注册\n        </div>\n\n        <br>\n        <div class="ac-game-settings-acwing">\n            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/third_party_login_logo.png">\n            <br>\n            <div>\n                AcWing一键登录\n            </div>\n        </div>\n\n        <br>\n        <div class="ac-game-settings-github">\n            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/github_login_logo.png">\n            <br>\n            <div>\n                GitHub一键登录\n            </div>\n        </div>\n\n    </div>\n\n    <div class="ac-game-settings-register">\n    \n        <div class="ac-game-settings-title">\n            注册\n        </div>\n\n        <div class="ac-game-settings-username">\n            <div class="ac-game-settings-item">\n                <input type="text" placeholder="用户名">\n            </div>\n        </div>\n\n        <div class="ac-game-settings-password ac-game-settings-password-first">\n            <div class="ac-game-settings-item">\n                <input type="password" placeholder="密码">\n            </div> \n        </div>\n\n        <div class="ac-game-settings-password ac-game-settings-password-second">\n            <div class="ac-game-settings-item">\n                <input type="password" placeholder="确认密码">\n            </div> \n        </div>\n\n        <div class="ac-game-settings-submit">\n            <div class="ac-game-settings-item">\n                <button>注册</button>\n            </div>\n        </div>\n\n        <div class="ac-game-settings-error-message">\n        </div>\n\n        <div class="ac-game-settings-option">\n            登录\n        </div>\n\n        <br>\n        <div class="ac-game-settings-acwing">\n            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/third_party_login_logo.png">\n            <br>\n            <div>\n                AcWing一键登录\n            </div>\n        </div>\n\n        <br>\n        <div class="ac-game-settings-github">\n            <img width="30" src="https://app5894.acapp.acwing.com.cn/static/image/settings/github_login_logo.png">\n            <br>\n            <div>\n                GitHub一键登录\n            </div>\n        </div>\n\n    </div>\n\n</div>\n'),this.$login=this.$settings.find(".ac-game-settings-login"),this.$login_username=this.$login.find(".ac-game-settings-username input"),this.$login_password=this.$login.find(".ac-game-settings-password input"),this.$login_submit=this.$login.find(".ac-game-settings-submit button"),this.$login_error_message=this.$login.find(".ac-game-settings-error-message"),this.$login_register=this.$login.find(".ac-game-settings-option"),this.$login.hide(),this.$register=this.$settings.find(".ac-game-settings-register"),this.$register_username=this.$register.find(".ac-game-settings-username input"),this.$register_password=this.$register.find(".ac-game-settings-password-first input"),this.$register_password_confirm=this.$register.find(".ac-game-settings-password-second input"),this.$register_submit=this.$register.find(".ac-game-settings-submit button"),this.$register_error_message=this.$register.find(".ac-game-settings-error-message"),this.$register_login=this.$register.find(".ac-game-settings-option"),this.$register.hide(),this.$acwing_login=this.$settings.find(".ac-game-settings-acwing img"),this.$github_login=this.$settings.find(".ac-game-settings-github img"),this.root.$ac_game.append(this.$settings),this.start()}start(){"ACAPP"===this.platform?this.getinfo_acapp():(this.getinfo_web(),this.add_listening_events())}add_listening_events(){let t=this;this.add_listening_events_login(),this.add_listening_events_register(),this.$acwing_login.click((function(){t.acwing_login()})),this.$github_login.click((function(){t.github_login()}))}add_listening_events_login(){let t=this;this.$login_register.click((function(){t.register()})),this.$login_submit.click((function(){t.login_on_remote()}))}add_listening_events_register(){let t=this;this.$register_login.click((function(){t.login()})),this.$register_submit.click((function(){t.register_on_remote()}))}acwing_login(){$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/acwing/web/apply_code/",type:"GET",success:function(t){"success"===t.result&&window.location.replace(t.apply_code_url)}})}github_login(){$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/acwing/web/apply_code_github/",type:"GET",success:function(t){"success"===t.result&&window.location.replace(t.apply_code_url)}})}login_on_remote(){let t=this,i=this.$login_username.val(),s=this.$login_password.val();this.$login_error_message.empty(),$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/login/",type:"GET",data:{username:i,password:s},success:function(i){"success"===i.result?location.reload():t.$login_error_message.html(i.result)}})}register_on_remote(){let t=this,i=this.$register_username.val(),s=this.$register_password.val(),e=this.$register_password_confirm.val();this.$register_error_message.empty(),$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/register/",type:"GET",data:{username:i,password:s,password_confirm:e},success:function(i){"success"===i.result?location.reload():t.$register_error_message.html(i.result)}})}logout_on_remote(){"ACAPP"===this.platform?this.root.AcWingOS.api.window.close():$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/logout/",type:"GET",success:function(t){"success"===t.result&&location.reload()}})}register(){this.$login.hide(),this.$register.show()}login(){this.$register.hide(),this.$login.show()}acapp_login(t,i,s,e){let a=this;this.root.AcWingOS.api.oauth2.authorize(t,i,s,e,(function(t){"success"===t.result&&(a.username=t.username,a.photo=t.photo,a.hide(),a.root.menu.show())}))}getinfo_acapp(){let t=this;$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",type:"GET",success:function(i){"success"===i.result&&t.acapp_login(i.appid,i.redirect_uri,i.scope,i.state)}})}getinfo_web(){let t=this;$.ajax({url:"https://app5894.acapp.acwing.com.cn/settings/getinfo/",type:"GET",data:{platform:t.platform},success:function(i){"success"==i.result?(t.username=i.username,t.photo=i.photo,t.hide(),t.root.menu.show()):t.login()}})}hide(){this.$settings.hide()}show(){this.$settings.show()}}export class AcGame{constructor(t,i){this.id=t,this.$ac_game=$("#"+t),this.AcWingOS=i,this.settings=new Settings(this),this.menu=new AcGameMenu(this),this.playground=new AcGamePlayground(this),this.start()}start(){}}
