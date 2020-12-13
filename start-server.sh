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
    echo ""
    echo "  ./start-server.sh koa-app"
    echo "   defaults: APP_PORT=3000 APP_BE_IP=localhost:4000/api"
    echo ""
    echo "   ./start-server.sh csi-server"
    echo "    defaults: CSI_PORT=4000"
    echo ""
    echo "override defaults or supply additional options via environment variables,"
    echo "e.g. APP_LOG_FILE=logfile.text APP_BE_IP= ./start-server.sh koa-app to"
    echo "suppress sending data to a backend server but add output to a log file."
  ;;

esac
