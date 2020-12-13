#!/usr/bin/bash

#
# provides defaults for key options. Others can be used added with env vars.
# see the server's configuration.js files.
#

server=$1
pretend=$2

case $server in
  "koa-app")
    x=${APP_PORT:=3000}
    x=${APP_BE_IP=localhost:4000/api}

    [ -n "$APP_BE_IP" ] && be_text=" (backend $APP_BE_IP)"

    if [ -z "$pretend" ]; then
      echo "starting website at localhost:${APP_PORT}${be_text}"
      APP_PORT=$APP_PORT APP_BE_IP=$APP_BE_IP node koa-app/index.js
    else
      echo "pretending to start site at localhost:${APP_PORT}${be_text}"
    fi
  ;;

  "csi-server")
    # shellcheck disable=SC2034
    x=${CSI_PORT=4000}

    if [ -z "$pretend" ]; then
      echo "starting backend at localhost:${CSI_PORT}"
      CSI_PORT=$CSI_PORT node csi-server/index.js
    else
      echo "pretending to start backend at localhost:${CSI_PORT}"
    fi
  ;;

  *)
    echo "start with defaults:"
    echo "  ./start-server.sh"
  ;;

esac
