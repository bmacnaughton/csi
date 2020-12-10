#!/usr/bin/bash

# site: CSI_PORT=3000 CSI_BE_IP=localhost:4000
# backend: CSI_PORT=4000 CSI_CONTRAST_ACTIVE=false

server=$1
pretend=$2

case $server in
  "site")
    csi_port=${CSI_PORT:-3000}
    csi_be_ip=${CSI_BE_IP-localhost:4000/csi}

    [ -n "$csi_be_ip" ] && be_text=" (backend $csi_be_ip)"

    if [ -z "$pretend" ]; then
      echo "starting website at localhost:${csi_port}${be_text}"
      CSI_PORT=$csi_port CSI_BE_IP=$csi_be_ip node index.js
    else
      echo "pretending to start site at localhost:${csi_port}${be_text}"
    fi
  ;;
  "backend")
    csi_port=${CSI_PORT:-4000}


    if [ -z "$pretend" ]; then
      echo "starting backend at localhost:${csi_port}"
      CSI_PORT=$csi_port CSI_CONTRAST_ACTIVE=false node index.js
    else
      echo "pretending to start backend at localhost:${csi_port}"
    fi

  ;;
  *)
    echo "start with defaults:"
    echo "  ./start-server.sh"
  ;;

esac
