#!/usr/bin/bash


server=$1
pretend=$2

case $server in
  "koa-app")
    app_port=${APP_PORT:-3000}
    app_be_ip=${APP_BE_IP-localhost:4000/api}

    [ -n "$app_be_ip" ] && be_text=" (backend $app_be_ip)"

    if [ -z "$pretend" ]; then
      echo "starting website at localhost:${app_port}${be_text}"
      APP_PORT=$csi_port APP_BE_IP=$app_be_ip node koa-app/index.js
    else
      echo "pretending to start site at localhost:${app_port}${be_text}"
    fi
  ;;

  "csi-server")
    csi_port=${CSI_PORT:-4000}

    if [ -z "$pretend" ]; then
      echo "starting backend at localhost:${csi_port}"
      CSI_PORT=$csi_port node csi-server/index.js
    else
      echo "pretending to start backend at localhost:${csi_port}"
    fi
  ;;

  *)
    echo "start with defaults:"
    echo "  ./start-server.sh"
  ;;

esac
