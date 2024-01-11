namespace py match_service

/*为了简单，不写结构体，只写service即可*/

/*service中为了方便，暂且不实现remove user，只实现add user*/
/*要实现remove user前端要加若干按钮，后端要加很多api, thrift还要加很多逻辑，太麻烦*/
/*remove user和add user逻辑相同，课上用后者举例即可*/
service Match {
    /*
    uuid: player的唯一id
    photo: player的头像
    channel_name: 在匹配系统中完成匹配后，必须通知web server
    匹配系统的进程如何通知到web server的进程？
    django channels提供了一个api，让channels进程外的其他进程可以通过channel_name来通知到channels中的进程
    因此，channel_name用于匹配成功后通知web server
    */
    i32 add_player(1: i32 score, 2: string uuid, 3: string username, 4: string photo, 5: string channel_name),
}