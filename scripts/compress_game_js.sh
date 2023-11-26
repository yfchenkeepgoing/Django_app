# 本脚本的目的是将src中所有的js文件合并起来放入dist中
#! /bin/bash

JS_PATH=/home/acs/acapp/game/static/js/
JS_PATH_DIST=$JS_PATH/dist/
JS_PATH_SRC=$JS_PATH/src/

# 找到当前目录下的所有文件, find /path/to/directory/ -name '*.py'：搜索某个文件路径下的所有*.py文件
# -type f是找所有文件，为了保证每次打包的顺序不会乱，按照字典序sort一遍
# xargs cat为将文件的所有内容统一输出到标准输出中，再将标准输出中的内容统一写入JS_PATH_SRC中
find $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat > $JS_PATH_DIST/game.js

# 用新的static文件覆盖掉原来的static文件，并利用管道自动输入yes
echo yes | python3 manage.py collectstatic
