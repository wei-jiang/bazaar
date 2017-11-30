#!/bin/bash

tar --exclude='./node_modules' --exclude='./.vscode' --exclude='./relkub.sh' \
 --exclude='./bazaar.tar.gz' --exclude='./.git' --exclude='*.map' \
 -zcvf bazaar.tar.gz . 

CMD=$(cat <<-END
set -x
cd /data/apps/bazaar
tar zxvf ./bazaar.tar.gz -C .
npm i
#node app.js
forever stop app.js
forever start app.js
END
)

scp ./bazaar.tar.gz kub:/data/apps/bazaar/
ssh kub "$CMD"